-- ==============================================================================
-- MIGRACIÓN 007: INVENTARIO DE CONSUMIBLES, CONTROL DE STOCK, TARIFAS Y RESERVA SIN SEÑA
-- Archivo: supabase/migrations/20261022000007_consumables_inventory_and_courts.sql
-- Ejecutar en: Supabase SQL Editor
-- ==============================================================================

-- 1. Agregar columna 'stock' a menu_items si no existe
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 50;

-- 2. Asegurar políticas RLS para menu_items (lectura, inserción, edición, eliminación)
DROP POLICY IF EXISTS "Allow insert menu_items" ON public.menu_items;
CREATE POLICY "Allow insert menu_items" ON public.menu_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update menu_items" ON public.menu_items;
CREATE POLICY "Allow update menu_items" ON public.menu_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete menu_items" ON public.menu_items;
CREATE POLICY "Allow delete menu_items" ON public.menu_items FOR DELETE USING (true);

-- 3. Asegurar políticas RLS para courts (actualización de tarifas desde el CRM)
DROP POLICY IF EXISTS "Allow update courts" ON public.courts;
CREATE POLICY "Allow update courts" ON public.courts FOR UPDATE USING (true);

-- 4. Actualizar la función RPC create_public_booking:
--    - Elimina la seña previa (deposit_paid = 0).
--    - Establece el estado oficial como 'Solicitud Pendiente' para bloqueo por el operador.
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
    -- 1. Validaciones básicas de entrada
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

    -- 2. Validación de Horario y Fecha Pasada (Hora oficial Paraguay: America/Asuncion)
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

    -- 3. Verificar que la cancha exista y esté operativa
    SELECT * INTO v_court 
    FROM courts 
    WHERE id = p_court_id AND status = 'operational';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'COURT_NOT_AVAILABLE: La cancha seleccionada no está disponible u operativa.';
    END IF;

    -- 4. Tarifas de equipamiento opcional
    SELECT value INTO v_racket_fee FROM pricing_config WHERE key = 'racket_rental_fee';
    IF v_racket_fee IS NULL THEN v_racket_fee := 30000; END IF;

    SELECT value INTO v_ball_fee FROM pricing_config WHERE key = 'ball_tube_fee';
    IF v_ball_fee IS NULL THEN v_ball_fee := 70000; END IF;

    SELECT value INTO v_hold_minutes FROM pricing_config WHERE key = 'booking_hold_minutes';
    IF v_hold_minutes IS NULL THEN v_hold_minutes := 60; END IF;

    -- 5. Montos calculados (Seña = 0)
    v_court_amount := v_court.rate;
    v_equipment_total := (p_rented_rackets * v_racket_fee::integer) + (p_ball_tubes * v_ball_fee::integer);

    v_booking_id := 'book-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_booking_code := 'BC-' || (1000 + floor(random() * 9000))::text;
    v_tab_id := 'tab-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text;
    v_expires_at := NOW() + (v_hold_minutes || ' minutes')::interval;
    v_created_time_str := to_char(v_now_asuncion, 'HH24:MI');

    -- 6. Inserción atómica en bookings y tabs
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
            'Solicitud Pendiente',
            v_court_amount,
            0,
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
            0,
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
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE EXCEPTION 'SLOT_ALREADY_BOOKED: El turno seleccionado acaba de ser tomado.';
    END;

    -- 7. Registrar jugador en el directorio CRM si no existía
    INSERT INTO players (id, name, phone, category, is_fixed_pass_holder, total_bookings, total_spent, status, last_visit)
    VALUES (
        'plr-' || extract(epoch from now())::bigint || '-' || floor(random() * 1000)::text,
        trim(p_client_name),
        trim(p_client_phone),
        '4ta Categoría',
        FALSE,
        1,
        v_court_amount,
        'Cliente Activo Web',
        'Hoy, ' || split_part(p_time_slot, ' - ', 1)
    )
    ON CONFLICT (phone) DO UPDATE SET
        total_bookings = players.total_bookings + 1,
        total_spent = players.total_spent + EXCLUDED.total_spent,
        last_visit = EXCLUDED.last_visit,
        updated_at = NOW();

    -- 8. Retornar el objeto de la reserva
    v_result := jsonb_build_object(
        'id', v_booking_id,
        'code', v_booking_code,
        'courtId', p_court_id,
        'date', p_date,
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
        'createdAt', v_created_time_str
    );

    RETURN v_result;
END;
$$;

-- 5. Asegurar replicación en tiempo real de menu_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'menu_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
  END IF;
END $$;
