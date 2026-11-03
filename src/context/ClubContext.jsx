import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_COURTS,
  INITIAL_COACHES,
  INITIAL_MENU_ITEMS,
  INITIAL_GYM_PLANS,
  INITIAL_TOURNAMENTS,
  INITIAL_BOOKINGS,
  INITIAL_TABS,
  INITIAL_PLAYERS,
  TIME_SLOTS
} from './initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAllClubData,
  dbCreateBookingAndTab,
  dbUpdateBookingStatus,
  dbAdjustTabItem,
  dbUpdateTabEquipment,
  dbUpdateCourtRate,
  dbUpdateMenuItem,
  dbAddMenuItem,
  fetchPricingConfig,
  fetchStaffRole,
  requestBooking,
  rpcSettleTab,
  isRetryableError,
  describeServerError
} from '../services/clubService';
import { calculateTabBalances as computeTabBalances } from '../utils/financeHelpers';
import { clubNow, toMinutes, fromMinutes } from '../utils/clubTime';
import { normalizePyPhone } from '../utils/phone';

const ClubContext = createContext();

const STORAGE_KEY = 'black_club_elite_prod_v1';
const PENDING_QUEUE_KEY = 'black_club_pending_queue';

const getInitialPendingQueue = () => {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export function ClubProvider({ children }) {
  // Load state from localStorage or initial seed
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      courts: INITIAL_COURTS,
      coaches: INITIAL_COACHES,
      menuItems: INITIAL_MENU_ITEMS,
      gymPlans: INITIAL_GYM_PLANS,
      tournaments: INITIAL_TOURNAMENTS,
      bookings: INITIAL_BOOKINGS,
      tabs: INITIAL_TABS,
      players: INITIAL_PLAYERS,
      gymApplications: [],
      tournamentRegistrations: []
    };
  });

  const [selectedDate, setSelectedDate] = useState(() => clubNow().date);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('anon'); // 'owner' | 'reception' | 'anon'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingQueue, setPendingQueue] = useState(getInitialPendingQueue);
  const [syncError, setSyncError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(typeof navigator !== 'undefined' && navigator.onLine ? 'synced' : 'offline');
  // Club settings; defaults mirror pricing_config and are replaced by the server values
  const [pricingConfig, setPricingConfig] = useState({
    racketRentalFee: 30000,
    ballTubeFee: 70000,
    bookingDepositPercent: 0,
    holdExpiresMinutes: 60,
    openHour: 7,
    closeHour: 24,
    slotStepMinutes: 30,
    bookingWindowDays: 14,
    cancelNoticeHours: 3
  });

  // Fetch Pricing Config on startup
  useEffect(() => {
    fetchPricingConfig().then(cfg => {
      if (cfg) setPricingConfig(prev => ({ ...prev, ...cfg }));
    });
  }, []);

  // Fetch Staff Role when user changes
  useEffect(() => {
    if (user && user.id) {
      fetchStaffRole(user.id).then(role => setUserRole(role));
    } else {
      setUserRole('anon');
    }
  }, [user]);

  // Initialize and subscribe to Supabase Auth state changes
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signInStaff = async (email, password) => {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase no está configurado');
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    setUser(authData.user);
    setSession(authData.session);
    return authData;
  };

  const signOutStaff = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setUserRole('anon');
  };

  // Sync data from Supabase
  const syncFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingDb(true);
    const dbData = await fetchAllClubData();
    if (dbData) {
      setData(prev => ({
        ...prev,
        ...dbData
      }));
      setIsSupabaseLive(true);
    }
    setIsLoadingDb(false);
  }, []);

  // Enqueue failed or offline mutation
  const enqueueMutation = useCallback((mutation) => {
    const current = getInitialPendingQueue();
    const updated = [...current, { ...mutation, enqueuedAt: Date.now() }];
    try {
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setPendingQueue(updated);
    setSyncStatus(navigator.onLine ? 'pending' : 'offline');
  }, []);

  const clearSyncError = useCallback(() => setSyncError(null), []);

  // A write the server rejected: tell the user and reload so the optimistic change is undone
  const reportServerRejection = useCallback((err) => {
    console.error('[Supabase] Write rejected:', err);
    setSyncError(describeServerError(err));
    syncFromSupabase();
  }, [syncFromSupabase]);

  // Run a write now when online; queue it on network failure, surface server rejections
  const persistMutation = useCallback((run, mutation, onSuccess) => {
    if (!isSupabaseConfigured()) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueMutation(mutation);
      return;
    }
    run()
      .then(result => onSuccess?.(result))
      .catch(err => {
        if (isRetryableError(err)) {
          enqueueMutation(mutation);
        } else {
          reportServerRejection(err);
        }
      });
  }, [enqueueMutation, reportServerRejection]);

  // Offline queue worker
  const processPendingQueue = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    if (!isSupabaseConfigured()) return;

    const currentQueue = getInitialPendingQueue();
    if (currentQueue.length === 0) {
      setSyncStatus('synced');
      return;
    }

    setSyncStatus('pending');
    const remaining = [];

    for (const item of currentQueue) {
      try {
        if (item.type === 'CREATE_BOOKING') {
          await dbCreateBookingAndTab(item.newBooking, item.newTab);
        } else if (item.type === 'UPDATE_STATUS') {
          await dbUpdateBookingStatus(item.bookingId, item.newStatus, item.depositAmount);
        } else if (item.type === 'ADJUST_TAB_ITEM') {
          await dbAdjustTabItem(item.tabId, item.menuItemId, item.delta);
        } else if (item.type === 'ADD_TAB_ITEM') {
          await dbAdjustTabItem(item.tabId, item.menuItem.id, item.qty);
        } else if (item.type === 'UPDATE_EQUIPMENT') {
          await dbUpdateTabEquipment(item.tabId, item.equipment);
        } else if (item.type === 'SETTLE_TAB') {
          await rpcSettleTab(item.tabId, item.paymentMethod);
        } else if (item.type === 'UPDATE_COURT_RATE') {
          await dbUpdateCourtRate(item.courtId, item.newRate, item.newPrimeRate);
        } else if (item.type === 'UPDATE_MENU_ITEM') {
          await dbUpdateMenuItem(item.updatedItem);
        } else if (item.type === 'ADD_MENU_ITEM') {
          await dbAddMenuItem(item.newItem);
        }
      } catch (err) {
        if (isRetryableError(err)) {
          console.warn('[Queue Worker] Failed mutation, retaining for retry:', item, err);
          remaining.push(item);
        } else {
          console.error('[Queue Worker] Server rejected queued mutation, dropping:', item, err);
          setSyncError(describeServerError(err));
        }
      }
    }

    try {
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(remaining));
    } catch {
      // ignore
    }
    setPendingQueue(remaining);
    setSyncStatus(remaining.length === 0 ? 'synced' : 'pending');

    if (remaining.length === 0) {
      syncFromSupabase();
    }
  }, [syncFromSupabase]);

  // Online / offline window listeners
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('pending');
      processPendingQueue();
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processPendingQueue]);

  // Connect to Supabase & Realtime updates on mount with 400ms debounce
  useEffect(() => {
    if (isSupabaseConfigured()) {
      syncFromSupabase();

      let debounceTimer = null;
      const debouncedSync = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          syncFromSupabase();
        }, 400);
      };

      // Subscribe to real-time changes on public schema
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            debouncedSync();
          }
        )
        .subscribe();

      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        supabase.removeChannel(channel);
      };
    }
  }, [syncFromSupabase]);

  // Re-sync when staff signs in or out: visible data depends on the session
  const userId = user?.id;
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    syncFromSupabase();
    // Realtime only delivers rows the viewer can read, so public visitors poll slot occupancy
    if (userId) return;
    const timer = setInterval(syncFromSupabase, 60000);
    return () => clearInterval(timer);
  }, [userId, syncFromSupabase]);

  // Save to localStorage on change as cache fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  // Tab calculations helper using shared finance helper
  const calculateTabBalances = useCallback((tab) => computeTabBalances(tab, pricingConfig), [pricingConfig]);

  // Live KPIs Calculation
  const kpis = useMemo(() => {
    const todayBookings = data.bookings.filter(b => b.date === selectedDate);
    const totalSlotsPossible = data.courts.length * TIME_SLOTS.length; // 3 * 17
    const activeBookingsCount = todayBookings.filter(b => b.status !== 'Cancelada').length;
    const occupancyRate = totalSlotsPossible > 0
      ? Math.round((activeBookingsCount / totalSlotsPossible) * 100)
      : 0;

    // Financials
    let totalRevenueToday = 0;
    let courtRevenueToday = 0;
    let barRevenueToday = 0;
    let openTabsTotal = 0;

    data.tabs.forEach(tab => {
      const { itemsTotal, courtBase, depositDeduction, racketCharge, ballTubeCharge, netPending } = calculateTabBalances(tab);
      
      if (tab.status === 'settled') {
        totalRevenueToday += (courtBase + racketCharge + ballTubeCharge + itemsTotal);
        courtRevenueToday += (courtBase + racketCharge + ballTubeCharge);
        barRevenueToday += itemsTotal;
      } else if (tab.status === 'open') {
        totalRevenueToday += depositDeduction;
        courtRevenueToday += depositDeduction;
        openTabsTotal += netPending;
      }
    });

    const pendingDepositsCount = todayBookings.filter(b => b.status === 'Seña Pendiente').length;
    const barTableRequestsCount = todayBookings.filter(b => b.barTableRequested && b.status !== 'Cancelada').length;
    const courtsInPlayCount = todayBookings.filter(b => b.status === 'En Cancha' || b.status === 'En Pista').length;

    return {
      totalRevenueToday,
      courtRevenueToday,
      barRevenueToday,
      occupancyRate,
      openTabsTotal,
      pendingDepositsCount,
      barTableRequestsCount,
      courtsInPlayCount,
      activeBookingsCount,
      totalSlotsPossible
    };
  }, [data.bookings, data.tabs, data.courts, selectedDate, calculateTabBalances]);

  // Actions
  // Accepts { startTime, durationMinutes } or a legacy "HH:MM - HH:MM" timeSlot
  const resolveSchedule = (bookingData) => {
    if (bookingData.startTime && bookingData.durationMinutes) {
      return { startTime: bookingData.startTime, durationMinutes: Number(bookingData.durationMinutes) };
    }
    const [start, end] = String(bookingData.timeSlot || '').split(' - ');
    let duration = toMinutes(end) - toMinutes(start);
    if (duration <= 0) duration += 24 * 60;
    return { startTime: start, durationMinutes: duration || 60 };
  };

  const createBooking = async (bookingData) => {
    const date = bookingData.date || selectedDate;
    const { startTime, durationMinutes } = resolveSchedule(bookingData);

    // Public visitors: the server validates hours, price and overlaps
    if (!user) {
      if (!isSupabaseConfigured()) {
        throw new Error('Las reservas online no están disponibles en este momento.');
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Sin conexión a internet. Revisá tu conexión e intentá de nuevo.');
      }
      try {
        return await requestBooking({
          courtId: bookingData.courtId,
          date,
          startTime,
          durationMinutes,
          clientName: bookingData.clientName,
          clientPhone: bookingData.clientPhone,
          rentedRackets: Number(bookingData.rentedRackets) || 0,
          ballTubes: Number(bookingData.ballTubes) || 0,
          barTableRequested: Boolean(bookingData.barTableRequested)
        });
      } catch (err) {
        throw new Error(describeServerError(err));
      }
    }

    // Staff: optimistic insert, persisted through create_staff_booking
    const court = data.courts.find(c => c.id === bookingData.courtId);
    const isBlock = bookingData.category === 'Bloqueo';
    const courtAmount = isBlock
      ? 0
      : bookingData.courtAmount ?? Math.round((court ? court.rate : 0) * durationMinutes / 60);
    const uid = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const newBookingId = `book-${uid}`;
    const newTabId = isBlock ? null : `tab-${uid}`;
    const phone = normalizePyPhone(bookingData.clientPhone) || '';
    const endTime = fromMinutes(toMinutes(startTime) + durationMinutes);

    const newBooking = {
      id: newBookingId,
      code: '…',
      courtId: bookingData.courtId,
      date,
      startTime,
      endTime,
      durationMinutes,
      timeSlot: `${startTime} - ${endTime}`,
      clientName: bookingData.clientName,
      clientPhone: phone,
      category: bookingData.category || 'Reserva Estándar',
      status: 'Confirmada',
      courtAmount,
      depositPaid: 0,
      barTableRequested: !!bookingData.barTableRequested,
      rentedRackets: Number(bookingData.rentedRackets) || 0,
      ballTubes: Number(bookingData.ballTubes) || 0,
      linkedTabId: newTabId,
      notes: bookingData.notes || '',
      createdAt: fromMinutes(clubNow().minutes)
    };

    const newTab = isBlock ? null : {
      id: newTabId,
      linkedBookingId: newBookingId,
      courtId: bookingData.courtId,
      courtName: court ? court.name : 'Cancha',
      clientName: bookingData.clientName,
      courtAmount,
      depositPaid: 0,
      racketCount: newBooking.rentedRackets,
      racketUnitFee: pricingConfig.racketRentalFee,
      ballTubeCount: newBooking.ballTubes,
      ballTubeUnitFee: pricingConfig.ballTubeFee,
      items: [],
      status: 'open',
      activityStatus: 'en_cancha',
      paymentMethod: null,
      barTableRequested: newBooking.barTableRequested,
      openedAt: newBooking.createdAt
    };

    setData(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      tabs: newTab ? [newTab, ...prev.tabs] : prev.tabs
    }));

    persistMutation(
      () => dbCreateBookingAndTab(newBooking, newTab),
      { type: 'CREATE_BOOKING', newBooking, newTab },
      // The server assigns the definitive booking code
      (result) => {
        if (!result) return;
        setData(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => b.id === newBooking.id ? { ...b, code: result.code, status: result.status } : b)
        }));
      }
    );

    return newBooking;
  };

  const updateBookingStatus = (bookingId, newStatus, depositAmount) => {
    setData(prev => {
      const updatedBookings = prev.bookings.map(b => {
        if (b.id === bookingId) {
          const updated = { ...b, status: newStatus };
          if (depositAmount !== undefined) {
            updated.depositPaid = Number(depositAmount);
          }
          return updated;
        }
        return b;
      });

      const updatedTabs = prev.tabs.map(tab => {
        if (tab.linkedBookingId === bookingId) {
          const updatedTab = { ...tab };
          if (depositAmount !== undefined) {
            updatedTab.depositPaid = Number(depositAmount);
          }
          return updatedTab;
        }
        return tab;
      });

      return {
        ...prev,
        bookings: updatedBookings,
        tabs: updatedTabs
      };
    });

    persistMutation(
      () => dbUpdateBookingStatus(bookingId, newStatus, depositAmount),
      { type: 'UPDATE_STATUS', bookingId, newStatus, depositAmount }
    );
  };

  const addItemToTab = (tabId, menuItem, qty = 1) => {
    setData(prev => {
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.id === tabId) {
          const existingItemIndex = tab.items.findIndex(i => (i.menuItemId || i.id) === menuItem.id);
          let newItems = [...tab.items];
          if (existingItemIndex >= 0) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              qty: newItems[existingItemIndex].qty + qty
            };
          } else {
            newItems.push({
              id: menuItem.id,
              menuItemId: menuItem.id,
              name: menuItem.name,
              price: menuItem.price,
              qty: qty
            });
          }
          return { ...tab, items: newItems };
        }
        return tab;
      });
      return { ...prev, tabs: updatedTabs };
    });

    persistMutation(
      () => dbAdjustTabItem(tabId, menuItem.id, qty),
      { type: 'ADJUST_TAB_ITEM', tabId, menuItemId: menuItem.id, delta: qty }
    );
  };

  const updateTabItemQty = (tabId, itemId, delta) => {
    const tab = data.tabs.find(t => t.id === tabId);
    const item = tab?.items.find(i => i.id === itemId);
    if (!item) return;
    const menuItemId = item.menuItemId || item.id;

    setData(prev => {
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.id === tabId) {
          const newItems = tab.items
            .map(item => {
              if (item.id === itemId) {
                const newQty = item.qty + delta;
                return newQty > 0 ? { ...item, qty: newQty } : null;
              }
              return item;
            })
            .filter(Boolean);
          return { ...tab, items: newItems };
        }
        return tab;
      });
      return { ...prev, tabs: updatedTabs };
    });

    persistMutation(
      () => dbAdjustTabItem(tabId, menuItemId, delta),
      { type: 'ADJUST_TAB_ITEM', tabId, menuItemId, delta }
    );
  };

  const updateTabEquipment = (tabId, { racketCount, ballTubeCount }) => {
    setData(prev => {
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.id === tabId) {
          return {
            ...tab,
            racketCount: racketCount !== undefined ? racketCount : tab.racketCount,
            ballTubeCount: ballTubeCount !== undefined ? ballTubeCount : tab.ballTubeCount
          };
        }
        return tab;
      });
      return { ...prev, tabs: updatedTabs };
    });

    persistMutation(
      () => dbUpdateTabEquipment(tabId, { racketCount, ballTubeCount }),
      { type: 'UPDATE_EQUIPMENT', tabId, equipment: { racketCount, ballTubeCount } }
    );
  };

  const settleTab = (tabId, paymentMethod = 'Tarjeta') => {
    const nowTime = new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });

    setData(prev => {
      let linkedBookingId = null;
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.id === tabId) {
          linkedBookingId = tab.linkedBookingId;
          return {
            ...tab,
            status: 'settled',
            activityStatus: 'liquidada',
            paymentMethod,
            settledAt: nowTime
          };
        }
        return tab;
      });

      const updatedBookings = prev.bookings.map(b => {
        if (b.id === linkedBookingId || b.linkedTabId === tabId) {
          return { ...b, status: 'Finalizada' };
        }
        return b;
      });

      return {
        ...prev,
        tabs: updatedTabs,
        bookings: updatedBookings
      };
    });

    persistMutation(
      () => rpcSettleTab(tabId, paymentMethod),
      { type: 'SETTLE_TAB', tabId, paymentMethod }
    );
  };

  const bookCoachClass = ({ coachId, date, timeSlot, clientName, clientPhone }) => {
    const coach = data.coaches.find(c => c.id === coachId);
    if (!coach) throw new Error('Entrenador no encontrado');

    const courtId = coach.defaultCourtId || 'court-1';

    return createBooking({
      courtId,
      date: date || selectedDate,
      timeSlot,
      clientName: `${clientName} (Clase con ${coach.name})`,
      clientPhone,
      category: 'Clase BlackTeam',
      courtAmount: coach.rate,
      depositPaid: Math.round(coach.rate * 0.5),
      barTableRequested: false,
      rentedRackets: 0,
      ballTubes: 1
    });
  };

  const registerTournament = ({ tournamentId, pairName, player1, player2, phone, category }) => {
    const regId = `reg-${Date.now()}`;
    const newReg = {
      id: regId,
      tournamentId,
      pairName,
      player1,
      player2,
      phone,
      category,
      timestamp: new Date().toISOString()
    };

    setData(prev => {
      const updatedTournaments = prev.tournaments.map(t => {
        if (t.id === tournamentId) {
          return {
            ...t,
            registeredCount: Math.min(t.slots, t.registeredCount + 1)
          };
        }
        return t;
      });

      return {
        ...prev,
        tournaments: updatedTournaments,
        tournamentRegistrations: [newReg, ...prev.tournamentRegistrations]
      };
    });

    return newReg;
  };

  const applyGymMembership = ({ planId, clientName, clientPhone, email }) => {
    const newApp = {
      id: `gym-app-${Date.now()}`,
      planId,
      clientName,
      clientPhone,
      email,
      date: new Date().toLocaleDateString('es-PY')
    };

    setData(prev => ({
      ...prev,
      gymApplications: [newApp, ...prev.gymApplications]
    }));

    return newApp;
  };

  const updateMenuItem = (updatedItem) => {
    setData(prev => ({
      ...prev,
      menuItems: prev.menuItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    }));

    persistMutation(
      () => dbUpdateMenuItem(updatedItem),
      { type: 'UPDATE_MENU_ITEM', updatedItem }
    );
  };

  const addMenuItem = (newItem) => {
    const itemWithId = {
      id: newItem.id || `menu-${Date.now()}`,
      name: newItem.name,
      category: newItem.category || 'Hidratación & Bebidas',
      description: newItem.description || '',
      price: Number(newItem.price || 0),
      stock: Number(newItem.stock !== undefined ? newItem.stock : 50),
      available: Boolean(newItem.available !== false),
      tag: newItem.tag || ''
    };

    setData(prev => ({
      ...prev,
      menuItems: [itemWithId, ...prev.menuItems]
    }));

    persistMutation(
      () => dbAddMenuItem(itemWithId),
      { type: 'ADD_MENU_ITEM', newItem: itemWithId }
    );

    return itemWithId;
  };

  const updateCourtRate = (courtId, newRate, newPrimeRate) => {
    setData(prev => ({
      ...prev,
      courts: prev.courts.map(c => c.id === courtId ? {
        ...c,
        rate: Number(newRate),
        primeRate: newPrimeRate !== undefined && newPrimeRate !== null ? Number(newPrimeRate) : c.primeRate
      } : c)
    }));

    persistMutation(
      () => dbUpdateCourtRate(courtId, newRate, newPrimeRate),
      { type: 'UPDATE_COURT_RATE', courtId, newRate, newPrimeRate }
    );
  };

  const resetToSeedData = () => {
    setData({
      courts: INITIAL_COURTS,
      coaches: INITIAL_COACHES,
      menuItems: INITIAL_MENU_ITEMS,
      gymPlans: INITIAL_GYM_PLANS,
      tournaments: INITIAL_TOURNAMENTS,
      bookings: INITIAL_BOOKINGS,
      tabs: INITIAL_TABS,
      players: INITIAL_PLAYERS,
      gymApplications: [],
      tournamentRegistrations: []
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ClubContext.Provider
      value={{
        courts: data.courts,
        coaches: data.coaches,
        menuItems: data.menuItems,
        gymPlans: data.gymPlans,
        tournaments: data.tournaments,
        bookings: data.bookings,
        tabs: data.tabs,
        players: data.players,
        timeSlots: TIME_SLOTS,
        selectedDate,
        setSelectedDate,
        kpis,
        isSupabaseLive,
        isLoadingDb,
        user,
        session,
        userRole,
        syncStatus,
        pendingCount: pendingQueue.length,
        pricingConfig,
        retrySync: processPendingQueue,
        syncError,
        clearSyncError,
        isStaffAuthenticated: Boolean(user),
        showAuthModal,
        setShowAuthModal,
        signInStaff,
        signOutStaff,
        calculateTabBalances,
        createBooking,
        updateBookingStatus,
        addItemToTab,
        updateTabItemQty,
        updateTabEquipment,
        settleTab,
        bookCoachClass,
        registerTournament,
        applyGymMembership,
        updateMenuItem,
        addMenuItem,
        updateCourtRate,
        resetToSeedData
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
}
