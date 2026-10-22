-- ==============================================================================
-- MIGRACIÓN 003: CREACIÓN DE RESERVAS SEGURAS EN SERVIDOR (RPC) Y RESTRICCIÓN RLS
-- Archivo: supabase/migrations/20261022000003_rpc_create_public_booking.sql
-- Propósito: 
-- 1. Crear función RPC create_public_booking() con validación de hora, tarifas
--    oficiales, cálculo seguro de seña, límite de reservas pendientes y control de errores.
-- 2. Restringir la política de INSERT público directo sobre 'bookings' y 'tabs'.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNCIÓN RPC: create_public_booking
-- ------------------------------------------------------------------------------
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
    v_deposit_percent NUMERIC;
    v_hold_minutes NUMERIC;
    
    v_now_asuncion TIMESTAMP;
    v_slot_start_time TIME;
    v_slot_start_text TEXT;
    
    v_pending_count INTEGER;
    v_court_amount INTEGER;
    v_equipment_total INTEGER;
    v_deposit_required INTEGER;
    
    v_booking_id TEXT;
    v_booking_code TEXT;
    v_tab_id TEXT;
    v_expires_at TIMESTAMPTZ;
    v_created_time_str TEXT;
    
    v_result JSONB;
BEGIN
    -- -------------------------------------------------------------------------
    -- 1. Validaciones básicas de entrada
    -- -------------------------------------------------------------------------
    IF p_client_name IS NULL OR length(trim(p_client_name)) < 2 OR length(p_client_name) > 100 THEN
        RAISE EXCEPTION 'INVALID_NAME: El nombre debe tener entre 2 y 100 caracteres.';
    END IF;

    IF p_client_phone IS NULL OR length(trim(p_client_phone)) < 6 OR length(p_client_phone) > 30 THEN
        RAISE EXCEPTION 'INVALID_PHONE: El número de teléfono/WhatsApp no es válido.';
    END IF;

    -- Límite seguro de cantidades
    IF p_rented_rackets < 0 OR p_rented_rackets > 4 THEN
        RAISE EXCEPTION 'INVALID_RACKETS: La cantidad de paletas debe estar entre 0 y 4.';
    END IF;

    IF p_ball_tubes < 0 OR p_ball_tubes > 6 THEN
        RAISE EXCEPTION 'INVALID_BALLS: La cantidad de tubos de pelotas debe estar entre 0 y 6.';
    END IF;

    -- -------------------------------------------------------------------------
    -- 2. Validación de Horario y Fecha Pasada (Hora oficial Paraguay: America/Asuncion)
    -- -------------------------------------------------------------------------
    v_now_asuncion := (NOW() AT TIME ZONE 'America/Asuncion')::timestamp;
    
    IF p_date < (v_now_asuncion::date) THEN
        RAISE EXCEPTION 'PAST_SLOT: No es posible reservar turnos en fechas pasadas.';
    END IF;

    -- Extraer la hora de inicio del time_slot (ej: '18:00 - 19:00' -> '18:00')
    v_slot_start_text := split_part(p_time_slot, ' - ', 1);
    BEGIN
        v_slot_start_time := (v_slot_start_text || ':00')::time;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'INVALID_TIMESLOT_FORMAT: Formato de horario inválido (se esperaba HH:00 - HH:00).';
    END;

    -- Si la fecha es hoy, validar que el turno no haya iniciado ya
    IF p_date = (v_now_asuncion::date) AND v_slot_start_time <= (v_now_asuncion::time) THEN
        RAISE EXCEPTION 'PAST_SLOT: Este turno ya ha iniciado o transcurrido para el día de hoy.';
    END IF;

    -- -------------------------------------------------------------------------
    -- 3. Verificar que la cancha exista y esté operativa
    -- -------------------------------------------------------------------------
    SELECT * INTO v_court 
    FROM courts 
    WHERE id = p_court_id AND status = 'operational';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURT_NOT_AVAILABLE: La cancha seleccionada no está disponible u operativa.';
    END IF;

    -- -------------------------------------------------------------------------
    -- 4. Leer configuración oficial de precios del servidor
    -- -------------------------------------------------------------------------
    SELECT value INTO v_racket_fee FROM pricing_config WHERE key = 'racket_rental_fee';
    IF v_racket_fee IS NULL THEN v_racket_fee := 30000; END IF;

    SELECT value INTO v_ball_fee FROM pricing_config WHERE key = 'ball_tube_fee';
    IF v_ball_fee IS NULL THEN v_ball_fee := 70000; END IF;

    SELECT value INTO v_deposit_percent FROM pricing_config WHERE key = 'deposit_percent';
    IF v_deposit_percent IS NULL THEN v_deposit_percent := 50; END IF;

    SELECT value INTO v_hold_minutes FROM pricing_config WHERE key = 'booking_hold_minutes';
    IF v_hold_minutes IS NULL THEN v_hold_minutes := 30; END IF;

    -- -------------------------------------------------------------------------
    -- 5. Rate limiting básico por teléfono (máximo 3 reservas 'Seña Pendiente' activas)
    -- -------------------------------------------------------------------------
    SELECT COUNT(*) INTO v_pending_count 
    FROM bookings 
    WHERE client_phone = trim(p_client_phone) 
      AND status = 'Seña Pendiente'
      AND (expires_at IS NULL OR expires_at > NOW());

    IF v_pending_count >= 3 THEN
        RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Posee múltiples reservas pendientes de seña activas. Complete la seña antes de emitir una nueva.';
    END IF;

    -- -------------------------------------------------------------------------
    -- 6. Calcular montos oficiales en el servidor
    -- -------------------------------------------------------------------------
    v_court_amount := v_court.rate;
    v_equipment_total := (p_rented_rackets * v_racket_fee::integer) + (p_ball_tubes * v_ball_fee::integer);
    v_deposit_required := round(v_court_amount * (v_deposit_percent / 100.0));

    -- Generar identificadores seguros y timestamps
    v_booking_id := 'book-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_booking_code := 'BC-' || (1000 + floor(random() * 9000))::text;
    v_tab_id := 'tab-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_expires_at := NOW() + (v_hold_minutes || ' minutes')::interval;
    v_created_time_str := to_char(v_now_asuncion, 'HH24:MI');

    -- -------------------------------------------------------------------------
    -- 7. Inserción atómica en bookings y tabs con captura de concurrencia
    -- -------------------------------------------------------------------------
    BEGIN
        INSERT INTO bookings (
            id,
            code,
            court_id,
            date,
            time_slot,
            client_name,
            client_phone,
            category,
            status,
            court_amount,
            deposit_paid,
            bar_table_requested,
            rented_rackets,
            ball_tubes,
            linked_tab_id,
            expires_at,
            created_at_time,
            created_at,
            updated_at
        ) VALUES (
            v_booking_id,
            v_booking_code,
            p_court_id,
            p_date,
            p_time_slot,
            trim(p_client_name),
            trim(p_client_phone),
            'Reserva Estándar',
            'Seña Pendiente',
            v_court_amount,
            v_deposit_required,
            COALESCE(p_bar_table_requested, FALSE),
            p_rented_rackets,
            p_ball_tubes,
            v_tab_id,
            v_expires_at,
            v_created_time_str,
            NOW(),
            NOW()
        );

        INSERT INTO tabs (
            id,
            linked_booking_id,
            court_id,
            court_name,
            client_name,
            court_amount,
            deposit_paid,
            racket_count,
            racket_unit_fee,
            ball_tube_count,
            ball_tube_unit_fee,
            status,
            activity_status,
            payment_method,
            bar_table_requested,
            opened_at,
            created_at,
            updated_at
        ) VALUES (
            v_tab_id,
            v_booking_id,
            p_court_id,
            v_court.name,
            trim(p_client_name),
            v_court_amount,
            v_deposit_required,
            p_rented_rackets,
            v_racket_fee::integer,
            p_ball_tubes,
            v_ball_fee::integer,
            'open',
            'en_cancha',
            NULL,
            COALESCE(p_bar_table_requested, FALSE),
            v_created_time_str,
            NOW(),
            NOW()
        );

    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'SLOT_ALREADY_BOOKED: El turno % en % para el % ya fue reservado por otro jugador.', 
            p_time_slot, v_court.name, p_date;
    END;

    -- Construir objeto de respuesta JSON idéntico al modelo frontend
    v_result := jsonb_build_object(
        'id', v_booking_id,
        'code', v_booking_code,
        'courtId', p_court_id,
        'date', p_date::text,
        'timeSlot', p_time_slot,
        'clientName', trim(p_client_name),
        'clientPhone', trim(p_client_phone),
        'category', 'Reserva Estándar',
        'status', 'Seña Pendiente',
        'courtAmount', v_court_amount,
        'depositPaid', v_deposit_required,
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

COMMENT ON FUNCTION create_public_booking IS 
'Crea una reserva pública de forma atómica validando disponibilidad, tarifas oficiales del servidor y expiración de seña a 30 minutos.';

-- ------------------------------------------------------------------------------
-- 2. RESTRICCIÓN DE POLÍTICAS RLS (Seguridad en Bookings y Tabs)
-- Los clientes anónimos ya NO pueden hacer INSERT directo con montos manipulados.
-- Solo pueden reservar a través de la función create_public_booking().
-- El staff autenticado conserva permiso total para crear reservas manuales y abonos.
-- ------------------------------------------------------------------------------

-- Bookings
DROP POLICY IF EXISTS "Allow insert bookings" ON bookings;
CREATE POLICY "Allow authenticated staff insert bookings" ON bookings
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Tabs
DROP POLICY IF EXISTS "Allow insert tabs" ON tabs;
CREATE POLICY "Allow authenticated staff insert tabs" ON tabs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Dar permiso de ejecución pública sobre la RPC a usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION create_public_booking TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- ROLLBACK (En caso de ser necesario revertir):
-- DROP FUNCTION IF EXISTS create_public_booking;
-- CREATE POLICY "Allow insert bookings" ON bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow insert tabs" ON tabs FOR INSERT WITH CHECK (true);
-- ------------------------------------------------------------------------------
