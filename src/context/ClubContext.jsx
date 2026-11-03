import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_COURTS,
  INITIAL_COACHES,
  INITIAL_MENU_ITEMS,
  INITIAL_GYM_PLANS,
  INITIAL_TOURNAMENTS,
  INITIAL_BOOKINGS,
  INITIAL_TABS,
  INITIAL_PLAYERS
} from './initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAllClubData,
  dbCreateBookingAndTab,
  dbUpdateBookingStatus,
  dbUpdateBooking,
  dbAdjustTabItem,
  dbUpdateTabEquipment,
  dbUpdateCourtRate,
  dbUpdateMenuItem,
  dbAddMenuItem,
  fetchPricingConfig,
  fetchStaffRole,
  requestBooking,
  rpcSettleTab,
  rpcPayTab,
  dbOpenWalkinTab,
  dbUpdateClubSettings,
  dbUpdateCourt,
  dbInsertGymApplication,
  dbInsertTournamentRegistration,
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

const LEGACY_STATUS = {
  'Solicitud Pendiente': 'Pendiente',
  'Seña Pendiente': 'Pendiente',
  'En Cancha': 'Jugando',
  'En Pista': 'Jugando'
};

// Seed data and older caches use "HH:MM - HH:MM" slots and the old status names
const upgradeLegacyBooking = (b) => {
  if (b.startTime && b.durationMinutes) return { ...b, status: LEGACY_STATUS[b.status] || b.status };
  const [start, end] = String(b.timeSlot || '07:00 - 08:00').split(' - ');
  let duration = toMinutes(end) - toMinutes(start);
  if (duration <= 0) duration += 24 * 60;
  return {
    ...b,
    startTime: start,
    endTime: end,
    durationMinutes: duration,
    status: LEGACY_STATUS[b.status] || b.status
  };
};

// Local-only demo: `npm run dev` without Supabase and `?demo` opens the CRM with seed data
const DEMO_STAFF = import.meta.env.DEV && !isSupabaseConfigured()
  && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');

export function ClubProvider({ children }) {
  // Load state from localStorage or initial seed
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, bookings: (parsed.bookings || []).map(upgradeLegacyBooking) };
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
      bookings: INITIAL_BOOKINGS.map(upgradeLegacyBooking),
      tabs: INITIAL_TABS,
      players: INITIAL_PLAYERS,
      gymApplications: [],
      tournamentRegistrations: []
    };
  });

  const [selectedDate, setSelectedDate] = useState(() => clubNow().date);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [user, setUser] = useState(DEMO_STAFF ? { id: 'demo-owner', email: 'demo@local' } : null);
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
    if (DEMO_STAFF) {
      setUserRole(new URLSearchParams(window.location.search).get('demo') === 'reception' ? 'reception' : 'owner');
    } else if (user && user.id) {
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
        } else if (item.type === 'GYM_APPLICATION') {
          await dbInsertGymApplication(item.app);
        } else if (item.type === 'TOURNAMENT_REGISTRATION') {
          await dbInsertTournamentRegistration(item.reg);
        } else if (item.type === 'UPDATE_SETTINGS') {
          await dbUpdateClubSettings(item.patch);
        } else if (item.type === 'UPDATE_COURT') {
          await dbUpdateCourt(item.courtId, item.patch);
        } else if (item.type === 'OPEN_WALKIN_TAB') {
          await dbOpenWalkinTab(item.tabId, item.clientName);
        } else if (item.type === 'UPDATE_BOOKING') {
          await dbUpdateBooking(item.bookingId, item.patch);
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

  // Live KPIs for the selected day
  const kpis = useMemo(() => {
    const ACTIVE = ['Pendiente', 'Confirmada', 'Jugando', 'Finalizada'];
    const dayBookings = data.bookings.filter(b => b.date === selectedDate && b.category !== 'Bloqueo');
    const activeBookings = dayBookings.filter(b => ACTIVE.includes(b.status));
    const operationalCourts = data.courts.filter(c => c.status === 'operational').length;
    const openMinutes = Math.max(0, (Number(pricingConfig.closeHour) - Number(pricingConfig.openHour)) * 60);
    const capacityMinutes = operationalCourts * openMinutes;
    const bookedMinutes = activeBookings.reduce((sum, b) => sum + (b.durationMinutes || 60), 0);
    const occupancyRate = capacityMinutes > 0 ? Math.min(100, Math.round((bookedMinutes / capacityMinutes) * 100)) : 0;

    // Revenue counts tabs cashed on the selected day (club time)
    let totalRevenueToday = 0;
    let courtRevenueToday = 0;
    let barRevenueToday = 0;
    let openTabsTotal = 0;

    data.tabs.forEach(tab => {
      const { itemsTotal, courtBase, racketCharge, ballTubeCharge, netPending } = calculateTabBalances(tab);
      if (tab.status === 'settled' && tab.cashedDate === selectedDate) {
        totalRevenueToday += courtBase + racketCharge + ballTubeCharge + itemsTotal;
        courtRevenueToday += courtBase + racketCharge + ballTubeCharge;
        barRevenueToday += itemsTotal;
      } else if (tab.status === 'open') {
        openTabsTotal += netPending;
      }
    });

    return {
      totalRevenueToday,
      courtRevenueToday,
      barRevenueToday,
      occupancyRate,
      openTabsTotal,
      pendingRequestsCount: data.bookings.filter(b => b.status === 'Pendiente' && b.date >= clubNow().date).length,
      barTableRequestsCount: activeBookings.filter(b => b.barTableRequested).length,
      courtsInPlayCount: dayBookings.filter(b => b.status === 'Jugando').length,
      activeBookingsCount: activeBookings.length,
      bookedMinutes,
      capacityMinutes
    };
  }, [data.bookings, data.tabs, data.courts, selectedDate, calculateTabBalances, pricingConfig]);

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
          // Mirrors trg_booking_close_tab: no charge for cancelled or no-show bookings
          if (['Cancelada', 'No vino'].includes(newStatus) && tab.status === 'open') {
            updatedTab.status = 'cancelled';
          }
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

  const updateBooking = (bookingId, patch) => {
    const court = patch.courtId ? data.courts.find(c => c.id === patch.courtId) : null;
    const fullPatch = court ? { ...patch, courtName: court.name } : patch;

    setData(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => {
        if (b.id !== bookingId) return b;
        const next = { ...b, ...patch };
        next.endTime = fromMinutes(toMinutes(next.startTime) + next.durationMinutes);
        next.timeSlot = `${next.startTime} - ${next.endTime}`;
        return next;
      }),
      tabs: prev.tabs.map(t => {
        if (t.linkedBookingId !== bookingId) return t;
        return {
          ...t,
          ...(court ? { courtId: court.id, courtName: court.name } : {}),
          ...(patch.courtAmount !== undefined ? { courtAmount: Number(patch.courtAmount) } : {}),
          ...(patch.clientName !== undefined ? { clientName: patch.clientName } : {})
        };
      })
    }));

    persistMutation(
      () => dbUpdateBooking(bookingId, fullPatch),
      { type: 'UPDATE_BOOKING', bookingId, patch: fullPatch }
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

  // Money is only recorded when the server accepts it, so this never goes through the offline queue
  const payTab = async (tabId, payments, invoice = {}) => {
    if (isSupabaseConfigured()) {
      try {
        await rpcPayTab(tabId, payments, invoice);
      } catch (err) {
        throw new Error(describeServerError(err));
      }
    }
    const paidTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const methods = [...new Set(payments.map(p => p.method))];
    setData(prev => {
      const tab = prev.tabs.find(t => t.id === tabId);
      const net = tab ? calculateTabBalances(tab).netPending : paidTotal;
      return {
        ...prev,
        tabs: prev.tabs.map(t => t.id === tabId ? {
          ...t,
          status: 'settled',
          activityStatus: 'liquidada',
          paymentMethod: methods.length > 1 ? 'Mixto' : methods[0],
          settledAt: fromMinutes(clubNow().minutes),
          cashedDate: clubNow().date,
          changeGiven: Math.max(0, paidTotal - net),
          invoiceRuc: invoice.ruc || '',
          invoiceName: invoice.name || ''
        } : t),
        bookings: prev.bookings.map(b => (tab && b.id === tab.linkedBookingId && !['Cancelada', 'No vino'].includes(b.status))
          ? { ...b, status: 'Finalizada' } : b)
      };
    });
  };

  const openWalkinTab = (clientName) => {
    const tabId = `tab-walkin-${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const name = clientName?.trim() || 'Venta de barra';
    setData(prev => ({
      ...prev,
      tabs: [{
        id: tabId,
        linkedBookingId: null,
        courtId: null,
        courtName: null,
        clientName: name,
        courtAmount: 0,
        depositPaid: 0,
        racketCount: 0,
        racketUnitFee: pricingConfig.racketRentalFee,
        ballTubeCount: 0,
        ballTubeUnitFee: pricingConfig.ballTubeFee,
        items: [],
        status: 'open',
        activityStatus: 'en_barra',
        paymentMethod: null,
        barTableRequested: false,
        openedAt: fromMinutes(clubNow().minutes),
        isWalkin: true
      }, ...prev.tabs]
    }));
    persistMutation(() => dbOpenWalkinTab(tabId, name), { type: 'OPEN_WALKIN_TAB', tabId, clientName: name });
    return tabId;
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
    persistMutation(() => dbInsertTournamentRegistration(newReg), { type: 'TOURNAMENT_REGISTRATION', reg: newReg });

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
    persistMutation(() => dbInsertGymApplication(newApp), { type: 'GYM_APPLICATION', app: newApp });

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

  const updateClubSettings = (patch) => {
    setPricingConfig(prev => ({ ...prev, ...patch }));
    persistMutation(() => dbUpdateClubSettings(patch), { type: 'UPDATE_SETTINGS', patch });
  };

  const updateCourt = (courtId, patch) => {
    setData(prev => ({ ...prev, courts: prev.courts.map(c => (c.id === courtId ? { ...c, ...patch } : c)) }));
    persistMutation(() => dbUpdateCourt(courtId, patch), { type: 'UPDATE_COURT', courtId, patch });
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
        updateBooking,
        addItemToTab,
        updateTabItemQty,
        updateTabEquipment,
        settleTab,
        payTab,
        openWalkinTab,
        bookCoachClass,
        registerTournament,
        applyGymMembership,
        updateMenuItem,
        addMenuItem,
        updateCourtRate,
        updateClubSettings,
        updateCourt,
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
