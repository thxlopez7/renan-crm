-- ==============================================================================
-- MIGRACIÓN 004: CONVERSIÓN SEGURA DE TIPOS Y RESTRICCIONES DE INTEGRIDAD (CHECK)
-- Archivo: supabase/migrations/20261022000004_data_types_and_checks.sql
-- Propósito: 
-- 1. Garantizar que la columna 'date' sea estrictamente tipo DATE.
-- 2. Asegurar el formato exacto de 'time_slot' ('HH:00 - HH:00') mediante CHECK constraint,
--    preservando el tipo TEXT para garantizar compatibilidad 100% con el frontend React.
-- 3. Añadir restricciones de dominio para montos financieros no negativos.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PASO PREVIO DE VERIFICACIÓN (Ejecutar manualmente antes de aplicar)
-- Detecta si existen fechas o time_slots con formato inválido en bookings.
-- ------------------------------------------------------------------------------
/*
-- 1. Verificar registros con fechas que no correspondan a YYYY-MM-DD
SELECT id, date, time_slot 
FROM bookings 
WHERE (date::text) !~ '^\d{4}-\d{2}-\d{2}$';

-- 2. Verificar time_slots que no coincidan con el formato estándar de 1 hora
SELECT id, time_slot 
FROM bookings 
WHERE time_slot !~ '^([01][0-9]|2[0-3]):00 - ([01][0-9]|2[0-3]|00):00$';

-- 3. Verificar montos negativos anómalos
SELECT id, court_amount, deposit_paid 
FROM bookings 
WHERE court_amount < 0 OR deposit_paid < 0;
*/

-- ------------------------------------------------------------------------------
-- 1. CONVERSIÓN SEGURA DE COLUMNA 'date' A TIPO DATE (Si estuviera como TEXT)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- Comprobar si la columna date es de tipo text o varchar
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
          AND column_name = 'date' 
          AND data_type IN ('text', 'character varying')
    ) THEN
        ALTER TABLE bookings 
        ALTER COLUMN date TYPE DATE USING (date::date);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. RESTRICCIÓN CHECK: Formato estricto de time_slot ('HH:00 - HH:00')
-- Decisión de arquitectura: Se preserva el tipo TEXT con CHECK constraint en lugar
-- de convertir a TIME simple, dado que el sistema opera en bloques de rango horario
-- de 1 hora exacta (ej. '18:00 - 19:00') consumidos directamente por la grilla.
-- ------------------------------------------------------------------------------
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_time_slot_format;
ALTER TABLE bookings 
ADD CONSTRAINT chk_bookings_time_slot_format 
CHECK (time_slot ~ '^([01][0-9]|2[0-3]):00 - ([01][0-9]|2[0-3]|00):00$');

-- ------------------------------------------------------------------------------
-- 3. RESTRICCIONES CHECK DE INTEGRIDAD FINANCIERA (Anti montos negativos)
-- ------------------------------------------------------------------------------
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_court_amount_positive;
ALTER TABLE bookings 
ADD CONSTRAINT chk_bookings_court_amount_positive 
CHECK (court_amount >= 0);

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_deposit_paid_positive;
ALTER TABLE bookings 
ADD CONSTRAINT chk_bookings_deposit_paid_positive 
CHECK (deposit_paid >= 0);

ALTER TABLE tabs DROP CONSTRAINT IF EXISTS chk_tabs_court_amount_positive;
ALTER TABLE tabs 
ADD CONSTRAINT chk_tabs_court_amount_positive 
CHECK (court_amount >= 0);

ALTER TABLE tabs DROP CONSTRAINT IF EXISTS chk_tabs_deposit_paid_positive;
ALTER TABLE tabs 
ADD CONSTRAINT chk_tabs_deposit_paid_positive 
CHECK (deposit_paid >= 0);

ALTER TABLE tabs DROP CONSTRAINT IF EXISTS chk_tabs_equipment_counts_positive;
ALTER TABLE tabs 
ADD CONSTRAINT chk_tabs_equipment_counts_positive 
CHECK (racket_count >= 0 AND ball_tube_count >= 0);

ALTER TABLE tab_items DROP CONSTRAINT IF EXISTS chk_tab_items_qty_positive;
ALTER TABLE tab_items 
ADD CONSTRAINT chk_tab_items_qty_positive 
CHECK (qty > 0 AND price >= 0);

-- ------------------------------------------------------------------------------
-- ROLLBACK (En caso de ser necesario revertir):
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_time_slot_format;
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_court_amount_positive;
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_bookings_deposit_paid_positive;
-- ALTER TABLE tabs DROP CONSTRAINT IF EXISTS chk_tabs_court_amount_positive;
-- ALTER TABLE tabs DROP CONSTRAINT IF EXISTS chk_tabs_deposit_paid_positive;
-- ALTER TABLE tabs DROP CONSTRAINT IF EXISTS chk_tabs_equipment_counts_positive;
-- ALTER TABLE tab_items DROP CONSTRAINT IF EXISTS chk_tab_items_qty_positive;
-- ------------------------------------------------------------------------------
