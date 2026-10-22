-- ==============================================================================
-- MIGRACIÓN 005: FINANZAS Y LIQUIDACIÓN POS EN SERVIDOR (RPC settle_tab)
-- Archivo: supabase/migrations/20261022000005_rpc_settle_tab.sql
-- Propósito: 
-- 1. Añadir columnas cashed_by y cashed_at a tabs.
-- 2. Trigger de integridad que toma los precios de tab_items directo de menu_items.
-- 3. Crear función RPC settle_tab() con cálculo atómico de balances en servidor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ALTER TABLE: Añadir cashed_by y cashed_at a tabs
-- ------------------------------------------------------------------------------
ALTER TABLE tabs 
ADD COLUMN IF NOT EXISTS cashed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cashed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN tabs.cashed_by IS 'ID del usuario staff que procesó la liquidación del cobro.';
COMMENT ON COLUMN tabs.cashed_at IS 'Marca temporal exacta en que se cerró y cobró la cuenta.';

-- ------------------------------------------------------------------------------
-- 2. TRIGGER: Integridad de precios en consumos (tab_items)
-- Garantiza que el precio unitario siempre se copie de la tabla menu_items oficial,
-- impidiendo que el cliente inyecte precios arbitrarios.
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. FUNCIÓN RPC: settle_tab
-- Liquida una comanda de forma atómica calculando montos en el servidor.
-- ------------------------------------------------------------------------------
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
    -- 1. Validar método de pago permitido
    IF p_payment_method NOT IN ('Tarjeta', 'Efectivo', 'Transferencia / QR', 'Transferencia Itaú') THEN
        RAISE EXCEPTION 'INVALID_PAYMENT_METHOD: Método de cobro no permitido: %', p_payment_method;
    END IF;

    -- 2. Buscar la cuenta y verificar estado
    SELECT * INTO v_tab 
    FROM tabs 
    WHERE id = p_tab_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TAB_NOT_FOUND: La cuenta POS % no existe.', p_tab_id;
    END IF;

    IF v_tab.status = 'settled' THEN
        RAISE EXCEPTION 'TAB_ALREADY_SETTLED: La cuenta ya fue liquidada el %.', v_tab.settled_at;
    END IF;

    IF v_tab.status = 'cancelled' THEN
        RAISE EXCEPTION 'TAB_CANCELLED: No se puede liquidar una cuenta cancelada.';
    END IF;

    -- 3. Calcular montos oficiales en servidor
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

    -- 4. Tiempos y usuario
    v_now_asuncion := (NOW() AT TIME ZONE 'America/Asuncion')::timestamp;
    v_settled_time_str := to_char(v_now_asuncion, 'HH24:MI');
    v_user_id := auth.uid();

    -- 5. Actualizar la cuenta POS
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

    -- 6. Actualizar la reserva vinculada a 'Finalizada'
    IF v_tab.linked_booking_id IS NOT NULL THEN
        UPDATE bookings
        SET 
            status = 'Finalizada',
            updated_at = NOW()
        WHERE id = v_tab.linked_booking_id;
    END IF;

    -- Retornar balance liquidado
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

COMMENT ON FUNCTION settle_tab IS 
'Liquida una comanda en el POS calculando consumos reales, imputando seña y vinculando al cajero responsable.';

GRANT EXECUTE ON FUNCTION settle_tab TO authenticated;

-- ------------------------------------------------------------------------------
-- ROLLBACK (En caso de ser necesario revertir):
-- DROP FUNCTION IF EXISTS settle_tab;
-- DROP TRIGGER IF EXISTS trg_tab_items_official_price ON tab_items;
-- DROP FUNCTION IF EXISTS trg_sync_tab_item_price;
-- ALTER TABLE tabs DROP COLUMN IF EXISTS cashed_by;
-- ALTER TABLE tabs DROP COLUMN IF EXISTS cashed_at;
-- ------------------------------------------------------------------------------
