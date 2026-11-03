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
