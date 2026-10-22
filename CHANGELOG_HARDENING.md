# 🛡️ Registro de Cambios de Endurecimiento (Hardening Changelog)
## Black Club Elite — Sistema de Gestión Deportiva & Portal Público
**Rama:** `hardening/seguridad-integridad`  
**Fecha:** 22 de Octubre de 2026  
**Estatus:** ✅ Completado y Verificado (Build limpio y 18 tests unitarios en verde)

---

## 1. Resumen Ejecutivo

Este proceso de endurecimiento (*hardening*) implementa defensas a nivel de base de datos relacional (PostgreSQL en Supabase) y resiliencia en frontend (React + Vite) para garantizar:
1. **Prevención absoluta de sobreventa y condiciones de carrera (double booking)** mediante un índice único parcial en base de datos.
2. **Centralización y blindaje de tarifas**, evitando que clientes o actores maliciosos puedan inyectar montos o señas arbitrarias desde el navegador.
3. **Liquidación atómica y cálculo oficial en servidor** para cuentas de Punto de Venta (POS) y comensales.
4. **Resiliencia de red y modo offline** para la recepción del club, encolando operaciones locales en `localStorage` con retry automático ante cortes de internet.
5. **Segregación de roles de staff** (`owner` vs `reception`) con Row Level Security (RLS) y pistas de auditoría inmutables (`audit_log`).
6. **Accesibilidad WCAG y compatibilidad móvil estricta** sin auto-zoom ni rotura de interfaces táctiles.

---

## 2. Detalle de Modificaciones Realizadas

### 2.1. Base de Datos (Migraciones en `supabase/migrations/`)
- `20261022000001_anti_double_booking.sql`:
  - Índice parcial único `uq_bookings_active_slot` sobre `(court_id, date, time_slot)` donde `status <> 'Cancelada'`.
  - Bloquea físicamente cualquier colisión concurrente de reservas en el mismo turno.
- `20261022000002_pricing_and_expiration.sql`:
  - Tabla `pricing_config` para tarifas por franja horaria, alquiler de paletas (30.000 Gs.), pelotas (70.000 Gs.), seña mínima (50%) y tiempo de gracia (30 min).
  - Columna `expires_at` en `bookings` y función `release_expired_bookings()` para auto-cancelar turnos no señados, protegiendo turnos del staff y abonos fijos.
- `20261022000003_rpc_create_public_booking.sql`:
  - Función transaccional `create_public_booking` (`SECURITY DEFINER`). Valida reloj oficial de Asunción, tarifas del club, límite de 3 pendientes por teléfono y captura colisiones devolviendo `SLOT_ALREADY_BOOKED`.
  - Deshabilita inserción pública directa en `bookings` y `tabs`.
- `20261022000004_data_types_and_checks.sql`:
  - Conversión segura de columna `date` a tipo `DATE`.
  - Regex estricto `CHECK` en `time_slot` (`^([01][0-9]|2[0-3]):00 - ([01][0-9]|2[0-3]|00):00$`).
  - Restricciones `CHECK >= 0` en importes financieros de reservas, cuentas y menú.
- `20261022000005_rpc_settle_tab.sql`:
  - Trigger `trg_sync_tab_item_price` que fuerza precios unitarios oficiales desde `menu_items`.
  - Función transaccional `settle_tab(p_tab_id, p_payment_method)` que concilia saldo neto y actualiza la reserva vinculada a `Finalizada`.
- `20261022000006_audit_log_and_roles.sql`:
  - Tabla `daily_cash_registers` para turnos de caja física.
  - Tabla `audit_log` con triggers automáticos en `bookings`, `tabs`, `tab_items` y `daily_cash_registers`.
  - Tabla `staff_roles` (`owner`, `reception`) con políticas RLS que impiden a recepción borrar turnos pasados o editar cajas cerradas. Asigna `owner` por defecto al staff existente.

### 2.2. Frontend (`src/`)
- `src/services/clubService.js`:
  - Agregadas funciones `fetchPricingConfig`, `fetchStaffRole`, `rpcCreatePublicBooking` y `rpcSettleTab`.
- `src/context/ClubContext.jsx`:
  - `createBooking`: llama al RPC `create_public_booking` para clientes públicos; maneja errores amigables (`SLOT_ALREADY_BOOKED`, `MAX_PENDING_REACHED`, `SLOT_PAST`); mantiene flujo interno para staff.
  - `settleTab`: invoca `rpcSettleTab` con cálculo atómico del servidor.
  - Debounce de 400ms sobre el canal WebSockets de `postgres_changes`.
  - Cola offline (`black_club_pending_queue`) con listeners `online`/`offline` y worker secuencial de reintento.
  - Exposición de `userRole`, `syncStatus`, `pendingCount` y `retrySync`.
- `src/components/ExecutiveTopBar.jsx`:
  - Indicador dinámico de sincronización (En línea / X pend. / Offline).
  - Badge de rol de staff (Propietario / Recepción).
- `src/components/executive/CatalogManagementView.jsx`:
  - Edición de tarifas de canchas y precios de menú restringida exclusivamente al rol `owner`.
- `index.html`:
  - Actualizado `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` eliminando restricciones anti-zoom rígidas según directrices WCAG.
- Modales y Drawers:
  - Agregados atributos accesibles `role="dialog"`, `aria-modal="true"` y `aria-label` en `ConciergeDrawer`, `StaffLoginModal`, `BlackTeamView`, `TournamentsView`, `BlackGymView`, `ExecutiveTopBar` y `MasterScheduleView`.

### 2.3. Pruebas Automatizadas (`tests/unit/`)
- Configurado Vitest con script `npm test`.
- Creados 4 suites con 18 pruebas unitarias:
  - `isSlotPast.test.js`: validación de fechas pasadas, hora actual, medianoche (23:00 - 00:00) y días futuros.
  - `calculateTabBalances.test.js`: balances con cancha, paletas, pelotas, bar, deducción de seña y protección contra montos negativos.
  - `formatGs.test.js`: separadores de miles guaraní, sin decimales y manejo seguro de valores nulos o inválidos.
  - `offlineQueue.test.js`: encolado, deduplicación en storage, vaciado secuencial y retención de fallos.

---

## 3. Garantía de No Regresión (Qué se Mantuvo Intacto)

- **Diseño Visual Obsidian Luxury:** No se alteró ningún color, gradiente, tipografía, estilo ni disposición visual de componentes.
- **Contrato de la API `useClub()`:** Todas las funciones (`createBooking`, `settleTab`, `updateBookingStatus`, `addItemToTab`, `updateTabEquipment`, `bookCoachClass`, etc.) preservan exactamente los mismos parámetros y retornos.
- **Nombres de Componentes y Rutas:** No se renombraron componentes ni rutas públicas o privadas.
- **Experiencia de Usuario en Recepción y Móvil:** Los flujos de reserva rápida en 3 segundos, filtros de canchas y navegación táctil swipe-to-dismiss operan idénticamente a la versión previa.

---

## 4. Pasos Manuales Post-Merge Requeridos en Supabase

Tras mergear esta rama en producción, el administrador debe ejecutar los siguientes pasos en la consola de **Supabase**:

1. **Ejecutar las Migraciones en Orden:**
   - Abrir el **SQL Editor** del proyecto de Supabase.
   - Ejecutar consecutivamente los archivos de `supabase/migrations/` en orden del 001 al 006:
     1. `20261022000001_anti_double_booking.sql`
     2. `20261022000002_pricing_and_expiration.sql`
     3. `20261022000003_rpc_create_public_booking.sql`
     4. `20261022000004_data_types_and_checks.sql`
     5. `20261022000005_rpc_settle_tab.sql`
     6. `20261022000006_audit_log_and_roles.sql`
2. **Verificar Asignación de Roles:**
   - Confirmar en la tabla `staff_roles` que los usuarios actuales de staff tengan el rol deseado (`owner` o `reception`):
     ```sql
     SELECT * FROM public.staff_roles;
     ```
3. *(Opcional)* **Habilitar pg_cron para Expiración Automática de Señas:**
   - Si la extensión `pg_cron` está habilitada en su plan de Supabase, descomentar y ejecutar el bloque de cron de la migración 002:
     ```sql
     SELECT cron.schedule('release-expired-bookings-job', '*/5 * * * *', 'SELECT release_expired_bookings()');
     ```

---

## 5. Riesgos Residuales y Recomendaciones Futuras

1. **Webhook de Pasarela de Pagos (Bancard / QR Dinámico):**
   - Actualmente, la confirmación de la seña bancaria es manual por parte del recepcionista tras verificar la transferencia. Se recomienda en una fase futura integrar una pasarela de pago paraguaya con webhooks que invoque automáticamente un RPC `confirm_deposit(booking_id)`.
2. **Notificaciones Push / WhatsApp API Oficial:**
   - Se recomienda conectar Supabase Edge Functions con WhatsApp Business API para notificar al jugador automáticamente 15 minutos antes de la expiración de la reserva.
3. **Respaldos y Retención de Auditoría:**
   - Configurar una política de archivado periódico para registros de `audit_log` con más de 12 meses de antigüedad para optimizar el almacenamiento de la base de datos.
