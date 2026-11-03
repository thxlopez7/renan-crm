# Auditoría — Renan CRM (Black Club Elite)

Fecha: 2026-11-02 · Proyecto Supabase: `renan_crm` (`dsrascitdnjbaylgjrno`)

## Estado de las correcciones (2026-11-02)

| Hallazgo | Estado |
|---|---|
| C1–C3 RLS abierto, datos expuestos, `settle_tab` anónimo | ✅ Corregido (migración `lockdown_rls`) |
| C4 usuario autenticado = recepción | ✅ Corregido (`current_user_role()` → `anon`); falta desactivar sign-up en el panel |
| C5 contraseñas filtradas | ⏳ Activar en Supabase → Authentication |
| A1 esquema vs base | ✅ `supabase/migrations/` + `supabase_schema.sql` actualizados |
| A2 errores ignorados | ✅ Se revisan; rechazos del servidor muestran aviso y recargan |
| A3 cobro sin RPC | ✅ Solo `settle_tab` |
| A4 roles cosméticos | ✅ Recepción no ve Panel ni Tarifas & Stock; RLS solo dueño |
| A5 reservas del CRM directas | ✅ RPC `create_staff_booking` |
| M1 códigos repetidos | ✅ `gen_booking_code()` |
| Extra: cantidades del POS no se guardaban | ✅ RPC `adjust_tab_item` |
| Extra: seña por defecto 50% (config mal leída) | ✅ Se lee `pricing_config` clave/valor |
| M3, M4, M5 | Pendiente (mantenimiento) |

## Resumen

| Área | Estado |
|---|---|
| Pruebas (Vitest) | ✅ 18/18 pasan |
| Lint (oxlint) | ✅ 0 errores, 2 avisos |
| Seguridad de base de datos | 🔴 **Crítico**: cualquiera puede modificar datos sin iniciar sesión |
| Esquema en repo vs. base real | 🟠 No coinciden |
| Manejo de errores | 🟠 Errores de Supabase se ignoran en silencio |
| Roles de staff | 🟠 Solo visuales en la app |

---

## 🔴 Crítico (seguridad)

### C1. Escritura pública sin login en tablas clave
Políticas RLS activas en la base con rol `public` (incluye `anon`, es decir, cualquiera con la key publicable que viene dentro de la web):

| Tabla | Lo que puede hacer un anónimo |
|---|---|
| `tabs` (cuentas) | **UPDATE y DELETE** — marcar cuentas como pagadas, cambiar montos, borrarlas |
| `tab_items` | INSERT / UPDATE / DELETE |
| `bookings` | **UPDATE** — cancelar o cambiar cualquier reserva |
| `courts` | UPDATE — cambiar tarifas de cancha o ponerlas fuera de servicio |
| `menu_items` | INSERT / UPDATE / DELETE — cambiar precios y stock del bar |
| `players` | INSERT / UPDATE |
| `gym_applications`, `tournament_registrations` | ALL (incluye leer y borrar) |
| `pricing_config` | **RLS desactivado** — lectura y escritura total |

### C2. Datos personales expuestos
`players`, `bookings` y `tabs` tienen lectura pública: nombres y **teléfonos** de todos los clientes, y lo que consumió cada uno, se pueden descargar con la key pública. `gym_applications` / `tournament_registrations` también.

### C3. `settle_tab` ejecutable por anónimos
En la base real, `anon` tiene EXECUTE sobre `settle_tab` (el esquema del repo solo lo da a `authenticated`). Un anónimo puede liquidar cuentas. `release_expired_bookings`, `current_user_role` y las funciones de trigger también son llamables por `anon` vía `/rest/v1/rpc/...`.

### C4. Cualquier usuario autenticado es "recepción"
`current_user_role()` devuelve `'reception'` por defecto si el usuario no está en `staff_roles`. Si el registro de usuarios (sign-up) de Supabase Auth está abierto, cualquiera puede crearse una cuenta y tener permisos de staff. **Verificar en Supabase → Authentication → Sign In / Providers que "Allow new users to sign up" esté desactivado**, y cambiar el default a `'anon'`.

### C5. Protección de contraseñas filtradas desactivada
Advisor de Supabase: activar "Leaked password protection" en Auth.

## 🟠 Alto

### A1. El esquema del repo no es la base real
- `supabase_schema.sql` activa RLS en `pricing_config`; en la base está desactivado.
- `release_expired_bookings()` existe en la base pero no en el repo.
- Nombres de políticas distintos (p. ej. "Allow update bookings" vs "Staff update bookings").
- No hay migraciones versionadas (se borraron en `03df1ea`). Recomendación: `supabase db pull` para regenerar el esquema desde la base real y trabajar con migraciones.

### A2. Errores de Supabase ignorados (`src/services/clubService.js`)
`supabase-js` **no lanza excepción** cuando falla una consulta: devuelve `{ error }`. Las funciones `db*` hacen `await supabase.from(...).insert/update(...)` sin revisar `error`, dentro de `try/catch` que nunca se activa. Si la base rechaza algo (RLS, choque de reserva, red), la UI muestra éxito y el dato no se guarda.

### A3. Cobro sin la función atómica
`dbSettleTab` (línea ~306) actualiza `tabs` y `bookings` con dos `update` sueltos desde el navegador, en vez de usar la RPC `settle_tab` (que sí existe, línea ~461, y registra quién cobró). Resultado: no queda `cashed_by` / `cashed_at`, y si falla el segundo paso queda inconsistente.

### A4. Roles solo cosméticos en la app
`userRole` solo cambia una etiqueta en `ExecutiveTopBar.jsx`. Recepción ve y puede usar todo lo del propietario (tarifas, catálogo, dashboard). La única barrera real es la base de datos, que hoy está abierta (C1).

### A5. `dbCreateBookingAndTab` inserta directo
Las reservas creadas desde el CRM insertan en `bookings`/`tabs` saltándose las validaciones de `create_public_booking` (turno pasado, cancha operativa, precios oficiales). El precio lo pone el navegador.

## 🟡 Medio

- **M1.** Códigos de reserva `BC-` + 4 dígitos al azar (9000 posibles) sin restricción `UNIQUE` en `code`: con suficiente volumen habrá códigos repetidos.
- **M2.** Hora de cobro `settled_at` como texto `HH:MM` de la hora local del dispositivo, no `timestamptz`.
- **M3.** Caché en `localStorage` con datos de clientes (teléfonos) en el navegador de recepción; se mantiene tras cerrar sesión salvo el reset manual.
- **M4.** `ClubContext.jsx` (901 líneas) mezcla estado, sincronización, cola offline y lógica de negocio. Difícil de mantener y testear.
- **M5.** Lint: `setState` dentro de `useEffect` en `ClubContext.jsx:102` y `:261` (renders extra).
- **M6.** `dist/` (build) presente en la carpeta local; está ignorado por git, pero conviene no versionarlo.

## 🟢 Bajo / higiene

- README con enlaces `file:///home/thiagol/...` que no funcionan fuera de esa máquina.
- Número de WhatsApp repetido en 3 archivos (`ExecutiveTopBar.jsx` ×2, `TournamentsView.jsx`); centralizar en una constante.
- Pruebas solo unitarias de utilidades (4 archivos); nada cubre `clubService`, el flujo de reservas ni las políticas RLS.
- `package.json`: `name: "renan"`, `version: 0.0.0` (el README dice 2.0).

## Lo que está bien

- Anti doble reserva real en la base: índice único `uq_bookings_active_slot` + captura de `unique_violation`.
- `create_public_booking` valida turnos pasados con hora de Asunción, límites de equipamiento y toma precios del servidor.
- Trigger que fuerza el precio oficial de los productos en `tab_items`.
- Auditoría automática por trigger en reservas, cuentas y caja.
- Funciones `SECURITY DEFINER` con `search_path` fijado.
- `.env` correctamente ignorado por git.

## Plan de corrección sugerido (orden)

1. **Cerrar la base (C1–C4):** migración que reemplace las políticas `public`/`true` por: lectura pública solo de catálogos (courts, coaches, menu_items, gym_plans, tournaments, pricing_config); `players`/`bookings`/`tabs`/`tab_items` solo `authenticated` con rol en `staff_roles`; INSERT público solo en `gym_applications` y `tournament_registrations`; `REVOKE EXECUTE` de `anon` en `settle_tab`, `release_expired_bookings` y funciones de trigger; `current_user_role()` por defecto `'anon'`. Ojo: la grilla pública de turnos necesita saber qué horarios están ocupados → exponer una vista o RPC que devuelva solo `court_id, date, time_slot` sin datos personales.
2. Revisar sign-up de Auth y activar protección de contraseñas filtradas.
3. Revisar `error` en todas las llamadas de `clubService.js` y mostrar fallos en la UI.
4. Usar la RPC `settle_tab` para cobrar; crear RPC para reservas desde el CRM.
5. Sincronizar `supabase_schema.sql` con la base real y pasar a migraciones.
6. Aplicar roles en la UI (ocultar tarifas/catálogo/dashboard a recepción).
