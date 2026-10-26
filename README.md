# 🎾 BLACK CLUB ELITE — PLATAFORMA DIGITAL INTEGRAL & CRM SUITE
> **Sistema Operativo Deportivo, Comercial y de Hospitalidad para Complejos de Pádel de Alto Rendimiento**  
> **Complejo Oficial:** `@blackclubparaguay` — Asunción, Paraguay  
> **Canal Oficial de Contacto:** WhatsApp `+595 983573396` (`+595 983 573 396`)  
> **Moneda del Sistema:** Guaraníes Paraguayos (`Gs.`)  
> **Versión:** 2.0 (Producción Final Certificada)

---

## 📑 TABLA DE CONTENIDOS

1. [Visión General del Producto](#1-visión-general-del-producto)
2. [Arquitectura del Sistema & Stack Tecnológico](#2-arquitectura-del-sistema--stack-tecnológico)
3. [Lógica de Negocio y Reglas Operativas en Profundidad](#3-lógica-de-negocio-y-reglas-operativas-en-profundidad)
   - 3.1. Infraestructura de Canchas y Horarios
   - 3.2. Validación de Horarios y Prevención de Turnos Pasados
   - 3.3. Nuevo Flujo de Reservas Ágiles (Sin Señas Previas)
   - 3.4. Integridad Física Anti-Doble Reserva (Concurrency Lock)
   - 3.5. Ciclo de Vida de los Turnos en el CRM y Tarjeta de Alerta Entrante
   - 3.6. Terminal POS, Cuentas Corrientes y Comandas de Cancha
   - 3.7. Calculadora de Pago por Jugadores (Fórmula de Prorrateo Dual)
   - 3.8. Modificación Dinámica de Tarifas (Estándar vs. Prime)
   - 3.9. Control de Inventario, Semáforo de Stock Crítico y Disponibilidad
   - 3.10. BlackGym, BlackTeam y Circuito de Torneos Oficiales
   - 3.11. Resiliencia de Red y Modo Offline Transparente
   - 3.12. Matriz de Roles Staff y Auditoría Inmutable
4. [Estructura del Repositorio](#4-estructura-del-repositorio)
5. [Guía de Configuración de la Base de Datos (Supabase)](#5-guía-de-configuración-de-la-base-de-datos-supabase)
6. [Guía de Despliegue en Producción (Vercel)](#6-guía-de-despliegue-en-producción-vercel)
7. [Desarrollo Local y Ejecución de Pruebas](#7-desarrollo-local-y-ejecución-de-pruebas)
8. [Documentación para el Cliente Final](#8-documentación-para-el-cliente-final)

---

## 1. VISIÓN GENERAL DEL PRODUCTO

**Black Club Elite** es una solución digital de extremo a extremo concebida para profesionalizar y elevar la operación de complejos deportivos de pádel y clubes de membresía premium. 

El sistema fusiona dos entornos interconectados en tiempo real:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ECOSISTEMA DIGITAL BLACK CLUB                         │
├──────────────────────────────────────┬──────────────────────────────────────┤
│      A. PORTAL PÚBLICO DIGITAL       │        B. SUITE CRM EJECUTIVA        │
│         (Para Jugadores/Socios)      │       (Para Propietarios y Staff)    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Consulta interactiva de canchas    │ • Agenda maestra de pistas en vivo   │
│ • Reserva sin fricción en 1 toque    │ • Alerta dorada de reserva entrante  │
│ • Redirección a WhatsApp oficial     │ • Bloqueo de turnos con 1 clic       │
│ • Circuito oficial y torneos         │ • Terminal POS y comandas en pista   │
│ • Carta digital del bar y lounge     │ • Calculadora de pago por jugadores  │
│ • Membresías BlackGym (Biostrength)  │ • Gestión de tarifas y stock en vivo │
│ • Coaches y academia BlackTeam       │ • Directorio de jugadores y métricas │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

La plataforma responde al paradigma de diseño **"Quiet Athletic Luxury"**: interfaces oscuras basadas en tonos obsidiana, contrastes controlados, microinteracciones sutiles, tipografías sans-serif de precisión suiza y total adaptabilidad en dispositivos móviles (iOS y Android) y terminales de escritorio.

---

## 2. ARQUITECTURA DEL SISTEMA & STACK TECNOLÓGICO

```
[ Navegador Cliente / Móvil ]
        │
        ├── PWA SPA (React 19 + Vite 8)
        │     ├── ClubContext (Estado Reactivo, Cache Local, Worker Offline)
        │     ├── Router / View Switching (Portal Público vs. Suite CRM)
        │     └── Módulos Visuales (Schedule, POS, Catalog, Directory, Drawer)
        │
        ▼ (HTTPS REST / RPC & WebSockets WSS)
[ Supabase PostgreSQL 15+ (Cloud Engine) ]
        ├── PostgreSQL Relational Core (15 tablas relacionales normalizadas)
        ├── Row Level Security (RLS) & Role-Based Access Control (RBAC)
        ├── Stored Procedures (RPCs con transacciones atómicas SECURITY DEFINER)
        ├── Triggers de Auditoría e Integridad de Precios
        └── Supabase Realtime (Replicación WebSockets de cambios en caliente)
        │
        ▲ (CI/CD Automático)
[ Vercel Edge Network ]
        └── CDN Global + Enrutamiento SPA vía vercel.json
```

### Componentes Técnicos Clave:
- **Frontend Core:** React `19.2.8` con soporte para React Compiler y Strict Mode.
- **Bundler & Build Tool:** Vite `8.3.0` (tiempo de compilación de producción en ~430ms).
- **Estilos:** Vanilla CSS moderno organizado en tokens semánticos (sin sobrecarga de frameworks externos como Tailwind, respetando máxima ligereza y control estético).
- **Iconografía:** Lucide React (trazos limpios de 1.5px y 2px).
- **Pruebas Automatizadas:** Vitest `5.0.5` con suites de pruebas unitarias sobre cálculos financieros, formateo de Guaraníes, validación de turnos pasados y encolado offline.
- **Auditoría de Código:** Oxlint `1.81.0` (análisis estático ultrarrápido).
- **Backend as a Service:** Supabase (Auth JWT, PostgreSQL, Realtime Publications).

---

## 3. LÓGICA DE NEGOCIO Y REGLAS OPERATIVAS EN PROFUNDIDAD

La plataforma implementa un conjunto riguroso de reglas de negocio diseñadas para maximizar la ocupación de pistas, evitar errores humanos en caja y acelerar la atención en recepción.

### 3.1. Infraestructura de Canchas y Horarios
El club dispone de 3 pistas reglamentarias de pádel con características técnicas diferenciadas:
1. **Cancha Central Panorámica (CANCHA 01 · WPT):** Vidrio panorámico continuo 12mm de estándar World Padel Tour, césped texturizado monofilamento negro e iluminación LED de competición de 1000 Lux.
2. **Cancha 2 Indoor Climatizada (CANCHA 02 · CLIMA):** Recinto cerrado con climatización activa a 21°C, aislamiento acústico y paneles LED de luz difusa.
3. **Cancha 3 Outdoor Techada (CANCHA 03 · OUTDOOR):** Estructura techada de aluminio aeroespacial reforzado con césped Tournament Blue.

**Franjas Horarias:**
- El sistema opera en bloques de **1 hora exacta** (ej. `18:00 - 19:00`, `19:00 - 20:00`), cubriendo de 07:00 a 23:00 / 00:00 hs los 7 días de la semana.
- El carrusel de fechas genera automáticamente los **próximos 7 días consecutivos**, actualizándose día a día sin desfasajes de zona horaria.

---

### 3.2. Validación de Horarios y Prevención de Turnos Pasados (`isSlotPast`)
Para garantizar la coherencia operativa:
- El sistema compara la fecha seleccionada contra la fecha actual (`America/Asuncion`).
- Si la fecha es pasada, toda la grilla queda deshabilitada.
- Si la fecha es **Hoy**, el sistema evalúa la hora y minuto del inicio del slot (ej. `18:00`). Si la hora actual es mayor o igual a las 18:00, el turno se clasifica como `past` y el botón queda inactivo para reservas públicas.
- Esta validación se ejecuta tanto en el frontend ([`src/utils/dateHelpers.js`](file:///home/thiagol/renan-crm/src/utils/dateHelpers.js)) como en el servidor dentro de la función RPC [`create_public_booking`](file:///home/thiagol/renan-crm/supabase_schema.sql), impidiendo que cualquier solicitud maliciosa reserve turnos caducados.

---

### 3.3. Nuevo Flujo de Reservas Ágiles (Sin Señas Previas)

#### Problema de Negocio Previo:
Exigir una seña bancaria por transferencia del 50% causaba abandono de reservas. Los jugadores debían abrir su home banking, realizar la transferencia, tomar una captura de pantalla y aguardar verificación humana, lo cual generaba cuellos de botella en horarios pico.

#### Solución Implementada:
Se eliminó la barrera de la seña previa para el cliente. El flujo ahora es de alta velocidad:

```
[1. Cliente elige Cancha y Horario en la Web]
                    │
                    ▼
[2. Se abre el Concierge Drawer]
   - Nombre y Apellido
   - Teléfono / WhatsApp
   - Opcionales: Paletas Pro (+20.000 Gs.), Tubos de Pelotas (+45.000 Gs.), Mesa en Bar (Gratis)
                    │
                    ▼
[3. Cliente presiona "Solicitar Reserva & Confirmar por WhatsApp"]
                    │
                    ├── A. Base de Datos crea la reserva con:
                    │      status: 'Solicitud Pendiente'
                    │      deposit_paid: 0 Gs.
                    │      court_amount: tarifa oficial de la cancha
                    │
                    └── B. Se abre automáticamente WhatsApp en el celular del cliente
                           con mensaje pre-redactado hacia el número oficial: +595 983573396
```

**Texto del Mensaje Oficial Pre-cargado:**
> *"Hola Black Club Elite, acabo de solicitar la reserva de la Cancha Central Panorámica para el día 26/10/2026 en el turno 19:00 - 20:00 a nombre de Juan Pérez (WhatsApp: 0981123456). Aguardo su confirmación. ¡Muchas gracias!"*

---

### 3.4. Integridad Física Anti-Doble Reserva (Concurrency Lock)

Para erradicar de raíz el riesgo de sobreventa concurrente (*double booking*), la base de datos PostgreSQL implementa un **índice único parcial**:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_bookings_active_slot
ON bookings (court_id, date, time_slot)
WHERE status <> 'Cancelada';
```

**Comportamiento:**
- Si dos clientes hacen clic exactamente al mismo milisegundo en la misma cancha y horario, la base de datos procesa la primera transacción y rechaza físicamente la segunda con una violación de unicidad (`unique_violation`).
- La función RPC `create_public_booking` intercepta este error y responde amigablemente con el código `SLOT_ALREADY_BOOKED`:  
  *"El turno solicitado ya fue reservado por otro jugador. Por favor elija otro horario."*

---

### 3.5. Ciclo de Vida de los Turnos en el CRM y Tarjeta de Alerta Entrante

En la Suite CRM de recepción, la pantalla **"Agenda de Canchas"** es reactiva y se actualiza en tiempo real:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔔 ¡ALGUIEN QUIERE RESERVAR UNA CANCHA!            1 solicitud pendiente    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🎾 Cancha Central Panorámica  │  📅 Hoy · 19:00 - 20:00  │  👤 Juan Pérez   │
│ 📱 WhatsApp: 0981123456       │  🏷️ Tarifa: 160.000 Gs.                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ [🔒 BLOQUEAR RESERVA]      [💬 CHAT WHATSAPP]      [❌ DESCARTAR]           │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Máquina de Estados de una Reserva:
1. **`Solicitud Pendiente` (Dorado/Amarillo):** El cliente envió la solicitud desde la web. Aparece en el banner superior de recepción.
2. **`Confirmada` (Azul Ejecutivo):** La recepción presiona **"Bloquear Reserva"**. La cancha queda bloqueada y ya nadie más puede solicitar ese slot.
3. **`En Cancha` (Verde Esmeralda):** Los jugadores se presentan en recepción e ingresan a la pista.
4. **`Finalizada` (Gris Neutro):** El partido concluyó, los jugadores abonaron la cuenta en caja y el turno queda cerrado contablemente.
5. **`Cancelada` (Rojo Tenue):** Solicitud descartada o cancelada. El horario vuelve a quedar libre automáticamente en la web.

#### Acciones Directas del Operador:
- **Bloquear Reserva:** Pasa el estado a `Confirmada` con 1 solo clic.
- **Chat WhatsApp:** Abre el enlace `https://wa.me/595[telefono]` para iniciar chat directo con el cliente sin necesidad de agendarlo en los contactos del teléfono de recepción.
- **Descartar:** Cancela la solicitud pendiente si el cliente avisó que no podrá asistir.

---

### 3.6. Terminal POS, Cuentas Corrientes y Comandas de Cancha

Cada reserva activa cuenta con una cuenta corriente abierta (`tabs`) en el módulo **"Caja & Cuentas"**:
- **Consumos de Barra y Pro-Shop:** Los mozos o recepcionistas pueden cargar cervezas, energizantes, chopps, hamburguesas o pelotas a la comanda de la pista en tiempo real.
- **Protección de Precios con Trigger de Servidor (`trg_sync_tab_item_price`):** Aunque un cliente intentara enviar un precio adulterado, la base de datos ignora el valor enviado y fuerza el precio unitario oficial registrado en `menu_items`.

---

### 3.7. Calculadora de Pago por Jugadores (Fórmula de Prorrateo Dual)

Al concluir el partido, los jugadores acuden a pagar. En lugar de divisiones complejas o calculadoras externas, el terminal POS incorpora la **Calculadora de Pago por Jugadores**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🧮 CALCULADORA DE PAGO POR JUGADORES                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Cantidad de jugadores:  [ 2 ]  [ 4 ]  [ 6 ]  [ 8 ]   o ingresar: [ 8 ]      │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 🎾 SOLO CANCHA POR JUGADOR           │ 🧾 TOTAL CUENTA POR JUGADOR          │
│    20.000 Gs. / persona              │    35.000 Gs. / persona              │
│    (Cancha 160.000 Gs. entre 8)      │    (Cuenta total 280.000 Gs. entre 8)│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

#### Fórmulas de Cálculo:
$$\text{Solo Cancha por Jugador} = \frac{\text{Costo Cancha}}{\text{Cantidad de Jugadores}}$$

$$\text{Total Cuenta por Jugador} = \frac{\text{Costo Cancha} + \text{Alquileres} + \text{Pelotas} + \text{Consumos Bar}}{\text{Cantidad de Jugadores}}$$

#### Matriz de Ejemplos en Guaraníes:

| Concepto | Alquiler Cancha | Consumo Bar | Total Cuenta | Jugadores | Solo Cancha c/u | Total Cuenta c/u |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Partido Clásico Dobles** | 160.000 Gs. | 0 Gs. | 160.000 Gs. | 4 | **40.000 Gs.** | **40.000 Gs.** |
| **Dobles + Cervezas** | 160.000 Gs. | 80.000 Gs. | 240.000 Gs. | 4 | **40.000 Gs.** | **60.000 Gs.** |
| **Clase Compartida** | 180.000 Gs. | 30.000 Gs. | 210.000 Gs. | 6 | **30.000 Gs.** | **35.000 Gs.** |
| **Torneo Americano (Rotación)** | 160.000 Gs. | 120.000 Gs. | 280.000 Gs. | 8 | **20.000 Gs.** | **35.000 Gs.** |

#### Liquidación de Cuenta (`settle_tab`):
- Medios de pago soportados: **Tarjeta (POS Físico)**, **Efectivo** y **Transferencia Itaú**.
- La llamada a la RPC `settle_tab` registra el cajero responsable (`cashed_by`), la marca temporal de cobro (`cashed_at`), marca la cuenta como `settled` y la reserva asociada como `Finalizada`.

---

### 3.8. Modificación Dinámica de Tarifas (Estándar vs. Prime)
Desde la pantalla **"Tarifas & Stock"** del CRM, los administradores pueden cambiar los precios sin tocar código:
- **Tarifa Estándar:** Precio regular por hora de juego.
- **Tarifa Horario Prime:** Precio nocturno o fines de semana para alta demanda.
- El cambio impacta inmediatamente en la base de datos `courts` y se propaga en tiempo real a la web de reservas.

---

### 3.9. Control de Inventario, Semáforo de Stock Crítico y Disponibilidad
En la misma pantalla de catálogo, se gestiona el inventario de bebidas, snacks y merchandising:
- **Ajustes Rápidos:** Botones `+` y `-` para sumar ingresos de distribuidores o descontar mermas.
- **Semáforo de Stock Crítico:** Si el inventario de un producto desciende de **10 unidades**, el número se resalta en **color rojo**, alertando a la administración para reposición inmediata.
- **Conmutador de Disponibilidad:** Permite cambiar cualquier artículo a **"Agotado"** con un clic, ocultándolo de la venta en barra.
- **Alta de Nuevos Productos:** Modal para ingresar nombre, categoría, precio en Gs. y stock inicial.

---

### 3.10. BlackGym, BlackTeam y Circuito de Torneos Oficiales
- **BlackGym:** Información de membresías (Black Pass, Turno Mañana, Pádel Functional Training), equipamiento biomecánico Biostrength y registro de solicitudes de socios.
- **BlackTeam:** Plantel de profesores (Alejandro Benítez, Santiago Morales, Matías Duarte) con sus credenciales oficiales FIP/APA, disponibilidad de turnos y solicitud de clases.
- **Circuito & Torneos:** Cartelera de torneos y sorteos con pozo de premios. Cada tarjeta cuenta con un enlace directo a WhatsApp (`+595 983573396`) con el texto del torneo pre-cargado para coordinar la inscripción en persona con la organización.

---

### 3.11. Resiliencia de Red y Modo Offline Transparente
En caso de intermitencia en la conexión de internet del club:
- Las acciones operativas (cambios de estado, consumos en barra) se encolan automáticamente en `localStorage` bajo la clave `black_club_pending_queue`.
- En la barra superior ejecutiva aparece el indicador:  
  `🔴 Offline (X mutaciones pendientes)`.
- En cuanto se reanuda la conexión, un worker automático procesa la cola de manera secuencial, sincronizando los datos con Supabase sin pérdida de información.

---

### 3.12. Matriz de Roles Staff y Auditoría Inmutable
- **`owner` (Propietario / Gerente General):** Acceso total. Puede modificar tarifas de canchas, dar de alta productos, alterar roles de usuarios y eliminar turnos.
- **`reception` (Operadores de Turno):** Acceso operativo a la agenda maestra, bloqueo de turnos, comanda de barra, calculadora de cobro y liquidación de cuentas. Tiene restringida la eliminación de turnos pasados o alteración de precios base.
- **Pista de Auditoría (`audit_log`):** Triggers automáticos en PostgreSQL registran cada `INSERT`, `UPDATE` o `DELETE` en reservas, cuentas, consumos y cajas diarias, almacenando `user_id`, datos anteriores (`old_data`) y datos nuevos (`new_data`).

---

## 4. ESTRUCTURA DEL REPOSITORIO

El árbol de directorios ha sido optimizado y saneado de cualquier código legacy o archivos redundantes:

```
renan-crm/
├── public/                      # Activos estáticos públicos
│   ├── favicon.svg              # Ícono de pestaña oficial
│   ├── icons.svg                # Sprite SVG
│   └── images/                  # Imágenes oficiales de alta resolución
│       ├── blackgym.jpg         # Instalaciones Biostrength
│       ├── blackteam.jpg        # Coaches y academia
│       ├── court_panoramic.jpg  # Cancha Panorámica WPT
│       ├── fondo_pagina.jpg     # Background oficial
│       ├── logo_black_club.png  # Isologo corporativo Black Club
│       └── lounge_bar.jpg       # Bar & Tercer Tiempo
├── src/                         # Código fuente de la aplicación
│   ├── components/
│   │   ├── auth/                # Modal de login de staff (StaffLoginModal.jsx)
│   │   ├── executive/           # CRM y Suite de Gestión
│   │   │   ├── CatalogManagementView.jsx # Tarifas de canchas y stock de bar
│   │   │   ├── ExecutiveDashboard.jsx    # KPIs de facturación y ocupación
│   │   │   ├── ExecutiveSuite.jsx        # Contenedor y navegación del CRM
│   │   │   ├── MasterScheduleView.jsx    # Agenda maestra y alerta dorada
│   │   │   ├── PlayersDirectoryView.jsx  # Directorio CRM de jugadores
│   │   │   └── POSTerminalView.jsx       # Caja y Calculadora por Jugadores
│   │   ├── public/              # Portal Web de Jugadores
│   │   │   ├── BlackBarMenuView.jsx      # Carta digital gastronómica
│   │   │   ├── BlackGymView.jsx          # Membresías del gimnasio
│   │   │   ├── BlackTeamView.jsx         # Coaches y clases de pádel
│   │   │   ├── ConciergeDrawer.jsx       # Formulario ágil de reserva
│   │   │   ├── CourtsBookingView.jsx     # Grilla interactiva de canchas
│   │   │   ├── PublicPortal.jsx          # Portal público contenedor
│   │   │   └── TournamentsView.jsx       # Torneos y contacto WhatsApp
│   │   └── ExecutiveTopBar.jsx  # Barra superior con KPIs y modo offline
│   ├── context/
│   │   ├── ClubContext.jsx      # Estado global, realtime y sincronización
│   │   └── initialData.js       # Fallback de datos y configuración
│   ├── lib/
│   │   └── supabase.js          # Cliente oficial de Supabase
│   ├── services/
│   │   └── clubService.js       # Capa de datos y llamadas a RPCs
│   ├── utils/
│   │   ├── dateHelpers.js       # Utilidades de fecha, 7 días y horas pasadas
│   │   ├── financeHelpers.js    # Lógica de cálculo de saldos y prorrateo
│   │   └── formatters.js        # Formateo de Guaraníes (Gs.) y fechas
│   ├── App.jsx                  # Raíz de la app y orquestador de vistas
│   ├── index.css                # Sistema de tokens Obsidian Luxury CSS
│   └── main.jsx                 # Punto de entrada de React
├── tests/                       # Suite de pruebas unitarias
│   └── unit/
│       ├── calculateTabBalances.test.js # Tests de balances de caja
│       ├── formatGs.test.js             # Tests de formato moneda Gs.
│       ├── isSlotPast.test.js           # Tests de descarte de turnos pasados
│       └── offlineQueue.test.js         # Tests de encolado offline
├── .env.example                 # Variables de entorno requeridas
├── .gitignore                   # Archivos ignorados por Git
├── index.html                   # HTML base de la SPA
├── MANUAL_DE_USO_CLIENTE.md     # Manual operativo profesional para el cliente
├── package.json                 # Dependencias y scripts del proyecto
├── README.md                    # Documentación técnica y de negocio integral
├── supabase_schema.sql          # Esquema maestro SQL único de producción
├── vercel.json                  # Configuración de despliegue SPA en Vercel
└── vite.config.js               # Configuración del bundler Vite
```

---

## 5. GUÍA DE CONFIGURACIÓN DE LA BASE DE DATOS (SUPABASE)

Toda la base de datos se encuentra unificada en un solo archivo:

📄 [**`supabase_schema.sql`**](file:///home/thiagol/renan-crm/supabase_schema.sql)

### Instrucciones de Aplicación:
1. Inicia sesión en tu cuenta de [Supabase](https://supabase.com/) y abre tu proyecto.
2. En el menú lateral izquierdo, haz clic en **SQL Editor**.
3. Haz clic en **+ New Query**.
4. Copia el contenido completo de [`supabase_schema.sql`](file:///home/thiagol/renan-crm/supabase_schema.sql) y pégalo en el editor.
5. Haz clic en el botón verde **Run** (Ejecutar).
6. **Verificación:**
   - En **Table Editor**, verás las 15 tablas creadas y pobladas con los datos de seed.
   - En **Database ➜ Functions**, verificarás las funciones `create_public_booking`, `settle_tab`, `process_audit_log` y `current_user_role`.
   - En **Database ➜ Publications**, verificarás que `supabase_realtime` incluye las tablas principales.

---

## 6. GUÍA DE DESPLIEGUE EN PRODUCCIÓN (VERCEL)

El repositorio está configurado para integración y despliegue continuo (CI/CD) con Vercel.

### Pasos para Conectar y Publicar:
1. Ingresa a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en **Add New... ➜ Project**.
3. Selecciona el repositorio `renan-crm`.
4. Vercel detectará el archivo [`vercel.json`](file:///home/thiagol/renan-crm/vercel.json) y la configuración de Vite:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. En la sección **Environment Variables**, añade:
   - `VITE_SUPABASE_URL`: URL de tu proyecto en Supabase (ej: `https://xxxx.supabase.co`).
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima pública (`anon key`).
6. Haz clic en **Deploy**. Cada commit a la rama `main` en GitHub disparará automáticamente una nueva compilación y despliegue en Vercel.

---

## 7. DESARROLLO LOCAL Y EJECUCIÓN DE PRUEBAS

### 1. Clonar e Instalar
```bash
git clone https://github.com/thxlopez7/renan-crm.git
cd renan-crm
npm install
```

### 2. Configurar Entorno Local
Copia el archivo de plantilla y completa tus credenciales:
```bash
cp .env.example .env.local
```
Contenido de `.env.local`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

### 3. Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible de inmediato en `http://localhost:5173/`.

### 4. Ejecución de Pruebas Unitarias
```bash
npm run test
```
Ejecuta los 18 tests en Vitest cubriendo:
- `formatGs`: Formateo correcto con separador de miles por puntos y sufijo `Gs.`.
- `isSlotPast`: Detección precisa de turnos que ya transcurrieron según la hora de Asunción.
- `calculateTabBalances`: Integridad en la liquidación de canchas, paletas, pelotas y bar.
- `offlineQueue`: Encolamiento y vaciado secuencial de mutaciones en modo offline.

### 5. Compilación para Producción
```bash
npm run build
```

---

## 8. DOCUMENTACIÓN PARA EL CLIENTE FINAL

Para los dueños del club, socios administradores, recepcionistas y personal de mostrador que no tienen conocimientos técnicos de programación, se ha redactado un manual de procedimientos operativos estándar en lenguaje claro y ejecutivo:

📖 [**`MANUAL_DE_USO_CLIENTE.md`**](file:///home/thiagol/renan-crm/MANUAL_DE_USO_CLIENTE.md)

Incluye:
- Guía ilustrada de recepción de reservas y bloqueo de canchas.
- Uso paso a paso de la **Calculadora de Pago por Jugadores** en caja.
- Modificación de precios de canchas y control de inventario de bebidas.
- Checklists diarios para el personal (apertura mañana, atención continua y arqueo de caja nocturno).
- Plantillas de mensajes oficiales para responder a los clientes por WhatsApp.

---
*Black Club Elite · Plataforma de Gestión y Hospitalidad Deportiva · Todos los derechos reservados.*
