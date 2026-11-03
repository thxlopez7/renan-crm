import { clubNow } from '../utils/clubTime';
import { normalizePyPhone } from '../utils/phone';
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
  stock: m.stock !== undefined && m.stock !== null ? Number(m.stock) : 50,
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

const hhmm = (time) => (time ? String(time).slice(0, 5) : '');

export const mapBookingFromDb = (b) => ({
  id: b.id,
  code: b.code,
  courtId: b.court_id,
  date: typeof b.date === 'string' ? b.date.substring(0, 10) : b.date,
  startTime: hhmm(b.start_time),
  endTime: (b.time_slot || '').split(' - ')[1] || '',
  durationMinutes: Number(b.duration_minutes) || 60,
  expiresAt: b.expires_at,
  notes: b.cancelled_reason || '',
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
  cashedDate: t.cashed_at ? clubNow(new Date(t.cashed_at)).date : null,
  invoiceRuc: t.invoice_ruc || '',
  invoiceName: t.invoice_name || '',
  changeGiven: Number(t.change_given) || 0,
  isWalkin: !t.linked_booking_id,
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return fetchPublicClubData();

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

// Public visitors only see catalogs and slot occupancy (no client names or phones)
const fetchPublicClubData = async () => {
  const [courtsRes, coachesRes, menuRes, gymRes, tournRes] = await Promise.all([
    supabase.from('courts').select('*'),
    supabase.from('coaches').select('*'),
    supabase.from('menu_items').select('*'),
    supabase.from('gym_plans').select('*'),
    supabase.from('tournaments').select('*')
  ]);

  if (courtsRes.error) throw courtsRes.error;

  return {
    courts: (courtsRes.data || []).map(mapCourtFromDb),
    coaches: (coachesRes.data || []).map(mapCoachFromDb),
    menuItems: (menuRes.data || []).map(mapMenuItemFromDb),
    gymPlans: (gymRes.data || []).map(mapGymPlanFromDb),
    tournaments: (tournRes.data || []).map(mapTournamentFromDb),
    players: [],
    bookings: [],
    tabs: [],
    gymApplications: [],
    tournamentRegistrations: []
  };
};

// Supabase Real-time Database Mutations
// supabase-js returns { error } instead of throwing, so every write goes through unwrap()
const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// Network failures are worth retrying from the offline queue; anything the
// server rejected (RLS, validation, conflicts) will fail the same way again.
export const isRetryableError = (err) => {
  if (!err) return false;
  if (err.code) return false;
  return /fetch|network|timeout|offline/i.test(err.message || '');
};

const SERVER_ERROR_MESSAGES = {
  SLOT_ALREADY_BOOKED: 'Ese turno ya está reservado. Elegí otro horario.',
  NOT_STAFF: 'Tu usuario no tiene permisos de staff.',
  TAB_NOT_OPEN: 'La cuenta ya fue liquidada o cancelada.',
  TAB_ALREADY_SETTLED: 'La cuenta ya fue liquidada.',
  INVALID_DEPOSIT: 'La seña debe estar entre 0 y el monto de la cancha.',
  INVALID_EQUIPMENT: 'Cantidad de paletas (0-4) o tubos (0-6) inválida.',
  INVALID_NAME: 'El nombre del cliente es obligatorio.',
  PAST_SLOT: 'Ese turno ya pasó.'
};

export const describeServerError = (err) => {
  const message = err?.message || '';
  const key = Object.keys(SERVER_ERROR_MESSAGES).find(k => message.includes(k));
  if (key) return SERVER_ERROR_MESSAGES[key];
  if (err?.code === '42501') return 'No tenés permisos para hacer este cambio.';
  const serverText = message.match(/^[A-Z_]+: (.+)$/);
  if (serverText) return serverText[1];
  return 'No se pudo guardar el cambio en el servidor. Se recargaron los datos.';
};

export const dbCreateBookingAndTab = async (newBooking, newTab) => {
  if (!isSupabaseConfigured()) return null;

  return unwrap(await supabase.rpc('create_staff_booking', {
    p_booking_id: newBooking.id,
    p_tab_id: newTab ? newTab.id : null,
    p_court_id: newBooking.courtId,
    p_date: newBooking.date,
    p_start_time: newBooking.startTime,
    p_duration: newBooking.durationMinutes,
    p_client_name: newBooking.clientName,
    p_client_phone: newBooking.clientPhone || '',
    p_category: newBooking.category,
    p_court_amount: Number(newBooking.courtAmount),
    p_rented_rackets: Number(newBooking.rentedRackets) || 0,
    p_ball_tubes: Number(newBooking.ballTubes) || 0,
    p_bar_table_requested: Boolean(newBooking.barTableRequested),
    p_notes: newBooking.notes || null
  }));
};

export const dbUpdateBookingStatus = async (bookingId, newStatus, depositAmount) => {
  if (!isSupabaseConfigured()) return;

  const updatePayload = { status: newStatus };
  if (depositAmount !== undefined) {
    updatePayload.deposit_paid = Number(depositAmount);
  }

  unwrap(await supabase.from('bookings').update(updatePayload).eq('id', bookingId));

  // Sync tab deposit if changed
  if (depositAmount !== undefined) {
    unwrap(await supabase.from('tabs').update({ deposit_paid: Number(depositAmount) }).eq('linked_booking_id', bookingId));
  }
};

// Move or resize a booking; the schedule trigger recomputes time_slot/starts_at and
// the overlap constraint rejects conflicts. The linked POS tab follows court and price.
export const dbUpdateBooking = async (bookingId, patch) => {
  if (!isSupabaseConfigured()) return;

  const payload = {};
  if (patch.courtId !== undefined) payload.court_id = patch.courtId;
  if (patch.date !== undefined) payload.date = patch.date;
  if (patch.startTime !== undefined) payload.start_time = patch.startTime;
  if (patch.durationMinutes !== undefined) payload.duration_minutes = patch.durationMinutes;
  if (patch.courtAmount !== undefined) payload.court_amount = Number(patch.courtAmount);
  if (patch.clientName !== undefined) payload.client_name = patch.clientName;
  if (patch.clientPhone !== undefined) payload.client_phone = patch.clientPhone;

  const updated = unwrap(await supabase.from('bookings').update(payload).eq('id', bookingId).select('linked_tab_id').single());

  if (updated?.linked_tab_id) {
    const tabPayload = {};
    if (patch.courtId !== undefined) {
      tabPayload.court_id = patch.courtId;
      if (patch.courtName) tabPayload.court_name = patch.courtName;
    }
    if (patch.courtAmount !== undefined) tabPayload.court_amount = Number(patch.courtAmount);
    if (patch.clientName !== undefined) tabPayload.client_name = patch.clientName;
    if (Object.keys(tabPayload).length > 0) {
      unwrap(await supabase.from('tabs').update(tabPayload).eq('id', updated.linked_tab_id));
    }
  }
};

export const dbAdjustTabItem = async (tabId, menuItemId, delta) => {
  if (!isSupabaseConfigured()) return;

  unwrap(await supabase.rpc('adjust_tab_item', {
    p_tab_id: tabId,
    p_menu_item_id: menuItemId,
    p_delta: delta
  }));
};

export const dbUpdateTabEquipment = async (tabId, { racketCount, ballTubeCount }) => {
  if (!isSupabaseConfigured()) return;

  const payload = {};
  if (racketCount !== undefined) payload.racket_count = Number(racketCount);
  if (ballTubeCount !== undefined) payload.ball_tube_count = Number(ballTubeCount);

  unwrap(await supabase.from('tabs').update(payload).eq('id', tabId));
};

export const dbUpdateCourtRate = async (courtId, newRate, newPrimeRate) => {
  if (!isSupabaseConfigured()) return;

  const payload = { rate: Number(newRate) };
  if (newPrimeRate !== undefined && newPrimeRate !== null) {
    payload.prime_rate = Number(newPrimeRate);
  }
  unwrap(await supabase.from('courts').update(payload).eq('id', courtId));
};

export const dbUpdateMenuItem = async (updatedItem) => {
  if (!isSupabaseConfigured()) return;

  unwrap(await supabase.from('menu_items').update({
    name: updatedItem.name,
    category: updatedItem.category,
    price: Number(updatedItem.price),
    stock: Number(updatedItem.stock !== undefined ? updatedItem.stock : 50),
    available: Boolean(updatedItem.available)
  }).eq('id', updatedItem.id));
};

export const dbAddMenuItem = async (newItem) => {
  if (!isSupabaseConfigured()) return;

  unwrap(await supabase.from('menu_items').insert([{
    id: newItem.id,
    name: newItem.name,
    category: newItem.category,
    description: newItem.description || '',
    price: Number(newItem.price),
    stock: Number(newItem.stock !== undefined ? newItem.stock : 50),
    available: Boolean(newItem.available !== false),
    tag: newItem.tag || ''
  }]));
};

// Centralized Pricing Config from Database
export const fetchPricingConfig = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('pricing_config').select('key, value');
    if (error || !data) return null;

    const byKey = Object.fromEntries(data.map(row => [row.key, Number(row.value)]));
    const config = {};
    if (byKey.racket_rental_fee !== undefined) config.racketRentalFee = byKey.racket_rental_fee;
    if (byKey.ball_tube_fee !== undefined) config.ballTubeFee = byKey.ball_tube_fee;
    if (byKey.deposit_percent !== undefined) config.bookingDepositPercent = byKey.deposit_percent;
    if (byKey.booking_hold_minutes !== undefined) config.holdExpiresMinutes = byKey.booking_hold_minutes;
    if (byKey.open_hour !== undefined) config.openHour = byKey.open_hour;
    if (byKey.close_hour !== undefined) config.closeHour = byKey.close_hour;
    if (byKey.slot_step_minutes !== undefined) config.slotStepMinutes = byKey.slot_step_minutes;
    if (byKey.booking_window_days !== undefined) config.bookingWindowDays = byKey.booking_window_days;
    if (byKey.cancel_notice_hours !== undefined) config.cancelNoticeHours = byKey.cancel_notice_hours;
    return config;
  } catch {
    return null;
  }
};

// Staff Roles Query
export const fetchStaffRole = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return 'anon';
  try {
    const { data, error } = await supabase
      .from('staff_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return 'anon';
    return data.role || 'anon';
  } catch {
    return 'anon';
  }
};

// Public booking request: price, hours and overlaps are validated by the server
export const requestBooking = async ({
  courtId, date, startTime, durationMinutes, clientName, clientPhone,
  rentedRackets = 0, ballTubes = 0, barTableRequested = false
}) => {
  return unwrap(await supabase.rpc('request_booking', {
    p_court_id: courtId,
    p_date: date,
    p_start_time: startTime,
    p_duration: durationMinutes,
    p_client_name: clientName,
    p_client_phone: clientPhone,
    p_rented_rackets: rentedRackets,
    p_ball_tubes: ballTubes,
    p_bar_table_requested: barTableRequested
  }));
};

// Busy ranges for a day, without client data
export const fetchAvailability = async (date) => {
  if (!isSupabaseConfigured()) return [];
  const rows = unwrap(await supabase.rpc('get_public_availability', { p_date: date })) || [];
  return rows.map(r => ({ courtId: r.court_id, startTime: r.start_time, endTime: r.end_time }));
};

export const fetchMyBooking = async (code, phone) => {
  return unwrap(await supabase.rpc('get_my_booking', { p_code: code, p_phone: phone }));
};

export const cancelMyBooking = async (code, phone) => {
  return unwrap(await supabase.rpc('cancel_my_booking', { p_code: code, p_phone: phone }));
};

// RPC 2: POS Tab settlement with atomic server-side calculation
export const rpcSettleTab = async (tabId, paymentMethod = 'Tarjeta') => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado');
  }

  const { data, error } = await supabase.rpc('settle_tab', {
    p_tab_id: tabId,
    p_payment_method: paymentMethod
  });

  if (error) {
    throw error;
  }

  return data;
};

// Cash: mixed payments per tab, walk-in bar tabs and cash register shifts
export const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'QR', 'Débito', 'Crédito', 'Billetera'];

export const rpcPayTab = async (tabId, payments, invoice = {}) => {
  return unwrap(await supabase.rpc('pay_tab', {
    p_tab_id: tabId,
    p_payments: payments.map(p => ({ method: p.method, amount: Math.round(Number(p.amount)) })),
    p_invoice_ruc: invoice.ruc || null,
    p_invoice_name: invoice.name || null
  }));
};

export const dbOpenWalkinTab = async (tabId, clientName) => {
  if (!isSupabaseConfigured()) return;
  unwrap(await supabase.rpc('open_walkin_tab', { p_tab_id: tabId, p_client_name: clientName }));
};

const mapRegister = (r) => r && ({
  id: r.id,
  status: r.status,
  shiftName: r.shift_name,
  openedAt: r.opened_at,
  closedAt: r.closed_at,
  openingBalance: Number(r.opening_balance) || 0,
  totalCollected: Number(r.total_collected) || 0,
  breakdown: r.payment_breakdown || {},
  expectedCash: r.expected_cash === null ? null : Number(r.expected_cash),
  countedCash: r.counted_cash === null ? null : Number(r.counted_cash),
  cashDifference: r.cash_difference === null ? null : Number(r.cash_difference),
  notes: r.notes || ''
});

export const fetchOpenRegister = async () => {
  const row = unwrap(await supabase.from('daily_cash_registers').select('*').eq('status', 'open').maybeSingle());
  return mapRegister(row);
};

export const fetchRecentRegisters = async (limit = 10) => {
  const rows = unwrap(await supabase.from('daily_cash_registers').select('*').order('opened_at', { ascending: false }).limit(limit));
  return (rows || []).map(mapRegister);
};

export const fetchRegisterPayments = async (registerId) => {
  const rows = unwrap(await supabase.from('tab_payments').select('method, amount, tab_id').eq('register_id', registerId));
  return rows || [];
};

export const rpcOpenCashRegister = async (openingBalance, shiftName) => {
  return mapRegister(unwrap(await supabase.rpc('open_cash_register', {
    p_opening_balance: Math.round(Number(openingBalance) || 0),
    p_shift_name: shiftName || 'General'
  })));
};

export const rpcCloseCashRegister = async (registerId, countedCash, notes) => {
  return mapRegister(unwrap(await supabase.rpc('close_cash_register', {
    p_register_id: registerId,
    p_counted_cash: Math.round(Number(countedCash) || 0),
    p_notes: notes || null
  })));
};

// Club settings live in pricing_config (key/value). Only the owner can write them (RLS).
export const SETTING_KEYS = {
  openHour: 'open_hour',
  closeHour: 'close_hour',
  holdExpiresMinutes: 'booking_hold_minutes',
  bookingWindowDays: 'booking_window_days',
  cancelNoticeHours: 'cancel_notice_hours',
  racketRentalFee: 'racket_rental_fee',
  ballTubeFee: 'ball_tube_fee'
};

export const dbUpdateClubSettings = async (patch) => {
  if (!isSupabaseConfigured()) return;
  const rows = Object.entries(patch)
    .filter(([key]) => SETTING_KEYS[key])
    .map(([key, value]) => ({ key: SETTING_KEYS[key], value: Number(value), updated_at: new Date().toISOString() }));
  if (rows.length === 0) return;
  const saved = unwrap(await supabase.from('pricing_config').upsert(rows, { onConflict: 'key' }).select('key'));
  // RLS silently skips rows it does not allow: treat that as a permission error
  if (!saved || saved.length !== rows.length) throw { code: '42501', message: 'permission denied' };
};

export const dbUpdateCourt = async (courtId, patch) => {
  if (!isSupabaseConfigured()) return;
  const payload = {};
  if (patch.rate !== undefined) payload.rate = Number(patch.rate);
  if (patch.status !== undefined) payload.status = patch.status;
  const saved = unwrap(await supabase.from('courts').update(payload).eq('id', courtId).select('id'));
  if (!saved || saved.length === 0) throw { code: '42501', message: 'permission denied' };
};

// Public forms: visitors can insert but not read back (RLS), so no .select() here
export const dbInsertGymApplication = async (app) => {
  if (!isSupabaseConfigured()) return;
  unwrap(await supabase.from('gym_applications').insert({
    id: app.id,
    plan_id: app.planId,
    client_name: app.clientName,
    client_phone: normalizePyPhone(app.clientPhone) || app.clientPhone,
    email: app.email || null,
    date: app.date
  }));
};

export const dbInsertTournamentRegistration = async (reg) => {
  if (!isSupabaseConfigured()) return;
  unwrap(await supabase.from('tournament_registrations').insert({
    id: reg.id,
    tournament_id: reg.tournamentId,
    pair_name: reg.pairName,
    player1: reg.player1,
    player2: reg.player2,
    phone: normalizePyPhone(reg.phone) || reg.phone,
    category: reg.category
  }));
};
