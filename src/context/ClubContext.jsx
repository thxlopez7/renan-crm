import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

const ClubContext = createContext();

const STORAGE_KEY = 'black_club_elite_store_v1';

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

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  // Tab calculations helper
  const calculateTabBalances = (tab) => {
    const courtBase = tab.courtAmount || 0;
    const depositDeduction = tab.depositPaid || 0;
    const racketCharge = (tab.racketCount || 0) * (tab.racketUnitFee || 30000);
    const ballTubeCharge = (tab.ballTubeCount || 0) * (tab.ballTubeUnitFee || 70000);
    const itemsTotal = (tab.items || []).reduce((acc, item) => acc + (item.price * item.qty), 0);

    const grossTotal = courtBase + racketCharge + ballTubeCharge + itemsTotal;
    const netPending = Math.max(0, grossTotal - depositDeduction);

    return {
      courtBase,
      depositDeduction,
      racketCharge,
      ballTubeCharge,
      itemsTotal,
      grossTotal,
      netPending
    };
  };

  // Live KPIs Calculation
  const kpis = useMemo(() => {
    const todayBookings = data.bookings.filter(b => b.date === selectedDate);
    const totalSlotsPossible = data.courts.length * TIME_SLOTS.length; // 3 * 11 = 33
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
        // Collect deposits already paid into revenue
        totalRevenueToday += depositDeduction;
        courtRevenueToday += depositDeduction;
        // Remaining uncollected
        openTabsTotal += netPending;
      }
    });

    const pendingDepositsCount = todayBookings.filter(b => b.status === 'Seña Pendiente').length;
    const barTableRequestsCount = todayBookings.filter(b => b.barTableRequested && b.status !== 'Cancelada').length;
    const courtsInPlayCount = todayBookings.filter(b => b.status === 'En Pista').length;

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
  const createBooking = (bookingData) => {
    const bookingCode = `BC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBookingId = `book-${Date.now()}`;
    const newTabId = `tab-${Date.now()}`;

    const court = data.courts.find(c => c.id === bookingData.courtId);
    const courtAmount = bookingData.courtAmount || (court ? court.rate : 160000);
    const depositPaid = bookingData.depositPaid !== undefined ? bookingData.depositPaid : Math.round(courtAmount * 0.5);

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
      courtName: court ? court.name : 'Pista del Club',
      clientName: bookingData.clientName,
      courtAmount,
      depositPaid,
      racketCount: Number(bookingData.rentedRackets) || 0,
      racketUnitFee: 30000,
      ballTubeCount: Number(bookingData.ballTubes) || 0,
      ballTubeUnitFee: 70000,
      items: [],
      status: 'open',
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

    setData(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      tabs: [newTab, ...prev.tabs],
      players: updatedPlayers
    }));

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

      // Synchronize linked tab
      const targetBooking = updatedBookings.find(b => b.id === bookingId);
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.linkedBookingId === bookingId) {
          const updatedTab = { ...tab };
          if (depositAmount !== undefined) {
            updatedTab.depositPaid = Number(depositAmount);
          }
          if (newStatus === 'Finalizada') {
            // Can be settled or remain for settlement
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
  };

  const bookCoachClass = ({ coachId, date, timeSlot, clientName, clientPhone }) => {
    const coach = data.coaches.find(c => c.id === coachId);
    if (!coach) throw new Error('Entrenador no encontrado');

    const courtId = coach.defaultCourtId || 'court-1';

    // Create booking which blocks the court
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
  };

  const updateCourtRate = (courtId, newRate) => {
    setData(prev => ({
      ...prev,
      courts: prev.courts.map(c => c.id === courtId ? { ...c, rate: Number(newRate) } : c)
    }));
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
