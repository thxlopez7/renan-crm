# Migraciones SQL de Endurecimiento e Integridad - Black Club Elite

Este directorio contiene las migraciones SQL incrementales, idempotentes y probadas para robustecer la base de datos de producción de **Black Club Elite** en Supabase.

---

## 📋 Orden de Ejecución

Deben ejecutarse en orden numérico estricto en el **SQL Editor** de Supabase (o mediante `supabase db push` / `supabase migration up`):

| Archivo | Propósito | Características Clave |
| :--- | :--- | :--- |
| `20261022000001_anti_double_booking.sql` | **Índice anti-doble reserva** | Índice parcial único `(court_id, date, time_slot)` ignorando `Cancelada`. Bloquea race conditions de reservas concurrentes. |
| `20261022000002_pricing_and_expiration.sql` | **Precios centralizados & Expiración** | Tabla `pricing_config` (precios cancha de día/noche, seña, expiración), columna `expires_at` y función `release_expired_bookings()` con soporte `pg_cron`. |
| `20261022000003_rpc_create_public_booking.sql` | **RPC Transaccional de Reserva Pública** | Función `create_public_booking(...)` con `SECURITY DEFINER`. Valida timezone Asunción, tarifas del servidor, rate limiting por teléfono y captura de colisiones. Cierra INSERT anónimo directo en `bookings`. |
| `20261022000004_data_types_and_checks.sql` | **Tipos estrictos & Restricciones CHECK** | Convierte `date` a tipo `DATE`, regex estricto de formato en `time_slot` (`HH:00 - HH:00`), constraints `>= 0` en importes de `bookings`, `tabs`, `tab_items` y `menu_items`. |
| `20261022000005_rpc_settle_tab.sql` | **RPC de Liquidación y Sincronización de Precios** | Trigger `trg_sync_tab_item_price` (precios tomados de `menu_items`), función transaccional `settle_tab(p_tab_id, p_payment_method)` que concilia saldo neto y cierra la reserva vinculada. |
| `20261022000006_audit_log_and_roles.sql` | **Auditoría, Cajas Diarias & Roles Staff** | Tabla `daily_cash_registers`, tabla `audit_log` con triggers en 4 tablas, tabla `staff_roles` (`owner`, `reception`), y políticas RLS que impiden a recepción borrar reservas o editar cajas cerradas. |

---

## 🔒 Idempotencia y Seguridad

- Cada migración utiliza `IF NOT EXISTS`, `CREATE OR REPLACE`, o comprobaciones dinámicas `DO $$ ... $$`.
- **Compatibilidad Hacia Atrás:** No rompe la estructura actual consumida por la aplicación web. El campo `time_slot` se conserva como texto estructurado `'HH:00 - HH:00'`.
- **Sin Pérdida de Datos:** En la migración 006, todos los usuarios existentes en `auth.users` son asignados por defecto con el rol `'owner'`, asegurando que el staff actual no pierda permisos operativos.
- Cada archivo contiene al pie su bloque de **Verification Query** y sus instrucciones de **Rollback**.

---

## 🧪 Verificación Rápida Post-Migración

Ejecutar en el SQL Editor de Supabase tras correr todas las migraciones:

```sql
-- 1. Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('pricing_config', 'daily_cash_registers', 'audit_log', 'staff_roles');

-- 2. Verificar índice único anti-doble reserva
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'bookings' AND indexname = 'uq_bookings_active_slot';

-- 3. Verificar RPCs registradas
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname IN ('create_public_booking', 'settle_tab', 'release_expired_bookings', 'current_user_role');

-- 4. Verificar triggers activos
SELECT tgname, relname 
FROM pg_trigger
JOIN pg_class ON pg_class.oid = tgrelid
WHERE tgname IN (
    'trg_sync_tab_item_price',
    'trg_audit_bookings',
    'trg_audit_tabs',
    'trg_audit_tab_items',
    'trg_audit_daily_cash_registers'
);
```
