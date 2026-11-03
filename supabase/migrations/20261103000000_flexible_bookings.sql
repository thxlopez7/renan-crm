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
