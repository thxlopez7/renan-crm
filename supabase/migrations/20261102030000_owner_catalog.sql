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
