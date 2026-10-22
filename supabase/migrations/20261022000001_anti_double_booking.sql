-- ==============================================================================
-- MIGRACIÓN 001: PREVENCIÓN DE DOBLE RESERVA CONCURRENTE
-- Archivo: supabase/migrations/20261022000001_anti_double_booking.sql
-- Propósito: Garantizar integridad física contra reservas simultáneas en la misma
--            cancha, fecha y turno, excluyendo reservas con estado 'Cancelada'.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PASO PREVIO DE VERIFICACIÓN (Ejecutar manualmente antes de aplicar el índice)
-- Si esta consulta devuelve alguna fila, deben resolverse los conflictos antes
-- de aplicar el índice único.
-- ------------------------------------------------------------------------------
/*
SELECT 
    court_id, 
    date, 
    time_slot, 
    COUNT(*) AS duplicados,
    array_agg(id) AS booking_ids,
    array_agg(status) AS statuses
FROM bookings
WHERE status <> 'Cancelada'
GROUP BY court_id, date, time_slot
HAVING COUNT(*) > 1;
*/

-- ------------------------------------------------------------------------------
-- APLICACIÓN: Índice único parcial idempotente
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_active_slot
ON bookings (court_id, date, time_slot)
WHERE status <> 'Cancelada';

COMMENT ON INDEX uq_bookings_active_slot IS 
'Impide la existencia de más de una reserva activa (no cancelada) para la misma cancha, fecha y horario.';

-- ------------------------------------------------------------------------------
-- ROLLBACK (En caso de ser necesario revertir):
-- DROP INDEX IF EXISTS uq_bookings_active_slot;
-- ------------------------------------------------------------------------------
