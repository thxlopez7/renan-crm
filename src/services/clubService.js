import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper to convert snake_case object to camelCase object
export const mapCourtFromDb = (c) => ({
  id: c.id,
  name: c.name,
  code: c.code,
  specs: c.specs,
  surface: c.surface,
  enclosure: c.enclosure,
  lighting: c.lighting,
  rate: Number(c.rate),
  primeRate: Number(c.prime_rate),
  indoor: Boolean(c.indoor),
  panoramic: Boolean(c.panoramic),
  status: c.status,
  image: c.image
});

export const mapCoachFromDb = (c) => ({
  id: c.id,
  name: c.name,
  role: c.role,
  credentials: c.credentials,
  bio: c.bio,
  rate: Number(c.rate),
  defaultCourtId: c.default_court_id,
  avatar: c.avatar,
  enabledSlots: c.enabled_slots || []
});

export const mapMenuItemFromDb = (m) => ({
  id: m.id,
  name: m.name,
  category: m.category,
  description: m.description,
  price: Number(m.price),
  available: Boolean(m.available),
  tag: m.tag
});

export const mapGymPlanFromDb = (g) => ({
  id: g.id,
  name: g.name,
  period: g.period,
  price: Number(g.price),
  badge: g.badge,
  featured: Boolean(g.featured),
  description: g.description,
  features: g.features || []
});

export const mapTournamentFromDb = (t) => ({
  id: t.id,
  title: t.title,
  type: t.type,
  isFlagship: Boolean(t.is_flagship),
  dates: t.dates,
  prizePool: Number(t.prize_pool),
  entryFee: Number(t.entry_fee),
  categories: t.categories || [],
  slots: Number(t.slots),
  registeredCount: Number(t.registered_count),
  status: t.status,
  description: t.description
});

export const mapPlayerFromDb = (p) => ({
  id: p.id,
  name: p.name,
  phone: p.phone,
  category: p.category,
  isFixedPassHolder: Boolean(p.is_fixed_pass_holder),
  fixedPassDay: p.fixed_pass_day,
  totalBookings: Number(p.total_bookings),
  totalSpent: Number(p.total_spent),
  status: p.status,
  lastVisit: p.last_visit
});

export const mapBookingFromDb = (b) => ({
  id: b.id,
  code: b.code,
  courtId: b.court_id,
  date: typeof b.date === 'string' ? b.date.substring(0, 10) : b.date,
  timeSlot: b.time_slot,
  clientName: b.client_name,
  clientPhone: b.client_phone,
  category: b.category,
  status: b.status,
  courtAmount: Number(b.court_amount),
  depositPaid: Number(b.deposit_paid),
  barTableRequested: Boolean(b.bar_table_requested),
  rentedRackets: Number(b.rented_rackets),
  ballTubes: Number(b.ball_tubes),
  linkedTabId: b.linked_tab_id,
  createdAt: b.created_at_time || '18:00'
});

export const mapTabFromDb = (t, tabItems = []) => ({
  id: t.id,
  linkedBookingId: t.linked_booking_id,
  courtId: t.court_id,
  courtName: t.court_name,
  clientName: t.client_name,
  courtAmount: Number(t.court_amount),
  depositPaid: Number(t.deposit_paid),
  racketCount: Number(t.racket_count),
  racketUnitFee: Number(t.racket_unit_fee || 30000),
  ballTubeCount: Number(t.ball_tube_count),
  ballTubeUnitFee: Number(t.ball_tube_unit_fee || 70000),
  status: t.status,
  activityStatus: t.activity_status,
  paymentMethod: t.payment_method,
  settledAt: t.settled_at,
  barTableRequested: Boolean(t.bar_table_requested),
  openedAt: t.opened_at,
  items: tabItems.filter(item => item.tab_id === t.id).map(i => ({
    id: i.id,
    menuItemId: i.menu_item_id,
    name: i.name,
    price: Number(i.price),
    qty: Number(i.qty)
  }))
});

// Load all project data from Supabase
export const fetchAllClubData = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const [
      courtsRes,
      coachesRes,
      menuRes,
      gymRes,
      tournRes,
      playersRes,
      bookingsRes,
      tabsRes,
      tabItemsRes
    ] = await Promise.all([
      supabase.from('courts').select('*'),
      supabase.from('coaches').select('*'),
      supabase.from('menu_items').select('*'),
      supabase.from('gym_plans').select('*'),
      supabase.from('tournaments').select('*'),
      supabase.from('players').select('*'),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('tabs').select('*').order('created_at', { ascending: false }),
      supabase.from('tab_items').select('*')
    ]);

    if (courtsRes.error) throw courtsRes.error;

    const rawTabItems = tabItemsRes.data || [];

    return {
      courts: (courtsRes.data || []).map(mapCourtFromDb),
      coaches: (coachesRes.data || []).map(mapCoachFromDb),
      menuItems: (menuRes.data || []).map(mapMenuItemFromDb),
      gymPlans: (gymRes.data || []).map(mapGymPlanFromDb),
      tournaments: (tournRes.data || []).map(mapTournamentFromDb),
      players: (playersRes.data || []).map(mapPlayerFromDb),
      bookings: (bookingsRes.data || []).map(mapBookingFromDb),
      tabs: (tabsRes.data || []).map(t => mapTabFromDb(t, rawTabItems)),
      gymApplications: [],
      tournamentRegistrations: []
    };
  } catch (err) {
    console.error('[Supabase] Error loading data:', err);
    return null;
  }
};

// Supabase Real-time Database Mutations
export const dbCreateBookingAndTab = async (bookingData, newBooking, newTab) => {
  if (!isSupabaseConfigured()) return;

  try {
    // 1. Insert booking
    await supabase.from('bookings').insert({
      id: newBooking.id,
      code: newBooking.code,
      court_id: newBooking.courtId,
      date: newBooking.date,
      time_slot: newBooking.timeSlot,
      client_name: newBooking.clientName,
      client_phone: newBooking.clientPhone,
      category: newBooking.category,
      status: newBooking.status,
      court_amount: newBooking.courtAmount,
      deposit_paid: newBooking.depositPaid,
      bar_table_requested: newBooking.barTableRequested,
      rented_rackets: newBooking.rentedRackets,
      ball_tubes: newBooking.ballTubes,
      linked_tab_id: newBooking.linkedTabId,
      created_at_time: newBooking.createdAt
    });

    // 2. Insert tab
    await supabase.from('tabs').insert({
      id: newTab.id,
      linked_booking_id: newBooking.id,
      court_id: newTab.courtId,
      court_name: newTab.courtName,
      client_name: newTab.clientName,
      court_amount: newTab.courtAmount,
      deposit_paid: newTab.depositPaid,
      racket_count: newTab.racketCount,
      racket_unit_fee: newTab.racketUnitFee,
      ball_tube_count: newTab.ballTubeCount,
      ball_tube_unit_fee: newTab.ballTubeUnitFee,
      status: newTab.status,
      activity_status: newTab.activityStatus,
      bar_table_requested: newTab.barTableRequested,
      opened_at: newTab.openedAt
    });

    // 3. Upsert player
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id, total_bookings, total_spent')
      .eq('phone', newBooking.clientPhone)
      .maybeSingle();

    if (existingPlayer) {
      await supabase.from('players').update({
        total_bookings: existingPlayer.total_bookings + 1,
        total_spent: Number(existingPlayer.total_spent) + newBooking.courtAmount,
        last_visit: 'Hoy, ' + newBooking.timeSlot.split(' - ')[0]
      }).eq('id', existingPlayer.id);
    } else {
      await supabase.from('players').insert({
        id: `plr-${Date.now()}`,
        name: newBooking.clientName,
        phone: newBooking.clientPhone,
        category: '4ta Categoría',
        is_fixed_pass_holder: newBooking.category === 'Abono Fijo Semanal',
        fixed_pass_day: newBooking.category === 'Abono Fijo Semanal' ? newBooking.timeSlot : null,
        total_bookings: 1,
        total_spent: newBooking.courtAmount,
        status: 'Jugador Registrado',
        last_visit: 'Hoy, ' + newBooking.timeSlot.split(' - ')[0]
      });
    }
  } catch (err) {
    console.error('[Supabase] Error creating booking:', err);
  }
};

export const dbUpdateBookingStatus = async (bookingId, newStatus, depositAmount) => {
  if (!isSupabaseConfigured()) return;

  try {
    const updatePayload = { status: newStatus };
    if (depositAmount !== undefined) {
      updatePayload.deposit_paid = Number(depositAmount);
    }

    await supabase.from('bookings').update(updatePayload).eq('id', bookingId);

    // Sync tab deposit if changed
    if (depositAmount !== undefined) {
      await supabase.from('tabs').update({ deposit_paid: Number(depositAmount) }).eq('linked_booking_id', bookingId);
    }
  } catch (err) {
    console.error('[Supabase] Error updating booking status:', err);
  }
};

export const dbAddTabItem = async (tabId, item, qty = 1) => {
  if (!isSupabaseConfigured()) return;

  try {
    const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await supabase.from('tab_items').insert({
      id: itemId,
      tab_id: tabId,
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      qty: qty
    });
  } catch (err) {
    console.error('[Supabase] Error adding tab item:', err);
  }
};

export const dbUpdateTabEquipment = async (tabId, { racketCount, ballTubeCount }) => {
  if (!isSupabaseConfigured()) return;

  try {
    const payload = {};
    if (racketCount !== undefined) payload.racket_count = Number(racketCount);
    if (ballTubeCount !== undefined) payload.ball_tube_count = Number(ballTubeCount);

    await supabase.from('tabs').update(payload).eq('id', tabId);
  } catch (err) {
    console.error('[Supabase] Error updating tab equipment:', err);
  }
};

export const dbSettleTab = async (tabId, paymentMethod) => {
  if (!isSupabaseConfigured()) return;

  try {
    const nowTime = new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    
    // 1. Settle tab
    const { data: tab } = await supabase.from('tabs').update({
      status: 'settled',
      activity_status: 'liquidada',
      payment_method: paymentMethod,
      settled_at: nowTime
    }).eq('id', tabId).select('linked_booking_id').single();

    // 2. Mark linked booking finished
    if (tab && tab.linked_booking_id) {
      await supabase.from('bookings').update({ status: 'Finalizada' }).eq('id', tab.linked_booking_id);
    }
  } catch (err) {
    console.error('[Supabase] Error settling tab:', err);
  }
};

export const dbUpdateCourtRate = async (courtId, newRate) => {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase.from('courts').update({ rate: Number(newRate) }).eq('id', courtId);
  } catch (err) {
    console.error('[Supabase] Error updating court rate:', err);
  }
};

export const dbUpdateMenuItem = async (updatedItem) => {
  if (!isSupabaseConfigured()) return;

  try {
    await supabase.from('menu_items').update({
      price: Number(updatedItem.price),
      available: Boolean(updatedItem.available)
    }).eq('id', updatedItem.id);
  } catch (err) {
    console.error('[Supabase] Error updating menu item:', err);
  }
};
