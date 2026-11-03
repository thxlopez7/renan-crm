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

-- 8. settle_tab es SECURITY DEFINER (saltea RLS): exigir staff dentro de la función
DO $$
DECLARE
    v_def TEXT := pg_get_functiondef('settle_tab(text, text)'::regprocedure);
    v_guard TEXT := E'\nBEGIN\n    IF NOT is_staff() THEN\n        RAISE EXCEPTION ''NOT_STAFF: Solo el staff puede liquidar cuentas.'';\n    END IF;\n';
BEGIN
    IF position('NOT_STAFF' IN v_def) = 0 THEN
        v_def := regexp_replace(v_def, E'\\nBEGIN\\n', v_guard);
        IF position('NOT_STAFF' IN v_def) = 0 THEN
            RAISE EXCEPTION 'No se pudo insertar el control de staff en settle_tab';
        END IF;
        EXECUTE v_def;
    END IF;
END;
$$;

-- 9. Permisos de ejecución de funciones
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
