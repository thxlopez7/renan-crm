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

DO $$
DECLARE
    v_def TEXT := pg_get_functiondef('create_public_booking(text,date,text,text,text,boolean,integer,integer)'::regprocedure);
BEGIN
    IF position('gen_booking_code()' IN v_def) = 0 THEN
        v_def := regexp_replace(v_def, 'v_booking_code := [^;]*;', 'v_booking_code := gen_booking_code();');
        IF position('gen_booking_code()' IN v_def) = 0 THEN
            RAISE EXCEPTION 'No se pudo actualizar la generación de código en create_public_booking';
        END IF;
        EXECUTE v_def;
    END IF;
END;
$$;

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
