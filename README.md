# BLACK CLUB ELITE · PORTAL OFICIAL & CRM HOSPITALITY SUITE

Plataforma digital interactiva, funcional y escalable diseñada para **Black Club Elite** (`@blackclubparaguay`), complejo de pádel, hospitalidad y alto rendimiento en Paraguay.

El sistema integra un **Portal Público Mobile-First** para socios y clientes, conectado a una **Suite CRM Administrativa** con sincronización en tiempo real mediante **Supabase PostgreSQL & Auth**.

---

## ⚡ Tecnologías Principales

- **Frontend:** React 19 + Vite 8
- **Estilos:** Vanilla CSS con arquitectura de tokens de diseño ("Quiet Athletic Luxury")
- **Base de Datos & Auth:** Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Íconos:** Lucide Icons (trazo fino 1.5px)
- **Despliegue:** Optimizado para Vercel y GitHub

---

## 🚀 Despliegue en Vercel (Paso a Paso)

### 1. Subir a GitHub
Asegúrate de que todos los cambios estén subidos a tu repositorio en GitHub:
```bash
git add .
git commit -m "feat: Black Club Elite Portal & CRM Suite"
git push origin main
```

### 2. Importar el Proyecto en Vercel
1. Ingresa a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..."** ➜ **"Project"**.
3. Selecciona el repositorio `renan-crm` (o el nombre de tu repo).
4. Vercel detectará automáticamente la configuración de **Vite**:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3. Configurar Variables de Entorno en Vercel
En la sección **Environment Variables** antes del deploy, añade las siguientes variables:

| Variable | Valor de ejemplo |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://dsrascitdnjbaylgjrno.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5...` (tu anon public key) |

> [!TIP]
> Estas mismas claves se encuentran en tu archivo local `.env.local` (el cual está protegido en `.gitignore` para no exponer secretos en GitHub).

4. Haz clic en **"Deploy"**. En menos de 1 minuto tendrás tu URL de producción en Vercel activa con HTTPS y reescritura de rutas SPA lista vía `vercel.json`.

---

## 💻 Desarrollo Local

### 1. Clonar el Repositorio
```bash
git clone https://github.com/thxlopez7/renan-crm.git
cd renan-crm
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
Copia la plantilla de ejemplo y coloca tus credenciales de Supabase:
```bash
cp .env.example .env.local
```
Edita `.env.local`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación abrirá en `http://localhost:5173/`.

### 5. Compilar para Producción
```bash
npm run build
```

---

## 🗄️ Base de Datos Supabase

El archivo [supabase_schema.sql](supabase_schema.sql) contiene la estructura completa de base de datos con:
- `courts`: Canchas oficiales (Cancha Central Panorámica, Cancha 2 Indoor, Cancha 3 Outdoor).
- `menu_items`: Carta digital y productos del bar/pro-shop.
- `players`: Directorio CRM de socios y jugadores.
- `coaches`: Plantel de entrenadores BlackTeam.
- `bookings`: Agenda de reservas y turnos.
- `tabs`: Cuentas corrientes y liquidaciones en caja.
- Políticas RLS y funciones de incremento de saldos.

---

## 📱 Unidades del Sistema

1. **Portal Público (Mobile-First):**
   - **Pádel:** Grilla interactiva de turnos de 1 hora por cancha y acceso a concierge.
   - **BlackGym:** Información de membrecías, horarios y equipamiento biostrength.
   - **BlackTeam:** Academia y entrenadores certificados (Alejandro Benítez, Santiago Morales).
   - **Circuito:** Calendario de torneos y eventos deportivos.
   - **Bar & Merch:** Carta digital informativa con consulta de productos y precios directos en barra.

2. **Suite Administrativa CRM (Personal & Recepción):**
   - **Login de Staff:** Autenticación oficial de usuarios con Supabase Auth.
   - **Dashboard Ejecutivo:** Monitoreo en tiempo real de facturación (canchas + bar) y ocupación.
   - **Agenda de Canchas:** Matriz de reservas diarias y abonos semanales.
   - **Terminal POS:** Cuentas corrientes por cancha, carga rápida de consumos y liquidación en caja con división de pago (Split-Bill).
   - **Directorio CRM:** Clientes frecuentes, teléfonos y saldo de seña.
   - **Catálogo & Tarifas:** Edición en vivo de precios de turnos y disponibilidad de productos.
