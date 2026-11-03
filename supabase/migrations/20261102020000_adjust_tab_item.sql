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
