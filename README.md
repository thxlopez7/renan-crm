# Black Club · Web de reservas y panel de gestión

Aplicación web para **Black Club** (pádel, gimnasio BlackGym, clases BlackTeam y bar) en San Juan Bautista, Misiones, Paraguay.

Tiene dos partes que comparten la misma base de datos:

| Parte | Quién la usa | Qué hace |
|---|---|---|
| **Web pública** | Jugadores y clientes | Reservar cancha en pocos toques, consultar o cancelar su reserva, ver planes del gimnasio, pedir clases, ver el Circuito y la carta del bar. |
| **Panel del club** | Dueño y recepción | Agenda de canchas, confirmación de solicitudes, turnos fijos, caja con cobros mixtos y cierre de caja, clientes, panel de números y ajustes. |

Este documento es la referencia técnica. El manual para el club está en [`MANUAL_DE_USO_CLIENTE.md`](MANUAL_DE_USO_CLIENTE.md).

---

## Índice

1. [Tecnología](#1-tecnología)
2. [Puesta en marcha local](#2-puesta-en-marcha-local)
3. [Estructura del proyecto](#3-estructura-del-proyecto)
4. [Cómo fluyen los datos](#4-cómo-fluyen-los-datos)
5. [Base de datos (Supabase)](#5-base-de-datos-supabase)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Seguridad](#7-seguridad)
8. [Diseño y estilos](#8-diseño-y-estilos)
9. [Pruebas y calidad](#9-pruebas-y-calidad)
10. [Despliegue](#10-despliegue)
11. [Tareas habituales](#11-tareas-habituales)
12. [Pendientes conocidos](#12-pendientes-conocidos)

---

## 1. Tecnología

| Capa | Herramienta |
|---|---|
| Interfaz | React 19 + Vite 8, CSS propio (sin frameworks de estilos) |
| Íconos | lucide-react |
| Tipografía | Archivo (Google Fonts), ancho variable: títulos condensados, texto normal |
| Base de datos y usuarios | Supabase (PostgreSQL 17, Auth, Realtime, `pg_cron`) |
| Publicación | Vercel (sitio estático + redirección SPA) |
| Pruebas | Vitest |
| Revisión de código | oxlint |

No hay servidor propio: toda la lógica sensible (precios, solapamientos, cobros, permisos) vive en **funciones de PostgreSQL** y **políticas RLS** dentro de Supabase. El navegador solo llama a esas funciones.

---

## 2. Puesta en marcha local

Requisitos: Node 20 o superior.

```bash
npm install
cp .env.example .env      # completar con los datos del proyecto Supabase
npm run dev               # http://localhost:5173
```

Variables de entorno (`.env`, nunca se sube al repositorio):

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Clave **publicable** (`sb_publishable_…`). Nunca la `service_role`. |

### Modo demo (sin base de datos)

Sirve para mostrar o probar el panel sin tocar datos reales. Solo funciona con `npm run dev`, nunca en producción.

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co npm run dev
```

Abrir `http://localhost:5173/?demo` (dueño) o `?demo=reception` (recepción). Usa los datos de ejemplo de `src/context/initialData.js`.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve `dist/` localmente |
| `npm test` | Pruebas unitarias |
| `npm run lint` | oxlint |

---

## 3. Estructura del proyecto

```
renan/
├── index.html                  Fuentes, título y descripción de la página
├── vercel.json                 Redirección de todas las rutas a index.html
├── supabase_schema.sql         Esquema completo (para crear una base desde cero)
├── supabase/migrations/        Cambios aplicados a la base, en orden
├── public/images/              Fotos (ver CREDITOS.md) y logo
├── tests/unit/                 Pruebas de utilidades y reglas
└── src/
    ├── main.jsx                Punto de entrada
    ├── App.jsx                 Alterna web pública / panel; recuerda la vista
    ├── index.css               Tokens de diseño, barra superior, tema base
    ├── config/contact.js       WhatsApp, dirección y coordenadas del club
    ├── lib/supabase.js         Cliente de Supabase
    ├── context/
    │   ├── ClubContext.jsx     Estado global, sesión, sincronización, acciones
    │   └── initialData.js      Datos de ejemplo (modo demo y primer render)
    ├── services/clubService.js Todas las llamadas a Supabase (consultas y RPC)
    ├── utils/
    │   ├── clubTime.js         Hora de Asunción, armado de horarios, solapamientos
    │   ├── phone.js            Celulares paraguayos (normalizar, mostrar, WhatsApp)
    │   ├── ruc.js              Validación de RUC (dígito verificador de la SET)
    │   ├── calendar.js         Archivo .ics para agendar la reserva
    │   ├── formatters.js       Guaraníes y fechas en español
    │   └── financeHelpers.js   Total de una cuenta de caja
    ├── styles/
    │   ├── lux.css             Web pública (portada, secciones, tarjetas, carta)
    │   ├── booking.css         Flujo de reserva y hojas inferiores (también se usan en el panel)
    │   └── admin.css           Panel: agenda, caja, clientes, panel del dueño, ajustes
    └── components/
        ├── ExecutiveTopBar.jsx         Barra superior (marca, acceso del personal)
        ├── auth/StaffLoginModal.jsx    Ingreso del personal
        ├── common/SyncErrorToast.jsx   Aviso cuando el servidor rechaza un cambio
        ├── public/
        │   ├── PublicPortal.jsx        Portada, navegación, pie
        │   ├── BookingFlow.jsx         Día → duración → hora → cancha
        │   ├── BookingSheet.jsx        Datos del cliente, extras, confirmación
        │   ├── MyBookingView.jsx       Consultar / cancelar con código + celular
        │   ├── BlackGymView.jsx        Planes y solicitud de alta
        │   ├── BlackTeamView.jsx       Profesores y pedido de clase por WhatsApp
        │   ├── TournamentsView.jsx     Circuito Black Pádel (edición finalizada)
        │   └── BlackBarMenuView.jsx    Carta del bar
        └── executive/
            ├── ExecutiveSuite.jsx      Navegación del panel (barra inferior en celular)
            ├── ScheduleView.jsx        Agenda por cancha + solicitudes por confirmar
            ├── StaffBookingSheet.jsx   Reserva, turno fijo, clase o bloqueo
            ├── BookingActionsSheet.jsx Confirmar, empezar, mover, no vino, cancelar
            ├── CashView.jsx            Cuentas por cobrar, consumos, venta de barra
            ├── PaymentSheet.jsx        Cobro con varios medios, vuelto, factura
            ├── CashRegisterBar.jsx     Apertura y cierre de caja con arqueo
            ├── ClientsView.jsx         Clientes, segmentos e historial
            ├── OwnerDashboard.jsx      Facturación, ocupación, medios de pago
            └── SettingsView.jsx        Horarios, precios, canchas, productos
```

Documentos de apoyo en la raíz: `AUDITORIA.md` (auditoría inicial y su estado) y `ANALISIS_NEGOCIO.md` (análisis de reglas de negocio y decisiones tomadas).

---

## 4. Cómo fluyen los datos

```
Navegador ── clubService.js ──► Supabase
   │                              ├─ tablas con RLS (lectura)
   │                              ├─ funciones RPC (escrituras importantes)
   │                              └─ Realtime (avisos de cambios)
   └── ClubContext.jsx: estado en memoria + copia en localStorage
```

- **Visitante sin sesión:** carga solo catálogos (canchas, profesores, planes, carta, torneos). La ocupación se pide por día con `get_public_availability`, que devuelve horarios ocupados **sin datos personales**. Se refresca cada 30 s.
- **Personal con sesión:** carga todo (reservas, cuentas, clientes) y escucha cambios en tiempo real.
- **Cambios desde el panel:** se aplican primero en pantalla y luego se envían (`persistMutation`).
  - Si falla la **red**, quedan en una cola local y se reintentan solos.
  - Si el **servidor rechaza** el cambio (permisos, horario ocupado, etc.), se muestra un aviso y se recargan los datos reales.
- **Cobros:** nunca pasan por la cola. Solo se registran si el servidor los acepta.

---

## 5. Base de datos (Supabase)

Proyecto: `renan_crm`. Los cambios se versionan en `supabase/migrations/` y además se acumulan en `supabase_schema.sql` para poder crear una base nueva de una vez.

### Tablas

| Tabla | Contenido |
|---|---|
| `courts` | Canchas: nombre, precio por hora (`rate`), estado (`operational` / `maintenance`) |
| `bookings` | Reservas: cancha, fecha, `start_time`, `duration_minutes` (60/90/120), estado, cliente, monto, vencimiento |
| `tabs` | Cuentas de caja (una por reserva o venta de barra), datos de factura, vuelto |
| `tab_items` | Consumos de cada cuenta (el precio lo fija la base) |
| `tab_payments` | Cada pago de una cuenta: medio, monto, caja, quién cobró |
| `daily_cash_registers` | Turnos de caja: fondo, totales por medio, esperado, contado, diferencia |
| `players` | Clientes (clave práctica: celular normalizado `+5959XXXXXXXX`) |
| `menu_items` | Carta del bar y tienda, con stock y disponibilidad |
| `gym_plans`, `coaches`, `tournaments` | Catálogos de la web |
| `gym_applications`, `tournament_registrations` | Formularios enviados desde la web |
| `pricing_config` | Ajustes del club en formato clave/valor (ver abajo) |
| `staff_roles` | Usuarios del personal y su rol (`owner` / `reception`) |
| `audit_log` | Registro automático de cambios en reservas, cuentas y caja |

### Ajustes del club (`pricing_config`)

| Clave | Significado | Valor actual |
|---|---|---|
| `open_hour` / `close_hour` | Horario de canchas (24 = medianoche) | 7 / 24 |
| `slot_step_minutes` | Cada cuánto puede empezar un turno | 30 |
| `booking_hold_minutes` | Minutos para confirmar una solicitud web | 60 |
| `booking_window_days` | Días de anticipación para reservar online | 14 |
| `cancel_notice_hours` | Horas mínimas para cancelar online | 3 |
| `racket_rental_fee` / `ball_tube_fee` | Alquiler de paleta / tubo de pelotas (Gs.) | 30.000 / 70.000 |
| `deposit_percent` | Seña (no se usa: el club trabaja sin seña) | 0 |

### Funciones (RPC)

| Función | Quién | Para qué |
|---|---|---|
| `request_booking` | Público | Solicitud web: valida horario, celular, solapamiento; precio = tarifa × duración |
| `get_public_availability` | Público | Horarios ocupados de un día, sin datos personales |
| `get_my_booking`, `cancel_my_booking` | Público | Consultar / cancelar con código + celular, respetando la anticipación |
| `create_staff_booking` | Personal | Reserva, turno fijo, clase o bloqueo desde el panel (idempotente) |
| `adjust_tab_item` | Personal | Sumar o restar consumos de una cuenta abierta |
| `pay_tab` | Personal | Cobro con uno o varios medios, vuelto en efectivo, factura con RUC |
| `open_walkin_tab` | Personal | Venta de barra sin reserva |
| `open_cash_register`, `close_cash_register` | Personal | Turno de caja con arqueo |
| `settle_tab` | Personal | Cobro simple (compatibilidad) |
| `release_expired_bookings` | Interno | Libera solicitudes vencidas (cada 5 min con `pg_cron`) |
| `is_staff`, `current_user_role` | Interno | Usadas por las políticas de seguridad |

Disparadores principales: `trg_bookings_schedule` (calcula inicio/fin y el texto del horario), `trg_bookings_close_tab` (cancelar o "no vino" cierra la cuenta sin cobro), precio oficial de consumos y auditoría.

Restricción clave: `bookings_no_overlap` (exclusión GiST) impide dos reservas activas que se pisen en la misma cancha.

---

## 6. Reglas de negocio

- **Turnos de 60, 90 o 120 minutos**, a elección del cliente, empezando cada 30 minutos dentro del horario del club.
- **Precio:** tarifa por hora de la cancha × duración. Sin tarifa Prime, sin seña.
- **Estados de reserva:** Pendiente → Confirmada → Jugando → Finalizada, más Cancelada y No vino.
- **Solicitudes web:** quedan *Pendiente* y se liberan solas si nadie las confirma en 60 minutos. Máximo 2 solicitudes pendientes por celular.
- **Cancelación online:** hasta 3 horas antes, con código + celular.
- **Turnos fijos:** se crean para 4, 8 o 12 semanas; las fechas ocupadas se saltean.
- **Caja:** cobros mixtos (Efectivo, Transferencia, QR, Débito, Crédito, Billetera); el vuelto solo sale del efectivo; factura opcional con RUC validado.
- **Cierre de caja:** efectivo esperado = fondo + efectivo cobrado − vueltos; se registra la diferencia con lo contado.
- **Hora oficial:** `America/Asuncion` (UTC−3 fijo desde 2024), tanto en la base como en el navegador.
- **Celulares:** se aceptan `0981 123 456`, `981123456` o `+595 981 123 456` y se guardan como `+595981123456`.

---

## 7. Seguridad

- **RLS activado en todas las tablas.** Sin sesión solo se leen catálogos; reservas, clientes y cuentas son solo para el personal (`is_staff()`).
- **Permisos por rol:** tarifas, productos y ajustes solo los cambia el dueño (`owner`). Recepción no ve el Panel del dueño ni Ajustes.
- **Iniciar sesión no da acceso por sí solo:** un usuario tiene que estar cargado en `staff_roles`.
- **Funciones internas** (disparadores, vencimientos, ajustes) sin permiso de ejecución para el público.
- **Pendiente en el panel de Supabase → Authentication:**
  - Desactivar el registro de usuarios nuevos.
  - Activar la protección contra contraseñas filtradas.

### Dar acceso a alguien del personal

1. Supabase → Authentication → *Add user* (correo y contraseña).
2. Copiar su `id` y ejecutar:
   ```sql
   insert into staff_roles (user_id, role) values ('<id>', 'reception');  -- o 'owner'
   ```

---

## 8. Diseño y estilos

- **Identidad:** la del Instagram del club. Negro con rojo `#E3232C` y estética de afiche deportivo.
- **Tipografía:** una sola familia, **Archivo**. Los títulos van condensados (`font-stretch: 62%`), en negrita y mayúsculas; el texto va con ancho normal.
- **Formas:** bordes rectos (`--radius: 4px`). Sin degradés en tarjetas, sin brillos ni efecto vidrio.
- **Mobile first:** barra de navegación inferior en celular y botones de al menos 44 px. Los campos de texto usan 16 px para que iPhone no haga zoom.
- **Fotos:** de Unsplash, con créditos en `public/images/CREDITOS.md`. Conviene reemplazarlas por fotos propias del club.
- **Variables de diseño** en `src/index.css`. El acento se llama `--gold` por historia, pero hoy es el rojo del club.

---

## 9. Pruebas y calidad

```bash
npm test        # 34 pruebas
npm run lint
npm run build
```

Las pruebas cubren:
- Hora de Asunción y armado de horarios.
- Solapamientos de reservas.
- Celulares paraguayos y RUC.
- Total de una cuenta, formato de guaraníes y cola sin conexión.
- Clasificación de errores del servidor.

Las reglas críticas también están en la base: aunque el navegador falle, no se puede reservar encima de otra reserva ni cobrar mal.

---

## 10. Despliegue

- **Vercel** compila con `npm run build` y sirve `dist/`. `vercel.json` redirige todas las rutas a `index.html`.
- **Variables en Vercel:** `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- **Uso comercial:** requiere el plan Pro de Vercel (o un hosting estático equivalente: Netlify, Cloudflare Pages).
- **Supabase:** el plan gratuito pausa el proyecto tras 7 días sin uso y no tiene backups diarios. Para producción se recomienda el plan **Pro**.
- **Dominio sugerido:** `blackclub.com.py` (NIC Paraguay) o similar, apuntado a Vercel.

### Aplicar un cambio de base de datos

1. Crear un archivo nuevo en `supabase/migrations/AAAAMMDDHHMMSS_descripcion.sql`.
2. Aplicarlo con el CLI de Supabase (`supabase db push`) o el editor SQL.
3. Agregar el mismo contenido al final de `supabase_schema.sql`.

---

## 11. Tareas habituales

| Tarea | Dónde |
|---|---|
| Cambiar WhatsApp, dirección o mapa | `src/config/contact.js` |
| Cambiar horarios, precios de cancha, extras, productos | Panel → Ajustes (no requiere código) |
| Cambiar textos de la portada | `src/components/public/PublicPortal.jsx` |
| Cambiar planes del gimnasio, profesores o torneos | Tablas `gym_plans`, `coaches`, `tournaments` |
| Cambiar colores o tipografía | `src/index.css` (variables) y `index.html` (fuente) |
| Reemplazar fotos | `public/images/` (mismos nombres de archivo) |

---

## 12. Pendientes conocidos

- **Factura electrónica (SIFEN):** la app guarda el RUC y la razón social; la factura la emite el sistema de facturación del club.
- **Avisos automáticos por WhatsApp:** requieren WhatsApp Business API, que tiene costo por mensaje.
- **Compartir el partido:** un link para que los otros jugadores vean la reserva.
- **Campeones del Circuito:** agregar resultados y fotos de la edición finalizada.
