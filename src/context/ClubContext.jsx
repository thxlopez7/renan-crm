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
  TIME_SLOTS,
  getTodayDateString
} from './initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAllClubData,
  dbCreateBookingAndTab,
  dbUpdateBookingStatus,
  dbAddTabItem,
  dbUpdateTabEquipment,
  dbSettleTab,
  dbUpdateCourtRate,
  dbUpdateMenuItem,
  fetchPricingConfig,
  fetchStaffRole,
  rpcCreatePublicBooking,
  rpcSettleTab
} from '../services/clubService';
import { calculateTabBalances as computeTabBalances } from '../utils/financeHelpers';

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

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('anon'); // 'owner' | 'reception' | 'anon'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingQueue, setPendingQueue] = useState(getInitialPendingQueue);
  const [syncStatus, setSyncStatus] = useState(typeof navigator !== 'undefined' && navigator.onLine ? 'synced' : 'offline');
  const [pricingConfig, setPricingConfig] = useState({
    dayRateDefault: 160000,
    primeRateDefault: 200000,
    primeStartHour: '17:00:00',
    racketRentalFee: 30000,
    ballTubeFee: 70000,
    bookingDepositPercent: 50,
    holdExpiresMinutes: 30
  });

  // Fetch Pricing Config on startup
  useEffect(() => {
    fetchPricingConfig().then(cfg => {
      if (cfg) setPricingConfig(cfg);
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
          await dbCreateBookingAndTab(item.bookingData, item.newBooking, item.newTab);
        } else if (item.type === 'UPDATE_STATUS') {
          await dbUpdateBookingStatus(item.bookingId, item.newStatus, item.depositAmount);
        } else if (item.type === 'ADD_TAB_ITEM') {
          await dbAddTabItem(item.tabId, item.menuItem, item.qty);
        } else if (item.type === 'UPDATE_EQUIPMENT') {
          await dbUpdateTabEquipment(item.tabId, item.equipment);
        } else if (item.type === 'SETTLE_TAB') {
          try {
            await rpcSettleTab(item.tabId, item.paymentMethod);
          } catch {
            await dbSettleTab(item.tabId, item.paymentMethod);
          }
        } else if (item.type === 'UPDATE_COURT_RATE') {
          await dbUpdateCourtRate(item.courtId, item.newRate);
        } else if (item.type === 'UPDATE_MENU_ITEM') {
          await dbUpdateMenuItem(item.updatedItem);
        }
      } catch (err) {
        console.warn('[Queue Worker] Failed mutation, retaining for retry:', item, err);
        remaining.push(item);
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

  // Save to localStorage on change as cache fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  // Tab calculations helper using shared finance helper
  const calculateTabBalances = (tab) => computeTabBalances(tab, pricingConfig);

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
  }, [data.bookings, data.tabs, data.courts, selectedDate]);

  // Actions
  const createBooking = async (bookingData) => {
    const isPublicUser = !user;

    const court = data.courts.find(c => c.id === bookingData.courtId);
    const courtAmount = bookingData.courtAmount || (court ? court.rate : 160000);
    const depositPercent = pricingConfig.bookingDepositPercent || 50;
    const depositPaid = bookingData.depositPaid !== undefined 
      ? bookingData.depositPaid 
      : Math.round(courtAmount * (depositPercent / 100));

    // If public user and online Supabase is available, call transactional RPC
    if (isPublicUser && isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const rpcResult = await rpcCreatePublicBooking({
          courtId: bookingData.courtId,
          date: bookingData.date || selectedDate,
          timeSlot: bookingData.timeSlot,
          clientName: bookingData.clientName,
          clientPhone: bookingData.clientPhone,
          barTableRequested: Boolean(bookingData.barTableRequested),
          rentedRackets: Number(bookingData.rentedRackets) || 0,
          ballTubes: Number(bookingData.ballTubes) || 0
        });

        const newBooking = {
          id: rpcResult.id,
          code: rpcResult.code,
          courtId: rpcResult.courtId,
          date: rpcResult.date,
          timeSlot: rpcResult.timeSlot,
          clientName: rpcResult.clientName,
          clientPhone: rpcResult.clientPhone,
          category: rpcResult.category || 'Reserva Estándar',
          status: rpcResult.status || 'Seña Pendiente',
          courtAmount: Number(rpcResult.courtAmount),
          depositPaid: Number(rpcResult.depositPaid),
          barTableRequested: Boolean(rpcResult.barTableRequested),
          rentedRackets: Number(rpcResult.rentedRackets),
          ballTubes: Number(rpcResult.ballTubes),
          linkedTabId: rpcResult.linkedTabId,
          createdAt: rpcResult.createdAt || new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
        };

        const newTab = {
          id: rpcResult.linkedTabId,
          linkedBookingId: rpcResult.id,
          courtId: rpcResult.courtId,
          courtName: court ? court.name : 'Cancha del Club',
          clientName: rpcResult.clientName,
          courtAmount: Number(rpcResult.courtAmount),
          depositPaid: Number(rpcResult.depositPaid),
          racketCount: Number(rpcResult.rentedRackets),
          racketUnitFee: pricingConfig.racketRentalFee || 30000,
          ballTubeCount: Number(rpcResult.ballTubes),
          ballTubeUnitFee: pricingConfig.ballTubeFee || 70000,
          items: [],
          status: 'open',
          activityStatus: 'en_cancha',
          paymentMethod: null,
          barTableRequested: Boolean(rpcResult.barTableRequested),
          openedAt: newBooking.createdAt
        };

        // Update local state immediately
        setData(prev => ({
          ...prev,
          bookings: [newBooking, ...prev.bookings],
          tabs: [newTab, ...prev.tabs]
        }));

        return newBooking;
      } catch (err) {
        console.error('[Public Booking RPC Error]', err);
        if (err.message && (err.message.includes('SLOT_ALREADY_BOOKED') || err.message.includes('23505') || err.code === '23505' || err.code === 'P0001')) {
          syncFromSupabase();
          throw new Error('Este turno acaba de ser reservado por otro cliente. Por favor elegí otro horario.');
        }
        if (err.message && err.message.includes('MAX_PENDING_REACHED')) {
          throw new Error('Has alcanzado el límite máximo de reservas pendientes de confirmación.');
        }
        if (err.message && err.message.includes('SLOT_PAST')) {
          throw new Error('No es posible reservar un turno en un horario que ya ha transcurrido.');
        }
        throw err;
      }
    }

    // Staff or Offline flow
    const bookingCode = `BC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingId = `book-${Date.now()}`;
    const newTabId = `tab-${Date.now()}`;

    const newBooking = {
      id: newBookingId,
      code: bookingCode,
      courtId: bookingData.courtId,
      date: bookingData.date || selectedDate,
      timeSlot: bookingData.timeSlot,
      clientName: bookingData.clientName,
      clientPhone: bookingData.clientPhone || '+595 981 000 000',
      category: bookingData.category || 'Reserva Estándar',
      status: depositPaid > 0 ? 'Confirmada' : 'Seña Pendiente',
      courtAmount,
      depositPaid,
      barTableRequested: !!bookingData.barTableRequested,
      rentedRackets: Number(bookingData.rentedRackets) || 0,
      ballTubes: Number(bookingData.ballTubes) || 0,
      linkedTabId: newTabId,
      createdAt: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })
    };

    const newTab = {
      id: newTabId,
      linkedBookingId: newBookingId,
      courtId: bookingData.courtId,
      courtName: court ? court.name : 'Cancha del Club',
      clientName: bookingData.clientName,
      courtAmount,
      depositPaid,
      racketCount: Number(bookingData.rentedRackets) || 0,
      racketUnitFee: pricingConfig.racketRentalFee || 30000,
      ballTubeCount: Number(bookingData.ballTubes) || 0,
      ballTubeUnitFee: pricingConfig.ballTubeFee || 70000,
      items: [],
      status: 'open',
      activityStatus: 'en_cancha',
      paymentMethod: null,
      barTableRequested: !!bookingData.barTableRequested,
      openedAt: newBooking.createdAt
    };

    // Add or update player in CRM directory
    const existingPlayerIndex = data.players.findIndex(
      p => p.name.toLowerCase() === bookingData.clientName.toLowerCase() || p.phone === bookingData.clientPhone
    );

    let updatedPlayers = [...data.players];
    if (existingPlayerIndex >= 0) {
      updatedPlayers[existingPlayerIndex] = {
        ...updatedPlayers[existingPlayerIndex],
        totalBookings: updatedPlayers[existingPlayerIndex].totalBookings + 1,
        totalSpent: updatedPlayers[existingPlayerIndex].totalSpent + courtAmount,
        lastVisit: 'Hoy, ' + bookingData.timeSlot.split(' - ')[0]
      };
    } else {
      updatedPlayers.push({
        id: `plr-${Date.now()}`,
        name: bookingData.clientName,
        phone: bookingData.clientPhone || '+595 981 000 000',
        category: '4ta Categoría',
        isFixedPassHolder: bookingData.category === 'Abono Fijo Semanal',
        fixedPassDay: bookingData.category === 'Abono Fijo Semanal' ? `${bookingData.timeSlot}` : null,
        totalBookings: 1,
        totalSpent: courtAmount,
        status: 'Jugador Registrado',
        lastVisit: 'Hoy, ' + bookingData.timeSlot.split(' - ')[0]
      });
    }

    // Update optimistic local state
    setData(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      tabs: [newTab, ...prev.tabs],
      players: updatedPlayers
    }));

    // Persist to Supabase if live, or enqueue if offline
    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      dbCreateBookingAndTab(bookingData, newBooking, newTab).catch(() => {
        enqueueMutation({ type: 'CREATE_BOOKING', bookingData, newBooking, newTab });
      });
    } else {
      enqueueMutation({ type: 'CREATE_BOOKING', bookingData, newBooking, newTab });
    }

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

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      dbUpdateBookingStatus(bookingId, newStatus, depositAmount).catch(() => {
        enqueueMutation({ type: 'UPDATE_STATUS', bookingId, newStatus, depositAmount });
      });
    } else {
      enqueueMutation({ type: 'UPDATE_STATUS', bookingId, newStatus, depositAmount });
    }
  };

  const addItemToTab = (tabId, menuItem, qty = 1) => {
    setData(prev => {
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.id === tabId) {
          const existingItemIndex = tab.items.findIndex(i => i.id === menuItem.id);
          let newItems = [...tab.items];
          if (existingItemIndex >= 0) {
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              qty: newItems[existingItemIndex].qty + qty
            };
          } else {
            newItems.push({
              id: menuItem.id,
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

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      dbAddTabItem(tabId, menuItem, qty).catch(() => {
        enqueueMutation({ type: 'ADD_TAB_ITEM', tabId, menuItem, qty });
      });
    } else {
      enqueueMutation({ type: 'ADD_TAB_ITEM', tabId, menuItem, qty });
    }
  };

  const updateTabItemQty = (tabId, itemId, delta) => {
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

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      dbUpdateTabEquipment(tabId, { racketCount, ballTubeCount }).catch(() => {
        enqueueMutation({ type: 'UPDATE_EQUIPMENT', tabId, equipment: { racketCount, ballTubeCount } });
      });
    } else {
      enqueueMutation({ type: 'UPDATE_EQUIPMENT', tabId, equipment: { racketCount, ballTubeCount } });
    }
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

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      rpcSettleTab(tabId, paymentMethod).catch((rpcErr) => {
        console.warn('[settleTab RPC fallback to direct mutation]', rpcErr);
        dbSettleTab(tabId, paymentMethod).catch(() => {
          enqueueMutation({ type: 'SETTLE_TAB', tabId, paymentMethod });
        });
      });
    } else {
      enqueueMutation({ type: 'SETTLE_TAB', tabId, paymentMethod });
    }
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

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      dbUpdateMenuItem(updatedItem).catch(() => {
        enqueueMutation({ type: 'UPDATE_MENU_ITEM', updatedItem });
      });
    } else {
      enqueueMutation({ type: 'UPDATE_MENU_ITEM', updatedItem });
    }
  };

  const updateCourtRate = (courtId, newRate) => {
    setData(prev => ({
      ...prev,
      courts: prev.courts.map(c => c.id === courtId ? { ...c, rate: Number(newRate) } : c)
    }));

    if (isSupabaseConfigured() && typeof navigator !== 'undefined' && navigator.onLine) {
      dbUpdateCourtRate(courtId, newRate).catch(() => {
        enqueueMutation({ type: 'UPDATE_COURT_RATE', courtId, newRate });
      });
    } else {
      enqueueMutation({ type: 'UPDATE_COURT_RATE', courtId, newRate });
    }
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
