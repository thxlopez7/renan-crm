-- ==============================================================================
-- BLACK CLUB ELITE (@blackclubparaguay)
-- ESQUEMA MAESTRO DE PRODUCCIÓN UNIFICADO · SUPABASE POSTGRESQL
-- Versión: 2.0 (Producción Final)
-- Ámbito: Portal Público de Jugadores & Suite CRM Ejecutiva de Gestión
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. TABLAS DEL SISTEMA
-- ------------------------------------------------------------------------------

-- 2.1 Canchas Oficiales de Pádel
CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  specs TEXT NOT NULL,
  surface TEXT NOT NULL,
  enclosure TEXT NOT NULL,
  lighting TEXT NOT NULL,
  rate INTEGER NOT NULL,             -- Monto tarifa estándar en Guaraníes (Gs.)
  prime_rate INTEGER NOT NULL,       -- Monto tarifa horario prime en Guaraníes (Gs.)
  indoor BOOLEAN NOT NULL DEFAULT FALSE,
  panoramic BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'operational', -- 'operational', 'maintenance'
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 Entrenadores & Cuerpo Técnico (BlackTeam)
CREATE TABLE IF NOT EXISTS coaches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  credentials TEXT,
  bio TEXT,
  rate INTEGER NOT NULL,             -- Arancel por hora de clase en Gs.
  default_court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
  avatar TEXT,
  enabled_slots TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Carta del Bar, Bebidas, Gastronomía & Pro-Shop (Bar & Merch)
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'Comida & Picadas', 'Cervezas & Chopp', 'Hidratación & Bebidas', 'Pro-Shop & Merch'
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0), -- Precio unitario en Guaraníes (Gs.)
  stock INTEGER NOT NULL DEFAULT 50 CHECK (stock >= 0), -- Control de inventario físico
  available BOOLEAN NOT NULL DEFAULT TRUE,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Membresías y Planes de Alto Rendimiento (BlackGym)
CREATE TABLE IF NOT EXISTS gym_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,             -- 'Mensual Libre', 'Mensual Matutino', 'Mensual Específico'
  price INTEGER NOT NULL CHECK (price >= 0), -- Arancel mensual en Gs.
  badge TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Circuito & Torneos Oficiales (@blackclubparaguay)
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  is_flagship BOOLEAN NOT NULL DEFAULT FALSE,
  dates TEXT NOT NULL,
  prize_pool BIGINT NOT NULL DEFAULT 0, -- Pozo de premios en Gs.
  entry_fee INTEGER NOT NULL DEFAULT 0, -- Arancel de inscripción en Gs.
  categories TEXT[] DEFAULT '{}',
  slots INTEGER NOT NULL DEFAULT 32,
  registered_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Inscripciones Abiertas',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 Directorio de Clientes y Socios (CRM)
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT DEFAULT '4ta Categoría',
  is_fixed_pass_holder BOOLEAN NOT NULL DEFAULT FALSE,
  fixed_pass_day TEXT,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0, -- Gasto histórico acumulado en Gs.
  status TEXT NOT NULL DEFAULT 'Jugador Frecuente',
  last_visit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Reservas de Canchas (Portal Web & Agenda CRM)
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,          -- '18:00 - 19:00', '19:00 - 20:00', etc.
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Reserva Estándar',
  status TEXT NOT NULL DEFAULT 'Solicitud Pendiente', -- 'Solicitud Pendiente', 'Confirmada', 'En Cancha', 'Finalizada', 'Cancelada'
  court_amount INTEGER NOT NULL DEFAULT 0 CHECK (court_amount >= 0),
  deposit_paid INTEGER NOT NULL DEFAULT 0 CHECK (deposit_paid >= 0),
  bar_table_requested BOOLEAN NOT NULL DEFAULT FALSE,
  rented_rackets INTEGER NOT NULL DEFAULT 0,
  ball_tubes INTEGER NOT NULL DEFAULT 0,
  linked_tab_id TEXT,
  expires_at TIMESTAMPTZ NULL,
  created_at_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 Cuentas Operativas / Terminal POS (Caja & Tercer Tiempo)
CREATE TABLE IF NOT EXISTS tabs (
  id TEXT PRIMARY KEY,
  linked_booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
  court_name TEXT,
  client_name TEXT NOT NULL,
  court_amount INTEGER NOT NULL DEFAULT 0 CHECK (court_amount >= 0),
  deposit_paid INTEGER NOT NULL DEFAULT 0 CHECK (deposit_paid >= 0),
  racket_count INTEGER NOT NULL DEFAULT 0,
  racket_unit_fee INTEGER NOT NULL DEFAULT 30000,
  ball_tube_count INTEGER NOT NULL DEFAULT 0,
  ball_tube_unit_fee INTEGER NOT NULL DEFAULT 70000,
  status TEXT NOT NULL DEFAULT 'open',         -- 'open', 'settled', 'cancelled'
  activity_status TEXT NOT NULL DEFAULT 'en_cancha', -- 'en_cancha', 'tercer_tiempo', 'liquidada'
  payment_method TEXT,                        -- 'Tarjeta', 'Efectivo', 'Transferencia Itaú'
  settled_at TEXT,
  cashed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cashed_at TIMESTAMPTZ NULL,
  bar_table_requested BOOLEAN NOT NULL DEFAULT FALSE,
  opened_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 Detalle de Consumos de Barra en Cuentas POS
CREATE TABLE IF NOT EXISTS tab_items (
  id TEXT PRIMARY KEY,
  tab_id TEXT NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  qty INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 Postulaciones de Membresía BlackGym
CREATE TABLE IF NOT EXISTS gym_applications (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES gym_plans(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 Inscripciones de Parejas al Circuito
CREATE TABLE IF NOT EXISTS tournament_registrations (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  pair_name TEXT NOT NULL,
  player1 TEXT NOT NULL,
  player2 TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.12 Configuración Centralizada de Tarifas
CREATE TABLE IF NOT EXISTS pricing_config (
  key TEXT PRIMARY KEY,
  value NUMERIC NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.13 Libro Diario de Cajas Físicas
CREATE TABLE IF NOT EXISTS daily_cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_date DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Asuncion')::date,
  shift_name TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  closed_at TIMESTAMPTZ,
  opening_balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (opening_balance >= 0),
  total_court_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_court_revenue >= 0),
  total_bar_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_bar_revenue >= 0),
  total_collected NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_collected >= 0),
  payment_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.14 Pista de Auditoría Inmutable
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB
);

-- 2.15 Roles del Personal Staff
CREATE TABLE IF NOT EXISTS staff_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'reception')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. ÍNDICES DE RENDIMIENTO Y PREVENCIÓN DE COLISIONES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_court ON bookings(court_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_tabs_status ON tabs(status);
CREATE INDEX IF NOT EXISTS idx_tabs_activity ON tabs(activity_status);
CREATE INDEX IF NOT EXISTS idx_tab_items_tab_id ON tab_items(tab_id);
CREATE INDEX IF NOT EXISTS idx_players_phone ON players(phone);
CREATE INDEX IF NOT EXISTS idx_daily_cash_registers_date ON daily_cash_registers(register_date);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Candado físico anti-doble reserva (excluyendo reservas Canceladas)
CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_active_slot
ON bookings (court_id, date, time_slot)
WHERE status <> 'Cancelada';

-- ------------------------------------------------------------------------------
-- 4. DISPARADORES Y FUNCIONES DE INTEGRIDAD
-- ------------------------------------------------------------------------------

-- 4.1 Trigger para sincronizar precio oficial de consumibles en comandas
CREATE OR REPLACE FUNCTION trg_sync_tab_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item RECORD;
BEGIN
    IF NEW.menu_item_id IS NOT NULL THEN
        SELECT name, price INTO v_item 
        FROM menu_items 
        WHERE id = NEW.menu_item_id;

        IF FOUND THEN
            NEW.name := v_item.name;
            NEW.price := v_item.price;
        END IF;
    END IF;

    IF NEW.qty IS NULL OR NEW.qty <= 0 THEN
        NEW.qty := 1;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tab_items_official_price ON tab_items;
CREATE TRIGGER trg_tab_items_official_price
BEFORE INSERT OR UPDATE ON tab_items
FOR EACH ROW
EXECUTE FUNCTION trg_sync_tab_item_price();

-- 4.2 Trigger para registro de auditoría automática
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_record_id TEXT;
    v_old JSONB := NULL;
    v_new JSONB := NULL;
BEGIN
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id::text;
        v_old := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id::text;
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id::text;
        v_new := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_log (
        user_id, action, table_name, record_id, old_data, new_data
    ) VALUES (
        v_user_id, TG_OP, TG_TABLE_NAME, v_record_id, v_old, v_new
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_bookings ON bookings;
CREATE TRIGGER trg_audit_bookings
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_tabs ON tabs;
CREATE TRIGGER trg_audit_tabs
AFTER INSERT OR UPDATE OR DELETE ON tabs
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_tab_items ON tab_items;
CREATE TRIGGER trg_audit_tab_items
AFTER INSERT OR UPDATE OR DELETE ON tab_items
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_daily_cash_registers ON daily_cash_registers;
CREATE TRIGGER trg_audit_daily_cash_registers
AFTER INSERT OR UPDATE OR DELETE ON daily_cash_registers
FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- 4.3 Función para consultar el rol del usuario autenticado
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'anon';
    END IF;

    SELECT role INTO v_role
    FROM staff_roles
    WHERE user_id = auth.uid();
    
    RETURN COALESCE(v_role, 'reception');
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. PROCEDIMIENTOS ALMACENADOS / RPCs TRANSACCIONALES
-- ------------------------------------------------------------------------------

-- 5.1 Creación atómica de reservas públicas (Sin Seña Previa, Solicitud Pendiente)
CREATE OR REPLACE FUNCTION create_public_booking(
    p_court_id TEXT,
    p_date DATE,
    p_time_slot TEXT,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_bar_table_requested BOOLEAN DEFAULT FALSE,
    p_rented_rackets INTEGER DEFAULT 0,
    p_ball_tubes INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_court RECORD;
    v_racket_fee NUMERIC;
    v_ball_fee NUMERIC;
    v_hold_minutes NUMERIC;
    
    v_now_asuncion TIMESTAMP;
    v_slot_start_time TIME;
    v_slot_start_text TEXT;
    
    v_court_amount INTEGER;
    v_equipment_total INTEGER;
    
    v_booking_id TEXT;
    v_booking_code TEXT;
    v_tab_id TEXT;
    v_expires_at TIMESTAMPTZ;
    v_created_time_str TEXT;
    
    v_result JSONB;
BEGIN
    -- Validaciones de entrada
    IF p_client_name IS NULL OR length(trim(p_client_name)) < 2 OR length(p_client_name) > 100 THEN
        RAISE EXCEPTION 'INVALID_NAME: El nombre debe tener entre 2 y 100 caracteres.';
    END IF;

    IF p_client_phone IS NULL OR length(trim(p_client_phone)) < 6 OR length(p_client_phone) > 30 THEN
        RAISE EXCEPTION 'INVALID_PHONE: El número de teléfono/WhatsApp no es válido.';
    END IF;

    IF p_rented_rackets < 0 OR p_rented_rackets > 4 THEN
        RAISE EXCEPTION 'INVALID_RACKETS: La cantidad de paletas debe estar entre 0 y 4.';
    END IF;

    IF p_ball_tubes < 0 OR p_ball_tubes > 6 THEN
        RAISE EXCEPTION 'INVALID_BALLS: La cantidad de tubos de pelotas debe estar entre 0 y 6.';
    END IF;

    -- Validación de Horario y Fecha Pasada (Asunción, Paraguay)
    v_now_asuncion := (NOW() AT TIME ZONE 'America/Asuncion')::timestamp;
    
    IF p_date < (v_now_asuncion::date) THEN
        RAISE EXCEPTION 'PAST_SLOT: No es posible reservar turnos en fechas pasadas.';
    END IF;

    v_slot_start_text := split_part(p_time_slot, ' - ', 1);
    BEGIN
        v_slot_start_time := (v_slot_start_text || ':00')::time;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'INVALID_TIMESLOT_FORMAT: Formato de horario inválido (se esperaba HH:00 - HH:00).';
    END;

    IF p_date = (v_now_asuncion::date) AND v_slot_start_time <= (v_now_asuncion::time) THEN
        RAISE EXCEPTION 'PAST_SLOT: Este turno ya ha iniciado o transcurrido para el día de hoy.';
    END IF;

    -- Verificar que la cancha exista y esté operativa
    SELECT * INTO v_court 
    FROM courts 
    WHERE id = p_court_id AND status = 'operational';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURT_NOT_AVAILABLE: La cancha seleccionada no está disponible u operativa.';
    END IF;

    -- Tarifas de equipamiento
    SELECT value INTO v_racket_fee FROM pricing_config WHERE key = 'racket_rental_fee';
    IF v_racket_fee IS NULL THEN v_racket_fee := 30000; END IF;

    SELECT value INTO v_ball_fee FROM pricing_config WHERE key = 'ball_tube_fee';
    IF v_ball_fee IS NULL THEN v_ball_fee := 70000; END IF;

    SELECT value INTO v_hold_minutes FROM pricing_config WHERE key = 'booking_hold_minutes';
    IF v_hold_minutes IS NULL THEN v_hold_minutes := 60; END IF;

    -- Monto de la cancha (Sin Seña Previa: deposit_paid = 0)
    v_court_amount := v_court.rate;
    v_equipment_total := (p_rented_rackets * v_racket_fee::integer) + (p_ball_tubes * v_ball_fee::integer);

    v_booking_id := 'book-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_booking_code := gen_booking_code();
    v_tab_id := 'tab-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_expires_at := NOW() + (v_hold_minutes || ' minutes')::interval;
    v_created_time_str := to_char(v_now_asuncion, 'HH24:MI');

    -- Inserción con captura de colisión
    BEGIN
        INSERT INTO bookings (
            id, code, court_id, date, time_slot, client_name, client_phone,
            category, status, court_amount, deposit_paid, bar_table_requested,
            rented_rackets, ball_tubes, linked_tab_id, expires_at, created_at_time, created_at, updated_at
        ) VALUES (
            v_booking_id, v_booking_code, p_court_id, p_date, p_time_slot,
            trim(p_client_name), trim(p_client_phone), 'Reserva Estándar',
            'Solicitud Pendiente', v_court_amount, 0, COALESCE(p_bar_table_requested, FALSE),
            p_rented_rackets, p_ball_tubes, v_tab_id, v_expires_at, v_created_time_str, NOW(), NOW()
        );

        INSERT INTO tabs (
            id, linked_booking_id, court_id, court_name, client_name,
            court_amount, deposit_paid, racket_count, racket_unit_fee,
            ball_tube_count, ball_tube_unit_fee, status, activity_status,
            payment_method, bar_table_requested, opened_at, created_at, updated_at
        ) VALUES (
            v_tab_id, v_booking_id, p_court_id, v_court.name, trim(p_client_name),
            v_court_amount, 0, p_rented_rackets, v_racket_fee::integer,
            p_ball_tubes, v_ball_fee::integer, 'open', 'en_cancha',
            NULL, COALESCE(p_bar_table_requested, FALSE), v_created_time_str, NOW(), NOW()
        );

    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'SLOT_ALREADY_BOOKED: El turno % en % para el % ya fue reservado.', 
            p_time_slot, v_court.name, p_date;
    END;

    v_result := jsonb_build_object(
        'id', v_booking_id,
        'code', v_booking_code,
        'courtId', p_court_id,
        'date', p_date::text,
        'timeSlot', p_time_slot,
        'clientName', trim(p_client_name),
        'clientPhone', trim(p_client_phone),
        'category', 'Reserva Estándar',
        'status', 'Solicitud Pendiente',
        'courtAmount', v_court_amount,
        'depositPaid', 0,
        'barTableRequested', COALESCE(p_bar_table_requested, FALSE),
        'rentedRackets', p_rented_rackets,
        'ballTubes', p_ball_tubes,
        'linkedTabId', v_tab_id,
        'expiresAt', v_expires_at,
        'createdAt', v_created_time_str
    );

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION create_public_booking TO anon, authenticated;

-- 5.2 Liquidación atómica de comandas en terminal POS (settle_tab)
CREATE OR REPLACE FUNCTION settle_tab(
    p_tab_id TEXT,
    p_payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tab RECORD;
    v_items_total BIGINT := 0;
    v_racket_fee INTEGER;
    v_ball_fee INTEGER;
    v_gross_total BIGINT := 0;
    v_net_pending BIGINT := 0;
    v_now_asuncion TIMESTAMP;
    v_settled_time_str TEXT;
    v_user_id UUID;
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede liquidar cuentas.';
    END IF;

    IF p_payment_method NOT IN ('Tarjeta', 'Efectivo', 'Transferencia / QR', 'Transferencia Itaú') THEN
        RAISE EXCEPTION 'INVALID_PAYMENT_METHOD: Método de cobro no permitido: %', p_payment_method;
    END IF;

    SELECT * INTO v_tab FROM tabs WHERE id = p_tab_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TAB_NOT_FOUND: La cuenta POS % no existe.', p_tab_id;
    END IF;

    IF v_tab.status = 'settled' THEN
        RAISE EXCEPTION 'TAB_ALREADY_SETTLED: La cuenta ya fue liquidada el %.', v_tab.settled_at;
    END IF;

    SELECT COALESCE(SUM(price * qty), 0) INTO v_items_total
    FROM tab_items
    WHERE tab_id = p_tab_id;

    v_racket_fee := COALESCE(v_tab.racket_unit_fee, 30000);
    v_ball_fee := COALESCE(v_tab.ball_tube_unit_fee, 70000);

    v_gross_total := COALESCE(v_tab.court_amount, 0)
                   + (COALESCE(v_tab.racket_count, 0) * v_racket_fee)
                   + (COALESCE(v_tab.ball_tube_count, 0) * v_ball_fee)
                   + v_items_total;

    v_net_pending := GREATEST(0, v_gross_total - COALESCE(v_tab.deposit_paid, 0));

    v_now_asuncion := (NOW() AT TIME ZONE 'America/Asuncion')::timestamp;
    v_settled_time_str := to_char(v_now_asuncion, 'HH24:MI');
    v_user_id := auth.uid();

    UPDATE tabs
    SET 
        status = 'settled',
        activity_status = 'liquidada',
        payment_method = p_payment_method,
        settled_at = v_settled_time_str,
        cashed_by = v_user_id,
        cashed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_tab_id;

    IF v_tab.linked_booking_id IS NOT NULL THEN
        UPDATE bookings
        SET status = 'Finalizada', updated_at = NOW()
        WHERE id = v_tab.linked_booking_id;
    END IF;

    RETURN jsonb_build_object(
        'tabId', p_tab_id,
        'status', 'settled',
        'grossTotal', v_gross_total,
        'depositDeduction', COALESCE(v_tab.deposit_paid, 0),
        'netPending', v_net_pending,
        'paymentMethod', p_payment_method,
        'settledAt', v_settled_time_str,
        'cashedBy', v_user_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION settle_tab TO authenticated;

-- ------------------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- Cierre de seguridad: solo el staff (usuarios en staff_roles) lee o modifica
-- datos operativos. El público lee catálogos y la ocupación de turnos sin datos
-- personales, y escribe solo vía create_public_booking o formularios de alta.
-- ==============================================================================

-- 1. Roles: un usuario autenticado sin fila en staff_roles NO es staff
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'anon';
    END IF;

    SELECT role INTO v_role
    FROM staff_roles
    WHERE user_id = auth.uid();

    RETURN COALESCE(v_role, 'anon');
END;
$$;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM staff_roles WHERE user_id = auth.uid());
$$;

-- 2. Ocupación pública de turnos (sin nombres ni teléfonos)
CREATE OR REPLACE FUNCTION get_public_occupied_slots(p_from DATE DEFAULT NULL)
RETURNS TABLE (court_id TEXT, date DATE, time_slot TEXT, status TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT b.court_id, b.date, b.time_slot, b.status
    FROM bookings b
    WHERE b.status <> 'Cancelada'
      AND b.date >= COALESCE(p_from, (NOW() AT TIME ZONE 'America/Asuncion')::date - 1);
$$;

-- 3. Eliminar todas las políticas existentes de las tablas públicas
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END;
$$;

ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- 4. Catálogos: lectura pública, escritura solo staff
CREATE POLICY "Public read courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Public read coaches" ON coaches FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read gym_plans" ON gym_plans FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read pricing" ON pricing_config FOR SELECT USING (true);

CREATE POLICY "Staff update courts" ON courts FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff insert menu_items" ON menu_items FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff update menu_items" ON menu_items FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Owners delete menu_items" ON menu_items FOR DELETE TO authenticated USING (current_user_role() = 'owner');
CREATE POLICY "Owners manage pricing" ON pricing_config FOR ALL TO authenticated
    USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

-- 5. Datos operativos: solo staff
CREATE POLICY "Staff read players" ON players FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff insert players" ON players FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff update players" ON players FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY "Staff read bookings" ON bookings FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff insert bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff update bookings" ON bookings FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Owners delete bookings" ON bookings FOR DELETE TO authenticated USING (current_user_role() = 'owner');

CREATE POLICY "Staff read tabs" ON tabs FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff insert tabs" ON tabs FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff update tabs" ON tabs FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Owners delete tabs" ON tabs FOR DELETE TO authenticated USING (current_user_role() = 'owner');

CREATE POLICY "Staff read tab_items" ON tab_items FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff insert tab_items" ON tab_items FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff update tab_items" ON tab_items FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Staff delete tab_items" ON tab_items FOR DELETE TO authenticated USING (is_staff());

-- 6. Formularios públicos: el público solo da de alta, el staff gestiona
CREATE POLICY "Public submit gym_applications" ON gym_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read gym_applications" ON gym_applications FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff update gym_applications" ON gym_applications FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Owners delete gym_applications" ON gym_applications FOR DELETE TO authenticated USING (current_user_role() = 'owner');

CREATE POLICY "Public submit tournament_registrations" ON tournament_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read tournament_registrations" ON tournament_registrations FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff update tournament_registrations" ON tournament_registrations FOR UPDATE TO authenticated USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "Owners delete tournament_registrations" ON tournament_registrations FOR DELETE TO authenticated USING (current_user_role() = 'owner');

-- 7. Staff, caja y auditoría
CREATE POLICY "Read own role or owner reads all" ON staff_roles FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR current_user_role() = 'owner');
CREATE POLICY "Owners manage staff roles" ON staff_roles FOR ALL TO authenticated
    USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

CREATE POLICY "Owners view audit log" ON audit_log FOR SELECT TO authenticated USING (current_user_role() = 'owner');

CREATE POLICY "Staff read cash registers" ON daily_cash_registers FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff insert cash registers" ON daily_cash_registers FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff update cash registers" ON daily_cash_registers FOR UPDATE TO authenticated USING (
    current_user_role() = 'owner' OR (current_user_role() = 'reception' AND status = 'open')
);
CREATE POLICY "Owners delete cash registers" ON daily_cash_registers FOR DELETE TO authenticated USING (current_user_role() = 'owner');

-- 8. Permisos de ejecución de funciones
REVOKE EXECUTE ON FUNCTION settle_tab(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION release_expired_bookings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION process_audit_log() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION trg_sync_tab_item_price() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION current_user_role() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION is_staff() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION settle_tab(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_occupied_slots(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_public_booking(TEXT, DATE, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 7. SINCRONIZACIÓN EN TIEMPO REAL (SUPABASE REALTIME)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'courts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE courts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'bookings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tabs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tabs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tab_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tab_items;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'players') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE players;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 8. DATOS INICIALES (SEED DATA DE PRODUCCIÓN)
-- ------------------------------------------------------------------------------

-- Configuración comercial
INSERT INTO pricing_config (key, value, description) VALUES
('racket_rental_fee', 30000, 'Tarifa unitaria de alquiler de paleta de test en Gs.'),
('ball_tube_fee', 70000, 'Precio unitario de tubo de pelotas Bullpadel presurizadas en Gs.'),
('deposit_percent', 0, 'Porcentaje de seña (0% tras eliminación de señas previas).'),
('booking_hold_minutes', 60, 'Tiempo de espera para confirmación de solicitud por recepción.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Canchas Oficiales
INSERT INTO courts (id, name, code, specs, surface, enclosure, lighting, rate, prime_rate, indoor, panoramic, status, image)
VALUES
('court-1', 'Cancha Central Panorámica', 'CANCHA 01 · WPT', 'Vidrio Panorámico 12mm WPT · Césped Monofilamento Negro Texturizado · LED 1000 Lux', 'Césped Texturizado Negro Pro', 'Cristal Panorámico Continuo WPT', 'LED Competition 1000 Lux', 160000, 180000, false, true, 'operational', '/images/court_panoramic.jpg'),
('court-2', 'Cancha 2 (Indoor Climatizada)', 'CANCHA 02 · CLIMA', 'Climatizada 21°C · Cerramiento Acústico · Iluminación LED Directa Difusa', 'Césped Monofilamento Tournament', 'Vidrio Laminado Acústico 10+10mm', 'Paneles LED Difusos Especiales', 140000, 160000, true, false, 'operational', '/images/court_panoramic.jpg'),
('court-3', 'Cancha 3 (Outdoor Techada)', 'CANCHA 03 · OUTDOOR', 'Outdoor Techada · Aluminio Aeroespacial · Césped Tournament Blue', 'Césped Fibrilado Azul Oficial', 'Estructura Aluminio Reforzada', 'Torretas LED Exteriores 800 Lux', 120000, 140000, false, false, 'operational', '/images/court_panoramic.jpg')
ON CONFLICT (id) DO UPDATE SET rate = EXCLUDED.rate, prime_rate = EXCLUDED.prime_rate;

-- Entrenadores BlackTeam
INSERT INTO coaches (id, name, role, credentials, bio, rate, default_court_id, avatar, enabled_slots)
VALUES
('coach-1', 'Alejandro Benítez', 'Director Técnico de Academia', 'Ex-Jugador WPT · Entrenador Nivel 3 FIP', 'Biomecánica cinemática del golpe, transiciones ofensivas y táctica en situaciones bajo presión.', 200000, 'court-1', '/images/blackteam.jpg', ARRAY['08:00 - 09:00', '15:00 - 16:00', '19:00 - 20:00']),
('coach-2', 'Santiago Morales', 'Head Coach de Competición', 'Certificado APA · Especialista en Rendimiento', 'Formador de parejas líderes en primera y segunda categoría. Lectura de pared y aceleración de bandeja.', 160000, 'court-2', '/images/blackteam.jpg', ARRAY['09:00 - 10:00', '17:00 - 18:00', '21:00 - 22:00']),
('coach-3', 'Matías Duarte', 'Instructor Formativo & Clínicas', 'Técnico Nacional de Pádel', 'Consolidación técnica para categorías intermedias, consistencia en fondo de cancha y juego aéreo.', 130000, 'court-3', '/images/blackteam.jpg', ARRAY['11:00 - 12:00', '18:00 - 19:00'])
ON CONFLICT (id) DO NOTHING;

-- Catálogo de Consumibles y Merchandising con Stock
INSERT INTO menu_items (id, name, category, description, price, stock, available, tag)
VALUES
('menu-1', 'Picada Black Club', 'Comida & Picadas', 'Tiras de lomito vacuno a la plancha, chorizo parrillero artesanal, mandioca frita y dip criollo.', 85000, 25, true, 'Clásico Tercer Tiempo'),
('menu-2', 'Black Angus Burger', 'Comida & Picadas', 'Medallón 180g de novillo seleccionado, queso cheddar fundido, panceta crocante y papas rústicas.', 62000, 30, true, 'Favorito'),
('menu-3', 'Sándwich de Lomito Completo', 'Comida & Picadas', 'Bife de lomo tierno, jamón cocido, queso muzzarella, huevo frito, lechuga y tomate en pan ciabatta.', 52000, 20, true, 'Post-Partido'),
('menu-4', 'Papas Rústicas con Cheddar & Bacon', 'Comida & Picadas', 'Papas con piel crujientes bañadas en salsa cheddar casera y lluvia de panceta crocante.', 38000, 40, true, 'Para Compartir'),
('menu-5', 'Promo 2x1 Chopp (Noches de Copa)', 'Cervezas & Chopp', 'Dos manijas de chopp artesanal helado tirado en el momento (Happy Hour Pádel).', 28000, 50, true, 'Promo Insignia'),
('menu-6', 'Balde x6 Stella Artois 330ml', 'Cervezas & Chopp', 'Balde con hielo picado y 6 botellas de Stella Artois bien frías para la mesa del equipo.', 95000, 35, true, 'Balde Tercer Tiempo'),
('menu-7', 'Balde x6 Patagonia 24.7 IPA', 'Cervezas & Chopp', 'Balde con hielo y 6 botellitas Patagonia Session IPA con notas cítricas y lúpulo fresco.', 110000, 25, true, 'Cerveza Craft'),
('menu-8', 'Chopp Individual 500ml', 'Cervezas & Chopp', 'Chopp rubio servido a -2°C con espuma densa en manija congelada.', 18000, 60, true, 'Barra'),
('menu-9', 'Corona Extra 355ml c/ Lima', 'Cervezas & Chopp', 'Botella servida con gajo de lima fresca en el cuello.', 22000, 48, true, 'Barra'),
('menu-10', 'Gatorade Cool Blue 750ml', 'Hidratación & Bebidas', 'Isotónico con electrolitos para reposición inmediata en cancha.', 16000, 72, true, 'En Cancha'),
('menu-11', 'Agua Mineral San Roque 500ml', 'Hidratación & Bebidas', 'Agua mineral natural sin gas o con gas, bien helada.', 10000, 120, true, 'Básico'),
('menu-12', 'Gaseosas Coca-Cola / Zero 500ml', 'Hidratación & Bebidas', 'Botellita individual clásica de 500ml fría.', 12000, 80, true, 'Refresco'),
('menu-13', 'Red Bull Energy Drink 250ml', 'Hidratación & Bebidas', 'Lata clásica energizante para antes del partido.', 20000, 45, true, 'Pre-Partido'),
('menu-14', 'Tubo Bullpadel Next Pro (x3)', 'Pro-Shop & Merch', 'Pelotas oficiales presurizadas de rebote vivo y máxima durabilidad para partidos oficiales.', 70000, 50, true, 'Pro-Shop'),
('menu-15', 'Remera Técnica Oficial Black Club', 'Pro-Shop & Merch', 'Remera dry-fit negra con logo monocromo de alta densidad y respiración micro-perforada.', 160000, 30, true, 'Merchandising'),
('menu-16', 'Quepi Oficial Black Club (Snapback)', 'Pro-Shop & Merch', 'Gorra deportiva estructurada negra con bordado frontal en relieve y visera semi-curva.', 120000, 25, true, 'Merchandising'),
('menu-17', 'Overgrip Bullpadel Pro Perforado', 'Pro-Shop & Merch', 'Grip micro-perforado de máximo agarre y absorción para clima caluroso.', 25000, 100, true, 'Pro-Shop'),
('menu-18', 'Alquiler de Paleta de Test (90 min)', 'Pro-Shop & Merch', 'Paleta gama alta de carbono para uso durante el turno de juego.', 30000, 12, true, 'Alquiler Cancha')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock, available = EXCLUDED.available;

-- Membresías BlackGym
INSERT INTO gym_plans (id, name, period, price, badge, featured, description, features)
VALUES
('plan-black-pass', 'Black Pass Completo', 'Mensual Libre', 450000, 'MÁS ELEGIDO', true, 'Acceso total a la sala de fuerza, máquinas Biostrength y vestuarios ejecutivos.', ARRAY['Acceso en ambos turnos (07:00 a 12:00 y 14:00 a 21:00)', 'Sábados de 08:00 a 13:00', 'Evaluación biomecánica y rutina digital personalizada', 'Lockers individuales y toallas de entrenamiento', '1 turno de cancha mensual bonificado en horario prime']),
('plan-morning', 'Turno Mañana Bio', 'Mensual Matutino', 320000, 'MATUTINO', false, 'Enfoque matinal de acondicionamiento físico de alto rendimiento.', ARRAY['Lunes a Viernes de 07:00 a 12:00 hs', 'Sábados de 08:00 a 13:00 hs', 'Seguimiento de progresión física mensual', 'Duchas y vestuarios premium']),
('plan-padel-fit', 'Pádel Functional Training', 'Mensual Específico', 380000, 'ESPECÍFICO PÁDEL', false, 'Preparación física adaptada a los movimientos explosivos y rotacionales del pádel.', ARRAY['3 sesiones semanales con preparador físico especializado', 'Prevención de lesiones de manguito rotador y codo', 'Desarrollo de potencia de salto y desplazamiento lateral', 'Acceso libre a zona de descarga y stretching'])
ON CONFLICT (id) DO NOTHING;

-- Circuito de Torneos
INSERT INTO tournaments (id, title, type, is_flagship, dates, prize_pool, entry_fee, categories, slots, registered_count, status, description)
VALUES
('tourn-1', 'Circuito Black Pádel · 2da Edición', 'Circuito Oficial', true, '24 - 27 de Noviembre 2026', 20000000, 300000, ARRAY['2da', '3ra', '4ta', '5ta', '6ta'], 64, 48, 'Inscripciones Abiertas', 'Segunda edición del torneo insignia de Black Club Elite. Coordinación directa vía WhatsApp oficial (+595 983 573 396).'),
('tourn-2', 'Torneo Nocturno de Principiantes', 'Abierto Social', false, '12 - 13 de Diciembre 2026', 5000000, 200000, ARRAY['6ta', '7ma', 'Iniciación'], 32, 22, 'Inscripciones Abiertas', 'Competencia recreativa para jugadores en formación con tercer tiempo integrado y asado de camaradería.'),
('tourn-3', 'Gran Sorteo Palas Bullpadel & Merch', 'Sorteo & Evento', false, 'Sorteo 20 de Diciembre', 12000000, 50000, ARRAY['General', 'Socios BlackClub'], 200, 135, 'Tickets Habilitados', 'Sorteo de fin de año: 3 Palas Bullpadel Hack 03 Pro, 10 tubos de pelotas y kits exclusivos de indumentaria.')
ON CONFLICT (id) DO NOTHING;

-- Directorio de Jugadores
INSERT INTO players (id, name, phone, category, is_fixed_pass_holder, fixed_pass_day, total_bookings, total_spent, status, last_visit)
VALUES
('plr-1', 'Gonzalo Insfrán', '+595 981 445 210', '2da Categoría', true, 'Jueves 18:00 a 19:00 (Cancha Central)', 24, 4860000, 'Cliente Activo Elite', 'Hoy, 18:00'),
('plr-2', 'Federico Zuccolillo', '+595 981 990 001', '1ra Categoría', true, 'Jueves 20:00 a 21:00 (Cancha Central)', 32, 6240000, 'Cliente Activo Elite', 'Hoy, 20:00'),
('plr-3', 'Rodrigo Villalba', '+595 971 889 012', '3ra Categoría', false, null, 11, 2010000, 'Jugador Frecuente', 'Hoy, 18:00'),
('plr-4', 'Matías Peña', '+595 983 551 772', '4ta Categoría', false, null, 8, 1620000, 'Jugador Frecuente', 'Hoy, 19:00'),
('plr-5', 'Carlos Argaña', '+595 972 660 449', '5ta Categoría', false, null, 7, 1150000, 'Nuevo Registro', 'Hoy, 19:00'),
('plr-6', 'Andrea Benítez', '+595 994 220 889', '3ra Damas', false, null, 14, 2680000, 'Jugadora Frecuente', 'Hoy, 20:00'),
('plr-7', 'Sebastián Duarte', '+595 992 334 115', '4ta Categoría', false, null, 19, 3510000, 'Jugador Frecuente', 'Hoy, 17:00')
ON CONFLICT (id) DO NOTHING;

-- Reservas Iniciales
INSERT INTO bookings (id, code, court_id, date, time_slot, client_name, client_phone, category, status, court_amount, deposit_paid, bar_table_requested, rented_rackets, ball_tubes, linked_tab_id, created_at_time)
VALUES
('book-101', 'BC-9842', 'court-1', CURRENT_DATE, '18:00 - 19:00', 'Gonzalo Insfrán', '+595 981 445 210', 'Turno Fijo Semanal', 'En Cancha', 160000, 0, true, 0, 1, 'tab-101', '17:55'),
('book-102', 'BC-9843', 'court-2', CURRENT_DATE, '18:00 - 19:00', 'Rodrigo Villalba', '+595 971 889 012', 'Reserva Estándar', 'En Cancha', 140000, 0, false, 2, 0, 'tab-102', '17:58'),
('book-103', 'BC-9839', 'court-3', CURRENT_DATE, '17:00 - 18:00', 'Sebastián Duarte', '+595 992 334 115', 'Reserva Estándar', 'Finalizada', 120000, 0, false, 0, 1, 'tab-103', '16:55'),
('book-104', 'BC-9845', 'court-1', CURRENT_DATE, '19:00 - 20:00', 'Matías Peña', '+595 983 551 772', 'Reserva Estándar', 'Confirmada', 160000, 0, true, 0, 1, 'tab-104', '17:40'),
('book-105', 'BC-9846', 'court-2', CURRENT_DATE, '19:00 - 20:00', 'Alejandro Benítez (BlackTeam)', '+595 981 112 334', 'Clase BlackTeam', 'Confirmada', 200000, 0, false, 0, 1, 'tab-105', '16:10'),
('book-106', 'BC-9847', 'court-3', CURRENT_DATE, '19:00 - 20:00', 'Carlos Argaña', '+595 972 660 449', 'Reserva Estándar', 'Solicitud Pendiente', 120000, 0, false, 0, 0, 'tab-106', '18:15'),
('book-107', 'BC-9848', 'court-1', CURRENT_DATE, '20:00 - 21:00', 'Federico Zuccolillo', '+595 981 990 001', 'Turno Fijo Semanal', 'Confirmada', 160000, 0, true, 0, 1, 'tab-107', '14:20'),
('book-108', 'BC-9849', 'court-2', CURRENT_DATE, '20:00 - 21:00', 'Andrea Benítez & Binomio', '+595 994 220 889', 'Reserva Estándar', 'Confirmada', 140000, 0, false, 2, 1, 'tab-108', '15:45'),
('book-109', 'BC-9835', 'court-3', CURRENT_DATE, '11:00 - 12:00', 'Clínica de Perfeccionamiento', '+595 981 777 444', 'Clase BlackTeam', 'Finalizada', 130000, 0, false, 0, 1, 'tab-109', '10:50')
ON CONFLICT (id) DO NOTHING;

-- Cuentas POS Iniciales
INSERT INTO tabs (id, linked_booking_id, court_id, court_name, client_name, court_amount, deposit_paid, racket_count, racket_unit_fee, ball_tube_count, ball_tube_unit_fee, status, activity_status, payment_method, settled_at, bar_table_requested, opened_at)
VALUES
('tab-101', 'book-101', 'court-1', 'Cancha Central Panorámica', 'Gonzalo Insfrán', 160000, 0, 0, 30000, 1, 70000, 'open', 'en_cancha', null, null, true, '17:55'),
('tab-102', 'book-102', 'court-2', 'Cancha 2 (Indoor Climatizada)', 'Rodrigo Villalba', 140000, 0, 2, 30000, 0, 70000, 'open', 'en_cancha', null, null, false, '17:58'),
('tab-103', 'book-103', 'court-3', 'Cancha 3 (Outdoor Techada)', 'Sebastián Duarte', 120000, 0, 0, 30000, 1, 70000, 'settled', 'liquidada', 'Tarjeta', '18:35', false, '16:55'),
('tab-104', 'book-104', 'court-1', 'Cancha Central (3er Tiempo)', 'Matías Peña', 160000, 0, 0, 30000, 1, 70000, 'open', 'tercer_tiempo', null, null, true, '17:40'),
('tab-105', 'book-105', 'court-2', 'Barra BlackBar (Post-Clase)', 'Alejandro Benítez (BlackTeam)', 200000, 0, 0, 30000, 1, 70000, 'open', 'tercer_tiempo', null, null, false, '16:10')
ON CONFLICT (id) DO NOTHING;

-- Consumos en cuentas
INSERT INTO tab_items (id, tab_id, menu_item_id, name, price, qty)
VALUES
('item-1', 'tab-101', 'menu-5', 'Promo 2x1 Chopp (Noches de Copa)', 28000, 1),
('item-2', 'tab-101', 'menu-1', 'Picada Black Club', 85000, 1),
('item-3', 'tab-102', 'menu-10', 'Gatorade Cool Blue 750ml', 16000, 2),
('item-4', 'tab-102', 'menu-11', 'Agua Mineral San Roque 500ml', 10000, 2),
('item-5', 'tab-103', 'menu-6', 'Balde x6 Stella Artois 330ml', 95000, 1),
('item-6', 'tab-104', 'menu-5', 'Promo 2x1 Chopp (Noches de Copa)', 28000, 2),
('item-7', 'tab-104', 'menu-2', 'Black Angus Burger', 62000, 2),
('item-8', 'tab-105', 'menu-10', 'Gatorade Cool Blue 750ml', 16000, 1)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- FIN DEL ESQUEMA MAESTRO
-- ==============================================================================

-- ==============================================================================
-- Códigos de reserva sin colisiones y alta de reservas del staff en una sola
-- transacción del servidor (reserva + cuenta POS + ficha de jugador).
-- ==============================================================================

-- 1. Código BC-#### libre (antes una colisión se informaba como "turno ocupado")
CREATE OR REPLACE FUNCTION gen_booking_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code TEXT;
BEGIN
    LOOP
        v_code := 'BC-' || (1000 + floor(random() * 9000))::text;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE code = v_code);
    END LOOP;
    RETURN v_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION gen_booking_code() FROM PUBLIC, anon, authenticated;


-- 2. Alta de reserva desde el CRM. Idempotente por p_booking_id para que la cola
--    offline pueda reintentar sin duplicar.
CREATE OR REPLACE FUNCTION create_staff_booking(
    p_booking_id TEXT,
    p_tab_id TEXT,
    p_court_id TEXT,
    p_date DATE,
    p_time_slot TEXT,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_category TEXT,
    p_court_amount INTEGER,
    p_deposit_paid INTEGER DEFAULT 0,
    p_bar_table_requested BOOLEAN DEFAULT FALSE,
    p_rented_rackets INTEGER DEFAULT 0,
    p_ball_tubes INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_court RECORD;
    v_existing RECORD;
    v_code TEXT;
    v_status TEXT;
    v_racket_fee INTEGER;
    v_ball_fee INTEGER;
    v_created_time_str TEXT;
    v_player_id TEXT;
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede cargar reservas desde el CRM.';
    END IF;

    SELECT id, code, linked_tab_id, status INTO v_existing FROM bookings WHERE id = p_booking_id;
    IF FOUND THEN
        RETURN jsonb_build_object('id', v_existing.id, 'code', v_existing.code,
                                  'linkedTabId', v_existing.linked_tab_id, 'status', v_existing.status);
    END IF;

    IF trim(COALESCE(p_client_name, '')) = '' THEN
        RAISE EXCEPTION 'INVALID_NAME: El nombre del cliente es obligatorio.';
    END IF;
    IF p_court_amount IS NULL OR p_court_amount < 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: El monto de la cancha no es válido.';
    END IF;
    IF COALESCE(p_deposit_paid, 0) < 0 OR COALESCE(p_deposit_paid, 0) > p_court_amount THEN
        RAISE EXCEPTION 'INVALID_DEPOSIT: La seña debe estar entre 0 y el monto de la cancha.';
    END IF;
    IF COALESCE(p_rented_rackets, 0) NOT BETWEEN 0 AND 4 OR COALESCE(p_ball_tubes, 0) NOT BETWEEN 0 AND 6 THEN
        RAISE EXCEPTION 'INVALID_EQUIPMENT: Cantidad de paletas (0-4) o tubos (0-6) inválida.';
    END IF;
    IF split_part(p_time_slot, ' - ', 1) !~ '^\d{2}:\d{2}$' THEN
        RAISE EXCEPTION 'INVALID_TIMESLOT_FORMAT: Formato de horario inválido (se esperaba HH:00 - HH:00).';
    END IF;

    SELECT * INTO v_court FROM courts WHERE id = p_court_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURT_NOT_FOUND: La cancha seleccionada no existe.';
    END IF;

    SELECT value::integer INTO v_racket_fee FROM pricing_config WHERE key = 'racket_rental_fee';
    SELECT value::integer INTO v_ball_fee FROM pricing_config WHERE key = 'ball_tube_fee';
    v_racket_fee := COALESCE(v_racket_fee, 30000);
    v_ball_fee := COALESCE(v_ball_fee, 70000);

    v_code := gen_booking_code();
    v_status := CASE WHEN COALESCE(p_deposit_paid, 0) > 0 THEN 'Confirmada' ELSE 'Seña Pendiente' END;
    v_created_time_str := to_char((NOW() AT TIME ZONE 'America/Asuncion'), 'HH24:MI');

    BEGIN
        INSERT INTO bookings (
            id, code, court_id, date, time_slot, client_name, client_phone,
            category, status, court_amount, deposit_paid, bar_table_requested,
            rented_rackets, ball_tubes, linked_tab_id, created_at_time, created_at, updated_at
        ) VALUES (
            p_booking_id, v_code, p_court_id, p_date, p_time_slot,
            trim(p_client_name), trim(COALESCE(p_client_phone, '')), COALESCE(p_category, 'Reserva Estándar'),
            v_status, p_court_amount, COALESCE(p_deposit_paid, 0), COALESCE(p_bar_table_requested, FALSE),
            COALESCE(p_rented_rackets, 0), COALESCE(p_ball_tubes, 0), p_tab_id, v_created_time_str, NOW(), NOW()
        );
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'SLOT_ALREADY_BOOKED: El turno % en % para el % ya fue reservado.',
            p_time_slot, v_court.name, p_date;
    END;

    INSERT INTO tabs (
        id, linked_booking_id, court_id, court_name, client_name,
        court_amount, deposit_paid, racket_count, racket_unit_fee,
        ball_tube_count, ball_tube_unit_fee, status, activity_status,
        bar_table_requested, opened_at, created_at, updated_at
    ) VALUES (
        p_tab_id, p_booking_id, p_court_id, v_court.name, trim(p_client_name),
        p_court_amount, COALESCE(p_deposit_paid, 0), COALESCE(p_rented_rackets, 0), v_racket_fee,
        COALESCE(p_ball_tubes, 0), v_ball_fee, 'open', 'en_cancha',
        COALESCE(p_bar_table_requested, FALSE), v_created_time_str, NOW(), NOW()
    );

    IF trim(COALESCE(p_client_phone, '')) <> '' THEN
        SELECT id INTO v_player_id FROM players WHERE phone = trim(p_client_phone) LIMIT 1;
    END IF;

    IF v_player_id IS NOT NULL THEN
        UPDATE players
        SET total_bookings = total_bookings + 1,
            total_spent = total_spent + p_court_amount,
            last_visit = to_char(p_date, 'DD/MM') || ', ' || split_part(p_time_slot, ' - ', 1),
            updated_at = NOW()
        WHERE id = v_player_id;
    ELSE
        INSERT INTO players (
            id, name, phone, category, is_fixed_pass_holder, fixed_pass_day,
            total_bookings, total_spent, status, last_visit
        ) VALUES (
            'plr-' || p_booking_id, trim(p_client_name), trim(COALESCE(p_client_phone, '')), '4ta Categoría',
            p_category = 'Abono Fijo Semanal',
            CASE WHEN p_category = 'Abono Fijo Semanal' THEN p_time_slot END,
            1, p_court_amount, 'Jugador Registrado',
            to_char(p_date, 'DD/MM') || ', ' || split_part(p_time_slot, ' - ', 1)
        );
    END IF;

    RETURN jsonb_build_object('id', p_booking_id, 'code', v_code, 'linkedTabId', p_tab_id, 'status', v_status);
END;
$$;

REVOKE EXECUTE ON FUNCTION create_staff_booking(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN, INTEGER, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_staff_booking(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN, INTEGER, INTEGER) TO authenticated;

-- ==============================================================================
-- Ajuste de cantidades en comandas POS: una sola fila por producto y cuenta,
-- solo sobre cuentas abiertas. El precio lo fija trg_sync_tab_item_price.
-- ==============================================================================
CREATE OR REPLACE FUNCTION adjust_tab_item(
    p_tab_id TEXT,
    p_menu_item_id TEXT,
    p_delta INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tab_status TEXT;
    v_item RECORD;
    v_qty INTEGER;
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede modificar comandas.';
    END IF;

    SELECT status INTO v_tab_status FROM tabs WHERE id = p_tab_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TAB_NOT_FOUND: La cuenta POS % no existe.', p_tab_id;
    END IF;
    IF v_tab_status <> 'open' THEN
        RAISE EXCEPTION 'TAB_NOT_OPEN: La cuenta ya fue liquidada o cancelada.';
    END IF;

    SELECT id, name, price INTO v_item FROM menu_items WHERE id = p_menu_item_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'MENU_ITEM_NOT_FOUND: El producto % no existe.', p_menu_item_id;
    END IF;

    SELECT COALESCE(SUM(qty), 0) + p_delta INTO v_qty
    FROM tab_items WHERE tab_id = p_tab_id AND menu_item_id = p_menu_item_id;

    DELETE FROM tab_items WHERE tab_id = p_tab_id AND menu_item_id = p_menu_item_id;

    IF v_qty > 0 THEN
        INSERT INTO tab_items (id, tab_id, menu_item_id, name, price, qty)
        VALUES ('item-' || p_tab_id || '-' || p_menu_item_id, p_tab_id, p_menu_item_id, v_item.name, v_item.price, v_qty);
    END IF;

    RETURN GREATEST(v_qty, 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION adjust_tab_item(TEXT, TEXT, INTEGER) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION adjust_tab_item(TEXT, TEXT, INTEGER) TO authenticated;

-- Tarifas de canchas y catálogo del bar: solo el propietario (recepción no ve esa sección)
DROP POLICY IF EXISTS "Staff update courts" ON courts;
DROP POLICY IF EXISTS "Staff insert menu_items" ON menu_items;
DROP POLICY IF EXISTS "Staff update menu_items" ON menu_items;

CREATE POLICY "Owners update courts" ON courts FOR UPDATE TO authenticated
    USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');
CREATE POLICY "Owners insert menu_items" ON menu_items FOR INSERT TO authenticated
    WITH CHECK (current_user_role() = 'owner');
CREATE POLICY "Owners update menu_items" ON menu_items FOR UPDATE TO authenticated
    USING (current_user_role() = 'owner') WITH CHECK (current_user_role() = 'owner');

-- ==============================================================================
-- Reservas de duración variable (60/90/120), sin solapamientos, estados simples,
-- vencimiento automático de solicitudes y autogestión de la reserva por el cliente.
-- Zona horaria del club: America/Asuncion (UTC-3 fijo desde 2024).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Configuración del club (pricing_config es clave/valor numérico)
INSERT INTO pricing_config (key, value, description) VALUES
('booking_hold_minutes', 60, 'Minutos para confirmar una solicitud web antes de liberarla.'),
('open_hour', 7, 'Hora de apertura (0-23).'),
('close_hour', 24, 'Hora de cierre; el último turno debe terminar antes (24 = medianoche).'),
('slot_step_minutes', 30, 'Cada cuántos minutos puede empezar un turno.'),
('booking_window_days', 14, 'Con cuántos días de anticipación se puede reservar online.'),
('cancel_notice_hours', 3, 'Horas mínimas de anticipación para que el cliente cancele online.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;

CREATE OR REPLACE FUNCTION club_setting(p_key TEXT, p_default NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE((SELECT value FROM pricing_config WHERE key = p_key), p_default);
$$;

-- Hora local del club (timestamp sin zona)
CREATE OR REPLACE FUNCTION club_now()
RETURNS TIMESTAMP
LANGUAGE sql
STABLE
AS $$
    SELECT (NOW() AT TIME ZONE 'America/Asuncion')::timestamp;
$$;

-- Celulares paraguayos: 0981 123456 / 981123456 / +595 981 123 456 -> +595981123456
CREATE OR REPLACE FUNCTION normalize_py_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_digits TEXT := regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g');
BEGIN
    IF v_digits LIKE '595%' THEN
        v_digits := substr(v_digits, 4);
    END IF;
    v_digits := ltrim(v_digits, '0');
    IF v_digits !~ '^9\d{8}$' THEN
        RETURN NULL;
    END IF;
    RETURN '+595' || v_digits;
END;
$$;

-- 2. Nuevas columnas de horario
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS start_time TIME,
    ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
    ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancelled_reason TEXT;

UPDATE bookings
SET start_time = (split_part(time_slot, ' - ', 1) || ':00')::time,
    duration_minutes = 60
WHERE start_time IS NULL;

-- 3. Estados simples
DROP INDEX IF EXISTS uq_bookings_active_slot;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_time_slot_format;  -- solo admitía horas en punto

UPDATE bookings SET status = 'Pendiente' WHERE status IN ('Solicitud Pendiente', 'Seña Pendiente');
UPDATE bookings SET status = 'Jugando' WHERE status IN ('En Cancha', 'En Pista');

-- Hora de inicio, fin y texto del turno se derivan siempre de fecha + inicio + duración
CREATE OR REPLACE FUNCTION trg_booking_schedule()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.duration_minutes NOT IN (60, 90, 120) THEN
        RAISE EXCEPTION 'INVALID_DURATION: La duración debe ser 60, 90 o 120 minutos.';
    END IF;
    NEW.starts_at := (NEW.date + NEW.start_time) AT TIME ZONE 'America/Asuncion';
    NEW.ends_at := NEW.starts_at + make_interval(mins => NEW.duration_minutes);
    NEW.time_slot := to_char(NEW.start_time, 'HH24:MI') || ' - '
                  || to_char(NEW.start_time + make_interval(mins => NEW.duration_minutes), 'HH24:MI');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_schedule ON bookings;
CREATE TRIGGER trg_bookings_schedule
BEFORE INSERT OR UPDATE OF date, start_time, duration_minutes ON bookings
FOR EACH ROW EXECUTE FUNCTION trg_booking_schedule();

UPDATE bookings SET duration_minutes = duration_minutes;  -- recalcula starts_at/ends_at

ALTER TABLE bookings
    ALTER COLUMN start_time SET NOT NULL,
    ALTER COLUMN duration_minutes SET NOT NULL,
    ALTER COLUMN duration_minutes SET DEFAULT 90;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('Pendiente', 'Confirmada', 'Jugando', 'Finalizada', 'Cancelada', 'No vino'));

-- Una cancha no puede tener dos turnos activos que se pisen
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_no_overlap;
ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (court_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
    WHERE (status IN ('Pendiente', 'Confirmada', 'Jugando', 'Finalizada'));

CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings (starts_at);

-- 4. Cancelar o marcar "No vino" cierra la cuenta POS sin cobro
CREATE OR REPLACE FUNCTION trg_booking_close_tab()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status IN ('Cancelada', 'No vino') AND OLD.status IS DISTINCT FROM NEW.status THEN
        UPDATE tabs
        SET status = 'cancelled', activity_status = 'liquidada', updated_at = NOW()
        WHERE linked_booking_id = NEW.id AND status = 'open';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_close_tab ON bookings;
CREATE TRIGGER trg_bookings_close_tab
AFTER UPDATE OF status ON bookings
FOR EACH ROW EXECUTE FUNCTION trg_booking_close_tab();

REVOKE EXECUTE ON FUNCTION trg_booking_close_tab() FROM PUBLIC, anon, authenticated;

-- Cuentas fantasma de reservas ya canceladas
UPDATE tabs t SET status = 'cancelled', activity_status = 'liquidada', updated_at = NOW()
FROM bookings b
WHERE b.id = t.linked_booking_id AND b.status IN ('Cancelada', 'No vino') AND t.status = 'open';

-- 5. Vencimiento de solicitudes web sin confirmar
CREATE OR REPLACE FUNCTION release_expired_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE bookings
    SET status = 'Cancelada', cancelled_reason = 'Solicitud vencida sin confirmar'
    WHERE status = 'Pendiente' AND expires_at IS NOT NULL AND expires_at < NOW();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION release_expired_bookings() FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'release-expired-bookings';
SELECT cron.schedule('release-expired-bookings', '*/5 * * * *', 'SELECT public.release_expired_bookings()');

-- 6. Validación común de una reserva nueva (público y staff)
CREATE OR REPLACE FUNCTION validate_booking_request(
    p_court_id TEXT, p_date DATE, p_start_time TEXT, p_duration INTEGER, p_is_staff BOOLEAN
)
RETURNS courts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_court courts;
    v_start TIME;
    v_open NUMERIC := club_setting('open_hour', 7);
    v_close NUMERIC := club_setting('close_hour', 24);
    v_step NUMERIC := club_setting('slot_step_minutes', 30);
    v_window NUMERIC := club_setting('booking_window_days', 14);
    v_start_min INTEGER;
BEGIN
    IF p_duration NOT IN (60, 90, 120) THEN
        RAISE EXCEPTION 'INVALID_DURATION: La duración debe ser 60, 90 o 120 minutos.';
    END IF;

    BEGIN
        v_start := p_start_time::time;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'INVALID_TIME: Horario inválido.';
    END;

    v_start_min := extract(hour FROM v_start)::int * 60 + extract(minute FROM v_start)::int;
    IF v_start_min % v_step::int <> 0
       OR v_start_min < v_open * 60
       OR v_start_min + p_duration > v_close * 60 THEN
        RAISE EXCEPTION 'OUTSIDE_HOURS: El turno está fuera del horario del club.';
    END IF;

    IF NOT p_is_staff THEN
        IF (p_date + v_start) <= club_now() THEN
            RAISE EXCEPTION 'PAST_SLOT: Ese horario ya pasó.';
        END IF;
        IF p_date > club_now()::date + v_window::int THEN
            RAISE EXCEPTION 'TOO_FAR: Solo se puede reservar con % días de anticipación.', v_window;
        END IF;
    END IF;

    SELECT * INTO v_court FROM courts WHERE id = p_court_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURT_NOT_FOUND: La cancha no existe.';
    END IF;
    IF NOT p_is_staff AND v_court.status <> 'operational' THEN
        RAISE EXCEPTION 'COURT_NOT_AVAILABLE: La cancha no está disponible.';
    END IF;

    RETURN v_court;
END;
$$;

REVOKE EXECUTE ON FUNCTION validate_booking_request(TEXT, DATE, TEXT, INTEGER, BOOLEAN) FROM PUBLIC, anon, authenticated;

-- 7. Reserva pública
DROP FUNCTION IF EXISTS create_public_booking(TEXT, DATE, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION request_booking(
    p_court_id TEXT,
    p_date DATE,
    p_start_time TEXT,
    p_duration INTEGER,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_rented_rackets INTEGER DEFAULT 0,
    p_ball_tubes INTEGER DEFAULT 0,
    p_bar_table_requested BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_court courts;
    v_phone TEXT := normalize_py_phone(p_client_phone);
    v_name TEXT := trim(COALESCE(p_client_name, ''));
    v_amount INTEGER;
    v_racket_fee INTEGER := club_setting('racket_rental_fee', 30000)::int;
    v_ball_fee INTEGER := club_setting('ball_tube_fee', 70000)::int;
    v_booking_id TEXT := 'book-' || replace(gen_random_uuid()::text, '-', '');
    v_tab_id TEXT := 'tab-' || replace(gen_random_uuid()::text, '-', '');
    v_code TEXT;
    v_row bookings;
BEGIN
    IF length(v_name) < 2 THEN
        RAISE EXCEPTION 'INVALID_NAME: Ingresá tu nombre.';
    END IF;
    IF v_phone IS NULL THEN
        RAISE EXCEPTION 'INVALID_PHONE: Ingresá un celular paraguayo válido (09XX XXX XXX).';
    END IF;
    IF COALESCE(p_rented_rackets, 0) NOT BETWEEN 0 AND 4 OR COALESCE(p_ball_tubes, 0) NOT BETWEEN 0 AND 6 THEN
        RAISE EXCEPTION 'INVALID_EQUIPMENT: Paletas (0-4) o tubos (0-6) inválidos.';
    END IF;

    -- Máximo 2 solicitudes pendientes por celular, para que nadie acapare turnos
    IF (SELECT count(*) FROM bookings WHERE client_phone = v_phone AND status = 'Pendiente') >= 2 THEN
        RAISE EXCEPTION 'MAX_PENDING_REACHED: Ya tenés 2 solicitudes esperando confirmación.';
    END IF;

    PERFORM release_expired_bookings();
    v_court := validate_booking_request(p_court_id, p_date, p_start_time, p_duration, FALSE);
    v_amount := round(v_court.rate * p_duration / 60.0)::int;
    v_code := gen_booking_code();

    BEGIN
        INSERT INTO bookings (
            id, code, court_id, date, start_time, duration_minutes, time_slot, client_name, client_phone,
            category, status, court_amount, deposit_paid, bar_table_requested, rented_rackets, ball_tubes,
            linked_tab_id, expires_at, created_at_time, created_at
        ) VALUES (
            v_booking_id, v_code, p_court_id, p_date, p_start_time::time, p_duration, '', v_name, v_phone,
            'Reserva Estándar', 'Pendiente', v_amount, 0, COALESCE(p_bar_table_requested, FALSE),
            COALESCE(p_rented_rackets, 0), COALESCE(p_ball_tubes, 0), v_tab_id,
            NOW() + make_interval(mins => club_setting('booking_hold_minutes', 60)::int),
            to_char(club_now(), 'HH24:MI'), NOW()
        )
        RETURNING * INTO v_row;
    EXCEPTION WHEN exclusion_violation OR unique_violation THEN
        RAISE EXCEPTION 'SLOT_ALREADY_BOOKED: Ese horario se acaba de ocupar. Elegí otro.';
    END;

    INSERT INTO tabs (
        id, linked_booking_id, court_id, court_name, client_name, court_amount, deposit_paid,
        racket_count, racket_unit_fee, ball_tube_count, ball_tube_unit_fee,
        status, activity_status, bar_table_requested, opened_at
    ) VALUES (
        v_tab_id, v_booking_id, p_court_id, v_court.name, v_name, v_amount, 0,
        COALESCE(p_rented_rackets, 0), v_racket_fee, COALESCE(p_ball_tubes, 0), v_ball_fee,
        'open', 'en_cancha', COALESCE(p_bar_table_requested, FALSE), to_char(club_now(), 'HH24:MI')
    );

    RETURN jsonb_build_object(
        'id', v_row.id, 'code', v_row.code, 'courtId', v_row.court_id, 'courtName', v_court.name,
        'date', v_row.date, 'startTime', to_char(v_row.start_time, 'HH24:MI'),
        'durationMinutes', v_row.duration_minutes, 'timeSlot', v_row.time_slot,
        'clientName', v_row.client_name, 'clientPhone', v_row.client_phone,
        'status', v_row.status, 'courtAmount', v_row.court_amount,
        'rentedRackets', v_row.rented_rackets, 'ballTubes', v_row.ball_tubes,
        'equipmentTotal', v_row.rented_rackets * v_racket_fee + v_row.ball_tubes * v_ball_fee,
        'expiresAt', v_row.expires_at, 'linkedTabId', v_tab_id
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION request_booking(TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION request_booking(TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN) TO anon, authenticated;

-- 8. Ocupación pública por día (sin datos personales)
DROP FUNCTION IF EXISTS get_public_occupied_slots(DATE);

CREATE OR REPLACE FUNCTION get_public_availability(p_date DATE)
RETURNS TABLE (court_id TEXT, start_time TEXT, end_time TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT b.court_id,
           to_char(b.start_time, 'HH24:MI'),
           to_char(b.start_time + make_interval(mins => b.duration_minutes), 'HH24:MI')
    FROM bookings b
    WHERE b.date = p_date
      AND b.status IN ('Pendiente', 'Confirmada', 'Jugando', 'Finalizada')
      AND NOT (b.status = 'Pendiente' AND b.expires_at < NOW());
$$;

REVOKE EXECUTE ON FUNCTION get_public_availability(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_availability(DATE) TO anon, authenticated;

-- 9. "Mi reserva": el cliente la consulta y la cancela con código + celular
CREATE OR REPLACE FUNCTION get_my_booking(p_code TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT jsonb_build_object(
        'code', b.code, 'courtName', c.name, 'date', b.date,
        'startTime', to_char(b.start_time, 'HH24:MI'), 'durationMinutes', b.duration_minutes,
        'timeSlot', b.time_slot, 'clientName', b.client_name, 'status', b.status,
        'courtAmount', b.court_amount, 'expiresAt', b.expires_at,
        'canCancel', b.status IN ('Pendiente', 'Confirmada')
            AND b.starts_at - make_interval(hours => club_setting('cancel_notice_hours', 3)::int) > NOW(),
        'cancelNoticeHours', club_setting('cancel_notice_hours', 3)
    )
    FROM bookings b JOIN courts c ON c.id = b.court_id
    WHERE upper(b.code) = upper(trim(p_code)) AND b.client_phone = normalize_py_phone(p_phone);
$$;

CREATE OR REPLACE FUNCTION cancel_my_booking(p_code TEXT, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking bookings;
BEGIN
    SELECT * INTO v_booking FROM bookings
    WHERE upper(code) = upper(trim(p_code)) AND client_phone = normalize_py_phone(p_phone)
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_NOT_FOUND: No encontramos una reserva con ese código y celular.';
    END IF;
    IF v_booking.status NOT IN ('Pendiente', 'Confirmada') THEN
        RAISE EXCEPTION 'CANNOT_CANCEL: Esta reserva ya no se puede cancelar.';
    END IF;
    IF v_booking.starts_at - make_interval(hours => club_setting('cancel_notice_hours', 3)::int) <= NOW() THEN
        RAISE EXCEPTION 'TOO_LATE_TO_CANCEL: Faltan menos de % horas; escribinos por WhatsApp.',
            club_setting('cancel_notice_hours', 3);
    END IF;

    UPDATE bookings SET status = 'Cancelada', cancelled_reason = 'Cancelada por el cliente'
    WHERE id = v_booking.id;

    RETURN get_my_booking(p_code, p_phone);
END;
$$;

REVOKE EXECUTE ON FUNCTION get_my_booking(TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION cancel_my_booking(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_my_booking(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cancel_my_booking(TEXT, TEXT) TO anon, authenticated;

-- 10. Reserva desde recepción (confirmada directo, puede ser en el pasado o en cancha en mantenimiento)
DROP FUNCTION IF EXISTS create_staff_booking(TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, INTEGER, INTEGER, BOOLEAN, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION create_staff_booking(
    p_booking_id TEXT,
    p_tab_id TEXT,
    p_court_id TEXT,
    p_date DATE,
    p_start_time TEXT,
    p_duration INTEGER,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_category TEXT DEFAULT 'Reserva Estándar',
    p_court_amount INTEGER DEFAULT NULL,
    p_rented_rackets INTEGER DEFAULT 0,
    p_ball_tubes INTEGER DEFAULT 0,
    p_bar_table_requested BOOLEAN DEFAULT FALSE,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_court courts;
    v_existing bookings;
    v_row bookings;
    v_phone TEXT := normalize_py_phone(p_client_phone);
    v_name TEXT := trim(COALESCE(p_client_name, ''));
    v_amount INTEGER;
    v_racket_fee INTEGER := club_setting('racket_rental_fee', 30000)::int;
    v_ball_fee INTEGER := club_setting('ball_tube_fee', 70000)::int;
    v_player_id TEXT;
    v_is_block BOOLEAN := p_category = 'Bloqueo';
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede cargar reservas desde el CRM.';
    END IF;

    SELECT * INTO v_existing FROM bookings WHERE id = p_booking_id;
    IF FOUND THEN
        RETURN jsonb_build_object('id', v_existing.id, 'code', v_existing.code, 'status', v_existing.status,
                                  'timeSlot', v_existing.time_slot, 'linkedTabId', v_existing.linked_tab_id);
    END IF;

    IF length(v_name) < 2 THEN
        RAISE EXCEPTION 'INVALID_NAME: Ingresá el nombre del cliente o el motivo del bloqueo.';
    END IF;
    IF NULLIF(trim(COALESCE(p_client_phone, '')), '') IS NOT NULL AND v_phone IS NULL THEN
        RAISE EXCEPTION 'INVALID_PHONE: Celular inválido (09XX XXX XXX).';
    END IF;
    IF COALESCE(p_rented_rackets, 0) NOT BETWEEN 0 AND 4 OR COALESCE(p_ball_tubes, 0) NOT BETWEEN 0 AND 6 THEN
        RAISE EXCEPTION 'INVALID_EQUIPMENT: Paletas (0-4) o tubos (0-6) inválidos.';
    END IF;

    v_court := validate_booking_request(p_court_id, p_date, p_start_time, p_duration, TRUE);
    v_amount := CASE WHEN v_is_block THEN 0
                     ELSE COALESCE(p_court_amount, round(v_court.rate * p_duration / 60.0)::int) END;
    IF v_amount < 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: El monto no puede ser negativo.';
    END IF;

    BEGIN
        INSERT INTO bookings (
            id, code, court_id, date, start_time, duration_minutes, time_slot, client_name, client_phone,
            category, status, court_amount, deposit_paid, bar_table_requested, rented_rackets, ball_tubes,
            linked_tab_id, created_at_time, created_at, cancelled_reason
        ) VALUES (
            p_booking_id, gen_booking_code(), p_court_id, p_date, p_start_time::time, p_duration, '',
            v_name, COALESCE(v_phone, ''), COALESCE(p_category, 'Reserva Estándar'), 'Confirmada', v_amount, 0,
            COALESCE(p_bar_table_requested, FALSE), COALESCE(p_rented_rackets, 0), COALESCE(p_ball_tubes, 0),
            CASE WHEN v_is_block THEN NULL ELSE p_tab_id END, to_char(club_now(), 'HH24:MI'), NOW(), p_notes
        )
        RETURNING * INTO v_row;
    EXCEPTION WHEN exclusion_violation OR unique_violation THEN
        RAISE EXCEPTION 'SLOT_ALREADY_BOOKED: La cancha ya está ocupada en ese horario.';
    END;

    IF v_is_block THEN
        RETURN jsonb_build_object('id', v_row.id, 'code', v_row.code, 'status', v_row.status, 'timeSlot', v_row.time_slot);
    END IF;

    INSERT INTO tabs (
        id, linked_booking_id, court_id, court_name, client_name, court_amount, deposit_paid,
        racket_count, racket_unit_fee, ball_tube_count, ball_tube_unit_fee,
        status, activity_status, bar_table_requested, opened_at
    ) VALUES (
        p_tab_id, p_booking_id, p_court_id, v_court.name, v_name, v_amount, 0,
        COALESCE(p_rented_rackets, 0), v_racket_fee, COALESCE(p_ball_tubes, 0), v_ball_fee,
        'open', 'en_cancha', COALESCE(p_bar_table_requested, FALSE), to_char(club_now(), 'HH24:MI')
    );

    IF v_phone IS NOT NULL THEN
        SELECT id INTO v_player_id FROM players WHERE phone = v_phone LIMIT 1;
        IF v_player_id IS NOT NULL THEN
            UPDATE players
            SET total_bookings = total_bookings + 1, total_spent = total_spent + v_amount,
                last_visit = to_char(p_date, 'DD/MM'), updated_at = NOW()
            WHERE id = v_player_id;
        ELSE
            INSERT INTO players (id, name, phone, category, is_fixed_pass_holder, total_bookings, total_spent, status, last_visit)
            VALUES ('plr-' || p_booking_id, v_name, v_phone, 'Sin categoría',
                    p_category = 'Turno Fijo', 1, v_amount, 'Jugador Registrado', to_char(p_date, 'DD/MM'));
        END IF;
    END IF;

    RETURN jsonb_build_object('id', v_row.id, 'code', v_row.code, 'status', v_row.status,
                              'timeSlot', v_row.time_slot, 'courtAmount', v_row.court_amount, 'linkedTabId', p_tab_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION create_staff_booking(TEXT, TEXT, TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION create_staff_booking(TEXT, TEXT, TEXT, DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, BOOLEAN, TEXT) TO authenticated;

-- 11. Normalizar celulares existentes de clientes y reservas (los inválidos quedan como estaban)
UPDATE players SET phone = normalize_py_phone(phone) WHERE normalize_py_phone(phone) IS NOT NULL;
UPDATE bookings SET client_phone = normalize_py_phone(client_phone) WHERE normalize_py_phone(client_phone) IS NOT NULL;

-- ==============================================================================
-- Caja: cobros mixtos por cuenta (efectivo, transferencia, QR, tarjetas, billetera),
-- datos de factura (RUC + razón social), venta de barra sin reserva y
-- apertura / cierre de caja con arqueo de efectivo.
-- ==============================================================================

-- 1. RUC paraguayo: número + dígito verificador (módulo 11, base 11, como la SET)
CREATE OR REPLACE FUNCTION py_ruc_is_valid(p_ruc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_clean TEXT := upper(regexp_replace(COALESCE(p_ruc, ''), '[\s\.]', '', 'g'));
    v_base TEXT;
    v_dv INTEGER;
    v_total INTEGER := 0;
    v_k INTEGER := 2;
    v_rest INTEGER;
    i INTEGER;
BEGIN
    IF v_clean !~ '^\d{3,9}-\d$' THEN
        RETURN FALSE;
    END IF;
    v_base := split_part(v_clean, '-', 1);
    v_dv := split_part(v_clean, '-', 2)::int;
    FOR i IN REVERSE length(v_base)..1 LOOP
        v_total := v_total + substr(v_base, i, 1)::int * v_k;
        v_k := CASE WHEN v_k >= 11 THEN 2 ELSE v_k + 1 END;
    END LOOP;
    v_rest := v_total % 11;
    RETURN v_dv = CASE WHEN v_rest > 1 THEN 11 - v_rest ELSE 0 END;
END;
$$;

-- 2. Datos nuevos en cuentas y cajas
ALTER TABLE tabs
    ADD COLUMN IF NOT EXISTS invoice_ruc TEXT,
    ADD COLUMN IF NOT EXISTS invoice_name TEXT,
    ADD COLUMN IF NOT EXISTS change_given INTEGER NOT NULL DEFAULT 0;

ALTER TABLE daily_cash_registers
    ADD COLUMN IF NOT EXISTS expected_cash NUMERIC,
    ADD COLUMN IF NOT EXISTS counted_cash NUMERIC,
    ADD COLUMN IF NOT EXISTS cash_difference NUMERIC;

-- Solo una caja abierta a la vez
CREATE UNIQUE INDEX IF NOT EXISTS uq_one_open_register ON daily_cash_registers ((status)) WHERE status = 'open';

CREATE TABLE IF NOT EXISTS tab_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tab_id TEXT NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
    register_id UUID REFERENCES daily_cash_registers(id) ON DELETE SET NULL,
    method TEXT NOT NULL CHECK (method IN ('Efectivo', 'Transferencia', 'QR', 'Débito', 'Crédito', 'Billetera')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tab_payments_register ON tab_payments (register_id);
CREATE INDEX IF NOT EXISTS idx_tab_payments_created ON tab_payments (created_at);

ALTER TABLE tab_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff read tab_payments" ON tab_payments;
CREATE POLICY "Staff read tab_payments" ON tab_payments FOR SELECT TO authenticated USING (is_staff());

-- 3. Total de una cuenta (misma fórmula que settle_tab)
CREATE OR REPLACE FUNCTION tab_net_pending(p_tab tabs)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT GREATEST(0,
        COALESCE(p_tab.court_amount, 0)
        + COALESCE(p_tab.racket_count, 0) * COALESCE(p_tab.racket_unit_fee, 0)
        + COALESCE(p_tab.ball_tube_count, 0) * COALESCE(p_tab.ball_tube_unit_fee, 0)
        + COALESCE((SELECT SUM(price * qty) FROM tab_items WHERE tab_id = p_tab.id), 0)
        - COALESCE(p_tab.deposit_paid, 0)
    )::int;
$$;

REVOKE EXECUTE ON FUNCTION tab_net_pending(tabs) FROM PUBLIC, anon, authenticated;

-- 4. Cobro de una cuenta con uno o varios medios de pago
CREATE OR REPLACE FUNCTION pay_tab(
    p_tab_id TEXT,
    p_payments JSONB,
    p_invoice_ruc TEXT DEFAULT NULL,
    p_invoice_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tab tabs;
    v_net INTEGER;
    v_paid INTEGER := 0;
    v_cash INTEGER := 0;
    v_change INTEGER;
    v_methods TEXT[];
    v_register UUID;
    v_payment JSONB;
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede cobrar cuentas.';
    END IF;

    SELECT * INTO v_tab FROM tabs WHERE id = p_tab_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'TAB_NOT_FOUND: La cuenta no existe.';
    END IF;
    IF v_tab.status <> 'open' THEN
        RAISE EXCEPTION 'TAB_NOT_OPEN: La cuenta ya fue cobrada o cancelada.';
    END IF;

    IF NULLIF(trim(COALESCE(p_invoice_ruc, '')), '') IS NOT NULL THEN
        IF NOT py_ruc_is_valid(p_invoice_ruc) THEN
            RAISE EXCEPTION 'INVALID_RUC: El RUC no es válido. Revisá el número y el dígito verificador.';
        END IF;
        IF length(trim(COALESCE(p_invoice_name, ''))) < 2 THEN
            RAISE EXCEPTION 'INVALID_INVOICE_NAME: Ingresá la razón social para la factura.';
        END IF;
    END IF;

    IF jsonb_typeof(p_payments) <> 'array' OR jsonb_array_length(p_payments) = 0 THEN
        RAISE EXCEPTION 'NO_PAYMENTS: Indicá al menos un medio de pago.';
    END IF;

    v_net := tab_net_pending(v_tab);

    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments) LOOP
        IF (v_payment->>'amount')::int <= 0 THEN
            RAISE EXCEPTION 'INVALID_AMOUNT: Los montos deben ser mayores a cero.';
        END IF;
        v_paid := v_paid + (v_payment->>'amount')::int;
        IF v_payment->>'method' = 'Efectivo' THEN
            v_cash := v_cash + (v_payment->>'amount')::int;
        END IF;
        v_methods := array_append(v_methods, v_payment->>'method');
    END LOOP;

    IF v_paid < v_net THEN
        RAISE EXCEPTION 'UNDERPAID: Faltan % Gs. para cubrir la cuenta.', v_net - v_paid;
    END IF;
    v_change := v_paid - v_net;
    -- Solo se da vuelto sobre el efectivo
    IF v_change > v_cash THEN
        RAISE EXCEPTION 'OVERPAID: Los pagos que no son en efectivo superan el total.';
    END IF;

    SELECT id INTO v_register FROM daily_cash_registers WHERE status = 'open' LIMIT 1;

    INSERT INTO tab_payments (tab_id, register_id, method, amount, created_by)
    SELECT p_tab_id, v_register, x->>'method', (x->>'amount')::int, auth.uid()
    FROM jsonb_array_elements(p_payments) x;

    UPDATE tabs
    SET status = 'settled',
        activity_status = 'liquidada',
        payment_method = CASE WHEN (SELECT count(DISTINCT m) FROM unnest(v_methods) m) > 1 THEN 'Mixto' ELSE v_methods[1] END,
        settled_at = to_char(club_now(), 'HH24:MI'),
        cashed_by = auth.uid(),
        cashed_at = NOW(),
        change_given = v_change,
        invoice_ruc = NULLIF(upper(trim(COALESCE(p_invoice_ruc, ''))), ''),
        invoice_name = NULLIF(trim(COALESCE(p_invoice_name, '')), ''),
        updated_at = NOW()
    WHERE id = p_tab_id;

    IF v_tab.linked_booking_id IS NOT NULL THEN
        UPDATE bookings SET status = 'Finalizada' WHERE id = v_tab.linked_booking_id AND status NOT IN ('Cancelada', 'No vino');
    END IF;

    RETURN jsonb_build_object('tabId', p_tab_id, 'total', v_net, 'paid', v_paid, 'change', v_change,
                              'registerOpen', v_register IS NOT NULL);
END;
$$;

REVOKE EXECUTE ON FUNCTION pay_tab(TEXT, JSONB, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION pay_tab(TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- 5. Venta de barra sin reserva
CREATE OR REPLACE FUNCTION open_walkin_tab(p_tab_id TEXT, p_client_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede abrir cuentas.';
    END IF;
    INSERT INTO tabs (id, client_name, court_amount, deposit_paid, racket_count, racket_unit_fee,
                      ball_tube_count, ball_tube_unit_fee, status, activity_status, bar_table_requested, opened_at)
    VALUES (p_tab_id, COALESCE(NULLIF(trim(p_client_name), ''), 'Venta de barra'), 0, 0, 0,
            club_setting('racket_rental_fee', 30000)::int, 0, club_setting('ball_tube_fee', 70000)::int,
            'open', 'en_barra', FALSE, to_char(club_now(), 'HH24:MI'))
    ON CONFLICT (id) DO NOTHING;
    RETURN jsonb_build_object('id', p_tab_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION open_walkin_tab(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION open_walkin_tab(TEXT, TEXT) TO authenticated;

-- 6. Apertura y cierre de caja
CREATE OR REPLACE FUNCTION open_cash_register(p_opening_balance NUMERIC, p_shift_name TEXT DEFAULT 'General')
RETURNS daily_cash_registers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row daily_cash_registers;
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede abrir la caja.';
    END IF;
    IF COALESCE(p_opening_balance, -1) < 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: El fondo de caja no puede ser negativo.';
    END IF;
    BEGIN
        INSERT INTO daily_cash_registers (register_date, shift_name, status, opened_by, opened_at, opening_balance)
        VALUES (club_now()::date, COALESCE(NULLIF(trim(p_shift_name), ''), 'General'), 'open', auth.uid(), NOW(), p_opening_balance)
        RETURNING * INTO v_row;
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'REGISTER_ALREADY_OPEN: Ya hay una caja abierta. Cerrala antes de abrir otra.';
    END;
    RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION close_cash_register(p_register_id UUID, p_counted_cash NUMERIC, p_notes TEXT DEFAULT NULL)
RETURNS daily_cash_registers
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reg daily_cash_registers;
    v_breakdown JSONB;
    v_total NUMERIC;
    v_cash NUMERIC;
    v_change NUMERIC;
    v_expected NUMERIC;
BEGIN
    IF NOT is_staff() THEN
        RAISE EXCEPTION 'NOT_STAFF: Solo el staff puede cerrar la caja.';
    END IF;
    SELECT * INTO v_reg FROM daily_cash_registers WHERE id = p_register_id FOR UPDATE;
    IF NOT FOUND OR v_reg.status <> 'open' THEN
        RAISE EXCEPTION 'REGISTER_NOT_OPEN: Esa caja no está abierta.';
    END IF;
    IF COALESCE(p_counted_cash, -1) < 0 THEN
        RAISE EXCEPTION 'INVALID_AMOUNT: Ingresá el efectivo contado.';
    END IF;

    SELECT COALESCE(jsonb_object_agg(method, total), '{}'::jsonb), COALESCE(SUM(total), 0)
    INTO v_breakdown, v_total
    FROM (SELECT method, SUM(amount) AS total FROM tab_payments WHERE register_id = p_register_id GROUP BY method) s;

    v_cash := COALESCE((v_breakdown->>'Efectivo')::numeric, 0);
    SELECT COALESCE(SUM(t.change_given), 0) INTO v_change
    FROM tabs t WHERE t.id IN (SELECT DISTINCT tab_id FROM tab_payments WHERE register_id = p_register_id);
    v_expected := v_reg.opening_balance + v_cash - v_change;

    UPDATE daily_cash_registers
    SET status = 'closed',
        closed_by = auth.uid(),
        closed_at = NOW(),
        payment_breakdown = v_breakdown,
        total_collected = GREATEST(0, v_total - v_change),
        expected_cash = v_expected,
        counted_cash = p_counted_cash,
        cash_difference = p_counted_cash - v_expected,
        notes = p_notes,
        updated_at = NOW()
    WHERE id = p_register_id
    RETURNING * INTO v_reg;

    RETURN v_reg;
END;
$$;

REVOKE EXECUTE ON FUNCTION open_cash_register(NUMERIC, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION close_cash_register(UUID, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION open_cash_register(NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION close_cash_register(UUID, NUMERIC, TEXT) TO authenticated;

-- 7. Realtime para que caja y agenda se actualicen entre dispositivos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tab_payments') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE tab_payments;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'daily_cash_registers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE daily_cash_registers;
    END IF;
END;
$$;
