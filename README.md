# BLACK CLUB ELITE · RENAN CRM & HOSPITALITY SUITE

Plataforma digital interactiva, funcional y escalable diseñada para **BlackClubElite** (`blackclubparaguay`), club deportivo, social y gastronómico de categoría premium en Paraguay.

El proyecto implementa un **Monolito Modular Unificado** con separación lógica entre el **Portal Público de Socios** (experiencia Concierge Mobile-First inspirada en SevenRooms y Soho House) y la **Suite Ejecutiva de Dirección** (CRM, Agenda Maestra y Terminal POS inspirada en Linear y Stripe Enterprise).

---

## Características Principales

### 1. Dirección de Arte & Lujo Silencioso
- **Paleta Obsidian & Platinum:** Fondo en negro obsidiana mate (`#070709`), superficies grafito (`#121216`), acentos en bronce champán (`#C5A880`) y bordes *hairline* de 1px.
- **Prohibición Total de Emojis:** Todo el sistema se resuelve mediante micro-puntos de estado geométricos de 6px, tipografía y *Lucide Icons* con trazo fino de 1.5px.
- **Tipografía & Formato Financiero:** Números tabulares estrictos con `JetBrains Mono` y encabezados geométricos con `Plus Jakarta Sans`. Todos los montos expresados en Guaraníes (`Gs.`) con separador de miles por punto (ej. `180.000 Gs.`).
- **Ubicación & Horarios Reales:** A 2 cuadras de la ruta principal.

### 2. Las Cinco Unidades de Negocio
1. **Black Club (Pádel):**
   - 3 Pistas oficiales: Pista Central Panorámica WPT (`180.000 Gs.`), Pista Indoor 02 Climatizada (`160.000 Gs.`) y Pista Pro 03 Outdoor Techada (`140.000 Gs.`).
   - Bloques de 90 minutos (de 08:00 a 00:30).
   - Drawer Concierge con desglose por jugador (`Tarifa / 4`), adición de equipamiento (paletas, pelotas) y reserva de mesa post-partido.
   - Datos bancarios automáticos para seña (Banco Itaú Paraguay).
2. **Bar & Gastronomía (BlackBar):**
   - Carta ejecutiva nocturna operando de **17:00 a 00:00**.
   - Comanda vinculada a pistas activas en el POS en tiempo real.
3. **BlackTeam (Academia de Alto Rendimiento):**
   - Roster de entrenadores con credenciales y bio.
   - Bloqueo automático de pista al agendar una sesión privada.
4. **BlackGym (Fitness & Biostrength):**
   - Horarios oficiales: Lun-Vie 7:00-12:00 / 14:00-21:00; Sáb 8:00-13:00.
   - Planes mensuales, pase diario y membresía integral con pádel.
5. **Eventos & Torneos:**
   - Campeonatos oficiales FIP y corporativos con bolsa de premios e inscripción de binomios.

### 3. Suite Ejecutiva (CRM, Agenda & POS)
- **Dashboard Ejecutivo:** 4 KPIs en tiempo real (Facturación Pistas vs Bar, Ocupación %, Cuentas Abiertas, Monitor de Operaciones).
- **Agenda Maestra:** Grilla completa del día, gestión de estados (`Seña Pendiente` -> `Confirmada` -> `En Pista` -> `Finalizada`) y Abonos Fijos Semanales.
- **Terminal POS & Split-Bill:**
   - Cuentas corrientes vinculadas a pistas en juego.
   - Botonera de carga rápida (un solo clic para bebidas, comida y pelotas).
   - Motor Split-Bill para división exacta entre 1, 2, 3 o 4 jugadores.
   - Liquidación de cuentas con conciliación inmediata en caja.
- **Directorio de Socios (CRM):** Base de datos de jugadores con historial y consumo acumulado.
- **Gestión de Catálogo:** Actualización en vivo de tarifas de pistas y disponibilidad de platos/bebidas.

---

## Requisitos Previos

- **Node.js**: Versión 18 o superior (recomendado Node 20 / 22 / 24).
- **npm** o **pnpm**.

---

## Instalación y Ejecución en Otra PC

### 1. Clonar el Repositorio
```bash
git clone https://github.com/thxlopez7/renan-crm.git
cd renan-crm
```
*(O vía SSH: `git clone git@github.com:thxlopez7/renan-crm.git`)*

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en `http://localhost:5173/`.

### 4. Compilar para Producción
```bash
npm run build
```

---

## Estructura del Código

```
├── public/
│   └── images/              # Fotografías editoriales de pistas, bar, academia y gym
├── src/
│   ├── assets/              # Recursos gráficos estáticos
│   ├── components/
│   │   ├── ExecutiveTopBar.jsx      # Barra de control y conmutador Portal / Dirección
│   │   ├── public/                  # Entorno Portal Socio (Mobile-First)
│   │   │   ├── PublicPortal.jsx     # Contenedor principal con indicadores y navegación
│   │   │   ├── CourtsBookingView.jsx# Grilla de 90 min y selector de 7 días
│   │   │   ├── ConciergeDrawer.jsx  # Slide-over SevenRooms con split-bill y seña
│   │   │   ├── BlackBarMenuView.jsx # Carta digital con comanda hacia el POS
│   │   │   ├── BlackTeamView.jsx    # Academia con bloqueo de pistas
│   │   │   ├── BlackGymView.jsx     # Membresías y horarios de fitness
│   │   │   └── TournamentsView.jsx  # Circuitos e inscripción de parejas
│   │   └── executive/               # Entorno Suite Dirección (Desktop/Tablet First)
│   │       ├── ExecutiveSuite.jsx   # Sidebar fija y enrutamiento interno
│   │       ├── ExecutiveDashboard.jsx # 4 KPIs financieros en Guaraníes
│   │       ├── MasterScheduleView.jsx# Matriz general de pistas y abonos fijos
│   │       ├── POSTerminalView.jsx  # POS doble columna, carga rápida y split-bill
│   │       ├── PlayersDirectoryView.jsx # Base CRM de jugadores y consumos
│   │       └── CatalogManagementView.jsx # Administrador de tarifas y stock
│   ├── context/
│   │   ├── ClubContext.jsx  # Almacén de estado reactivo global + LocalStorage
│   │   └── initialData.js   # Semilla de datos reales precargados
│   ├── utils/
│   │   └── formatters.js    # Utilidades estrictas para Guaraníes (Gs.) y fechas
│   ├── App.jsx              # Punto de entrada unificado
│   ├── index.css            # Sistema de diseño de lujo en Vanilla CSS
│   └── main.jsx             # Montaje de React 19
├── index.html               # Configuración de Google Fonts (Plus Jakarta Sans + JetBrains Mono)
├── package.json
└── vite.config.js
```

---

## Control de Escenario Demo
En la barra superior de la aplicación (`ExecutiveTopBar`):
- Haz clic en **PORTAL SOCIO** para la experiencia del cliente.
- Haz clic en **SUITE DIRECCIÓN · CRM & POS** para el panel de administración.
- Haz clic en **Reset Demo** para restaurar el escenario con las 9 reservas operativas del día.
