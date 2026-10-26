# 🎾 BLACK CLUB ELITE · PLATAFORMA DIGITAL & SUITE CRM
> **Sistema Integral de Gestión Deportiva, Hospitalidad y Portal Público de Reservas**  
> Complejo Oficial: `@blackclubparaguay` · Asunción, Paraguay  
> WhatsApp Oficial: `+595 983573396` (`+595 983 573 396`)  
> Moneda Oficial: Guaraníes Paraguayos (`Gs.`)

---

## 🌟 Visión del Proyecto

**Black Club Elite** es una plataforma web progresiva (PWA) de alto rendimiento diseñada bajo estándares de lujo silencioso (*Quiet Athletic Luxury*). Unifica en una sola solución:

1. **Portal Público de Jugadores (Mobile-First):**
   - Grilla interactiva de turnos de 1 hora para las 3 pistas reglamentarias.
   - **Nuevo flujo ágil sin señas previas:** Solicitud con 1 toque y redirección automática a WhatsApp oficial con mensaje pre-redactado.
   - Cartelera oficial de torneos con contacto directo.
   - Carta digital del bar y lounge con control de disponibilidad.
   - Planes de membresía BlackGym y cuerpo técnico BlackTeam.

2. **Suite CRM Ejecutiva (Para Propietarios y Recepción):**
   - **Agenda Maestra en vivo** con tarjeta dorada de notificación de solicitudes entrantes (*"¡Alguien quiere reservar una cancha!"*), bloqueo en 1 clic y chat directo.
   - **Terminal POS & Cajas:** Comandas en pista, carga de consumiciones y **Calculadora de Pago por Jugadores** (desglose exacto: *Solo Cancha* vs. *Total Cuenta* para 2, 4, 6 u 8 personas).
   - **Gestión de Tarifas e Inventario:** Modificación en caliente de tarifas estándar/prime y control de stock de consumibles con semáforo de alerta (< 10 unidades).
   - **Directorio de Clientes:** Historial de partidos, saldos y notas de fidelización.
   - **Resiliencia Offline:** Cola de mutaciones en memoria local ante cortes temporales de red.

---

## ⚡ Stack Tecnológico

- **Frontend:** React 19 + Vite 8
- **Estilos:** Vanilla CSS modular con paleta HSL Obsidian Dark Mode
- **Base de Datos & Auth:** Supabase (PostgreSQL 15+, Row Level Security, RPCs transaccionales y WebSockets Realtime)
- **Íconos:** Lucide Icons (trazo refinado 1.5px)
- **Testing:** Vitest (18 tests unitarios: finanzas, fechas, resiliencia offline)
- **Linter:** Oxlint (0 errores)
- **Despliegue:** Vercel (CI/CD automático vinculado a GitHub `main`)

---

## 🗄️ Base de Datos: Archivo Maestro Único

Toda la base de datos se encuentra consolidada en un único archivo SQL maestro, idempotente y listo para producción:

📄 [**`supabase_schema.sql`**](supabase_schema.sql)

### ¿Cómo configurarlo en Supabase?
1. Ingresa a tu panel en [Supabase](https://supabase.com/).
2. Dirígete a **SQL Editor**.
3. Abre o copia el contenido completo de `supabase_schema.sql`.
4. Presiona **Run**.
5. ¡Listo! Se crearán todas las tablas, índices anti-doble reserva (`uq_bookings_active_slot`), RPCs (`create_public_booking`, `settle_tab`), políticas RLS, canal realtime y datos iniciales de producción.

---

## 🚀 Despliegue en Vercel

El proyecto cuenta con `vercel.json` configurado para Vite y enrutamiento SPA:

1. Conecta tu repositorio de GitHub `renan-crm` en [Vercel](https://vercel.com/).
2. Configura las variables de entorno en el panel de Vercel:
   - `VITE_SUPABASE_URL`: Tu URL del proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima pública de Supabase.
3. Cada `git push origin main` desplegará la última versión automáticamente.

---

## 💻 Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/thxlopez7/renan-crm.git
cd renan-crm

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales de Supabase

# 4. Iniciar servidor local
npm run dev

# 5. Ejecutar tests unitarios
npm run test

# 6. Compilar para producción
npm run build
```

---

## 📚 Documentación para el Cliente

Para el manual de operación diaria dirigido a los dueños del club, administradores y personal de recepción (redactado sin tecnicismos), consulta:

📖 [**`MANUAL_DE_USO_CLIENTE.md`**](MANUAL_DE_USO_CLIENTE.md)
