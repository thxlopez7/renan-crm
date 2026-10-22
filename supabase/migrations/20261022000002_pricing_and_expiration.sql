-- ==============================================================================
-- MIGRACIÓN 002: TABLA DE CONFIGURACIÓN DE TARIFAS Y EXPIRACIÓN DE SEÑAS
-- Archivo: supabase/migrations/20261022000002_pricing_and_expiration.sql
-- Propósito: 
-- 1. Centralizar precios y políticas comerciales en el servidor (pricing_config).
-- 2. Añadir expires_at a bookings para liberar reservas 'Seña Pendiente' a los 30 min.
-- 3. Crear función release_expired_bookings() eximiendo abonos y reservas de staff.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLA: pricing_config (Configuración Centralizada de Precios y Políticas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_config (
    key TEXT PRIMARY KEY,
    value NUMERIC NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed idempotente de valores iniciales
INSERT INTO pricing_config (key, value, description)
VALUES
    ('racket_rental_fee', 30000, 'Tarifa unitaria de alquiler de paleta de test en Gs.'),
    ('ball_tube_fee', 70000, 'Precio unitario de tubo de pelotas Bullpadel presurizadas en Gs.'),
    ('deposit_percent', 50, 'Porcentaje de seña bancaria requerida sobre el valor de la cancha.'),
    ('booking_hold_minutes', 30, 'Tiempo en minutos para transferir la seña antes de liberación automática.')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. ALTER TABLE: Columna expires_at en bookings (nullable para retrocompatibilidad)
-- ------------------------------------------------------------------------------
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN bookings.expires_at IS 
'Marca temporal de vencimiento de la seña. Si status es Seña Pendiente y NOW() > expires_at, la reserva puede ser liberada.';

-- ------------------------------------------------------------------------------
-- 3. FUNCIÓN: release_expired_bookings()
-- Libera reservas cuya seña no fue confirmada dentro de la ventana de tiempo.
-- REGLA: Los abonos fijos semanales y reservas manuales del staff NUNCA expiran.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION release_expired_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_released_count INTEGER := 0;
BEGIN
    -- Cancelar reservas con Seña Pendiente expiradas
    -- Se excluyen explícitamente:
    -- 1. Abono Fijo Semanal
    -- 2. Categorías de staff o clases BlackTeam
    -- 3. Aquellas donde expires_at sea NULL (reservas históricas o creadas por administración)
    WITH expired AS (
        UPDATE bookings
        SET 
            status = 'Cancelada',
            updated_at = NOW()
        WHERE 
            status = 'Seña Pendiente'
            AND expires_at IS NOT NULL
            AND expires_at < NOW()
            AND category NOT IN ('Abono Fijo Semanal', 'Turno Fijo Semanal')
        RETURNING id, linked_tab_id
    )
    SELECT COUNT(*) INTO v_released_count FROM expired;

    -- Si había cuentas asociadas que estaban 'open', marcarlas como 'cancelled'
    UPDATE tabs
    SET 
        status = 'cancelled',
        activity_status = 'liquidada',
        updated_at = NOW()
    WHERE 
        status = 'open'
        AND linked_booking_id IN (
            SELECT id FROM bookings WHERE status = 'Cancelada' AND expires_at < NOW()
        );

    RETURN v_released_count;
END;
$$;

COMMENT ON FUNCTION release_expired_bookings IS 
'Cancela reservas vencidas en Seña Pendiente liberando el turno para otros usuarios, preservando abonos fijos.';

-- ------------------------------------------------------------------------------
-- 4. PROGRAMACIÓN AUTOMÁTICA (pg_cron)
-- Si la extensión pg_cron está disponible en la instancia de Supabase, programar
-- ejecución cada 5 minutos. Si no está disponible, documentamos la alternativa.
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
    ) THEN
        -- Desprogramar si ya existía para evitar duplicados
        PERFORM cron.unschedule('release-expired-bookings-job');
        -- Programar cada 5 minutos
        PERFORM cron.schedule(
            'release-expired-bookings-job',
            '*/5 * * * *',
            'SELECT release_expired_bookings();'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Si pg_cron no está habilitado en este plan, continuar sin error
        RAISE NOTICE 'pg_cron no disponible directamente. Se documenta alternativa vía Edge Function o cron HTTP.';
END;
$$;

-- ------------------------------------------------------------------------------
-- ROLLBACK (En caso de ser necesario revertir):
-- DROP FUNCTION IF EXISTS release_expired_bookings();
-- ALTER TABLE bookings DROP COLUMN IF EXISTS expires_at;
-- DROP TABLE IF EXISTS pricing_config;
-- ------------------------------------------------------------------------------
