-- ==============================================================================
-- BLACK CLUB ELITE (@blackclubparaguay)
-- SUPABASE PRODUCTION DATABASE SCHEMA & INITIAL DATA
-- PostgreSQL / Supabase Compatible
-- Full Coverage: Public Portal & Executive Management CRM
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES IF RE-CREATING (Cascading in reverse dependency order)
DROP TABLE IF EXISTS tournament_registrations CASCADE;
DROP TABLE IF EXISTS gym_applications CASCADE;
DROP TABLE IF EXISTS tab_items CASCADE;
DROP TABLE IF EXISTS tabs CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS gym_plans CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS courts CASCADE;

-- ==============================================================================
-- 3. CORE TABLES DEFINITIONS
-- ==============================================================================

-- 3.1 Canchas Oficiales de Pádel
CREATE TABLE courts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  specs TEXT NOT NULL,
  surface TEXT NOT NULL,
  enclosure TEXT NOT NULL,
  lighting TEXT NOT NULL,
  rate INTEGER NOT NULL,             -- Monto normal en Guaraníes (Gs.)
  prime_rate INTEGER NOT NULL,       -- Monto horario prime en Guaraníes (Gs.)
  indoor BOOLEAN NOT NULL DEFAULT FALSE,
  panoramic BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'operational', -- 'operational', 'maintenance'
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 BlackTeam Coaches & Staff Técnico
CREATE TABLE coaches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  credentials TEXT,
  bio TEXT,
  rate INTEGER NOT NULL,             -- Tarifa por hora de clase en Gs.
  default_court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
  avatar TEXT,
  enabled_slots TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Menú de Hospitalidad, Barra & Pro-Shop (Bar & Merch)
CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,           -- 'Comida & Picadas', 'Cervezas & Chopp', 'Hidratación & Bebidas', 'Pro-Shop & Merch'
  description TEXT,
  price INTEGER NOT NULL,           -- Precio unitario en Guaraníes (Gs.)
  available BOOLEAN NOT NULL DEFAULT TRUE,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 BlackGym: Membresías y Programas de Rendimiento Biostrength
CREATE TABLE gym_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,             -- 'Mensual Libre', 'Mensual Matutino', 'Mensual Específico'
  price INTEGER NOT NULL,           -- Arancel mensual en Guaraníes (Gs.)
  badge TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Circuito & Torneos Oficiales (@blackclubparaguay)
CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  is_flagship BOOLEAN NOT NULL DEFAULT FALSE,
  dates TEXT NOT NULL,
  prize_pool BIGINT NOT NULL DEFAULT 0, -- Pozo en Guaraníes (Gs.)
  entry_fee INTEGER NOT NULL DEFAULT 0, -- Inscripción por pareja en Gs.
  categories TEXT[] DEFAULT '{}',
  slots INTEGER NOT NULL DEFAULT 32,
  registered_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Inscripciones Abiertas',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 Directorio de Clientes y Jugadores (CRM)
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT DEFAULT '4ta Categoría',
  is_fixed_pass_holder BOOLEAN NOT NULL DEFAULT FALSE,
  fixed_pass_day TEXT,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  total_spent BIGINT NOT NULL DEFAULT 0, -- Gasto acumulado en Guaraníes (Gs.)
  status TEXT NOT NULL DEFAULT 'Jugador Frecuente',
  last_visit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Reservas de Canchas (Portal Público & Agenda CRM)
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,          -- '18:00 - 19:00', '19:00 - 20:00', etc.
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Reserva Estándar', -- 'Reserva Estándar', 'Turno Fijo Semanal', 'Clase BlackTeam'
  status TEXT NOT NULL DEFAULT 'Confirmada',          -- 'Confirmada', 'Seña Pendiente', 'En Cancha', 'Finalizada', 'Cancelada'
  court_amount INTEGER NOT NULL DEFAULT 0,
  deposit_paid INTEGER NOT NULL DEFAULT 0,
  bar_table_requested BOOLEAN NOT NULL DEFAULT FALSE,
  rented_rackets INTEGER NOT NULL DEFAULT 0,
  ball_tubes INTEGER NOT NULL DEFAULT 0,
  linked_tab_id TEXT,
  created_at_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Cuentas Operativas / Terminal POS (Caja, Tercer Tiempo & Liquidación)
CREATE TABLE tabs (
  id TEXT PRIMARY KEY,
  linked_booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  court_id TEXT REFERENCES courts(id) ON DELETE SET NULL,
  court_name TEXT,
  client_name TEXT NOT NULL,
  court_amount INTEGER NOT NULL DEFAULT 0,
  deposit_paid INTEGER NOT NULL DEFAULT 0,
  racket_count INTEGER NOT NULL DEFAULT 0,
  racket_unit_fee INTEGER NOT NULL DEFAULT 30000,
  ball_tube_count INTEGER NOT NULL DEFAULT 0,
  ball_tube_unit_fee INTEGER NOT NULL DEFAULT 70000,
  status TEXT NOT NULL DEFAULT 'open',         -- 'open', 'settled', 'cancelled'
  activity_status TEXT NOT NULL DEFAULT 'en_cancha', -- 'en_cancha', 'tercer_tiempo', 'liquidada'
  payment_method TEXT,                        -- 'Tarjeta', 'Efectivo', 'Transferencia / QR'
  settled_at TEXT,
  bar_table_requested BOOLEAN NOT NULL DEFAULT FALSE,
  opened_at TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 Detalle de Consumos en Cuenta POS (Relación 1 a N)
CREATE TABLE tab_items (
  id TEXT PRIMARY KEY,
  tab_id TEXT NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,           -- Precio unitario histórico al momento del consumo
  qty INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Solicitudes y Postulaciones de Membresía BlackGym
CREATE TABLE gym_applications (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES gym_plans(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'Contactado', 'Activo'
  date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 Inscripciones de Parejas al Circuito & Torneos
CREATE TABLE tournament_registrations (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  pair_name TEXT NOT NULL,
  player1 TEXT NOT NULL,
  player2 TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. ÍNDICES DE RENDIMIENTO PARA CONSULTAS FRECUENTES
-- ==============================================================================
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_court ON bookings(court_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_tabs_status ON tabs(status);
CREATE INDEX idx_tabs_activity ON tabs(activity_status);
CREATE INDEX idx_tab_items_tab_id ON tab_items(tab_id);
CREATE INDEX idx_players_phone ON players(phone);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & POLÍTICAS
-- Configuración permisiva para que el Portal Público y el CRM operen fluidamente
-- ==============================================================================

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tab_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura abierta para el catálogo público
CREATE POLICY "Public read courts" ON courts FOR SELECT USING (true);
CREATE POLICY "Public read coaches" ON coaches FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read gym_plans" ON gym_plans FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);

-- Políticas de escritura pública para reservas y formularios
CREATE POLICY "Allow read bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update bookings" ON bookings FOR UPDATE USING (true);

CREATE POLICY "Allow read tabs" ON tabs FOR SELECT USING (true);
CREATE POLICY "Allow insert tabs" ON tabs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update tabs" ON tabs FOR UPDATE USING (true);
CREATE POLICY "Allow delete tabs" ON tabs FOR DELETE USING (true);

CREATE POLICY "Allow read tab_items" ON tab_items FOR SELECT USING (true);
CREATE POLICY "Allow insert tab_items" ON tab_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update tab_items" ON tab_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete tab_items" ON tab_items FOR DELETE USING (true);

CREATE POLICY "Allow read players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update players" ON players FOR UPDATE USING (true);

CREATE POLICY "Allow all gym_applications" ON gym_applications FOR ALL USING (true);
CREATE POLICY "Allow all tournament_registrations" ON tournament_registrations FOR ALL USING (true);

-- Políticas de edición de catálogo desde el CRM
CREATE POLICY "Allow update courts" ON courts FOR UPDATE USING (true);
CREATE POLICY "Allow update menu_items" ON menu_items FOR UPDATE USING (true);

-- ==============================================================================
-- 6. HABILITAR SUPABASE REALTIME
-- Sincronización automática de canchas, reservas y caja en tiempo real
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE courts;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE tabs;
ALTER PUBLICATION supabase_realtime ADD TABLE tab_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- ==============================================================================
-- 7. SEED DATA COMPLETO (DATOS REALES DEL PROYECTO)
-- ==============================================================================

-- 7.1 Canchas Oficiales
INSERT INTO courts (id, name, code, specs, surface, enclosure, lighting, rate, prime_rate, indoor, panoramic, status, image)
VALUES
('court-1', 'Cancha Central Panorámica', 'CANCHA 01 · WPT', 'Vidrio Panorámico 12mm WPT · Césped Monofilamento Negro Texturizado · LED 1000 Lux', 'Césped Texturizado Negro Pro', 'Cristal Panorámico Continuo WPT', 'LED Competition 1000 Lux', 160000, 180000, false, true, 'operational', '/images/court_panoramic.jpg'),
('court-2', 'Cancha 2 (Indoor Climatizada)', 'CANCHA 02 · CLIMA', 'Climatizada 21°C · Cerramiento Acústico · Iluminación LED Directa Difusa', 'Césped Monofilamento Tournament', 'Vidrio Laminado Acústico 10+10mm', 'Paneles LED Difusos Especiales', 140000, 160000, true, false, 'operational', '/images/court_panoramic.jpg'),
('court-3', 'Cancha 3 (Outdoor Techada)', 'CANCHA 03 · OUTDOOR', 'Outdoor Techada · Aluminio Aeroespacial · Césped Tournament Blue', 'Césped Fibrilado Azul Oficial', 'Estructura Aluminio Reforzada', 'Torretas LED Exteriores 800 Lux', 120000, 140000, false, false, 'operational', '/images/court_panoramic.jpg')
ON CONFLICT (id) DO UPDATE SET rate = EXCLUDED.rate, prime_rate = EXCLUDED.prime_rate;

-- 7.2 Entrenadores BlackTeam
INSERT INTO coaches (id, name, role, credentials, bio, rate, default_court_id, avatar, enabled_slots)
VALUES
('coach-1', 'Alejandro Benítez', 'Director Técnico de Academia', 'Ex-Jugador WPT · Entrenador Nivel 3 FIP', 'Biomecánica cinemática del golpe, transiciones ofensivas y táctica en situaciones bajo presión.', 200000, 'court-1', '/images/blackteam.jpg', ARRAY['08:00 - 09:00', '15:00 - 16:00', '19:00 - 20:00']),
('coach-2', 'Santiago Morales', 'Head Coach de Competición', 'Certificado APA · Especialista en Rendimiento', 'Formador de parejas líderes en primera y segunda categoría. Lectura de pared y aceleración de bandeja.', 160000, 'court-2', '/images/blackteam.jpg', ARRAY['09:00 - 10:00', '17:00 - 18:00', '21:00 - 22:00']),
('coach-3', 'Matías Duarte', 'Instructor Formativo & Clínicas', 'Técnico Nacional de Pádel', 'Consolidación técnica para categorías intermedias, consistencia en fondo de cancha y juego aéreo.', 130000, 'court-3', '/images/blackteam.jpg', ARRAY['11:00 - 12:00', '18:00 - 19:00'])
ON CONFLICT (id) DO NOTHING;

-- 7.3 Menú de Comida, Cervezas, Hidratación & Pro-Shop
INSERT INTO menu_items (id, name, category, description, price, available, tag)
VALUES
('menu-1', 'Picada Black Club', 'Comida & Picadas', 'Tiras de lomito vacuno a la plancha, chorizo parrillero artesanal, mandioca frita y dip criollo.', 85000, true, 'Clásico Tercer Tiempo'),
('menu-2', 'Black Angus Burger', 'Comida & Picadas', 'Medallón 180g de novillo seleccionado, queso cheddar fundido, panceta crocante y papas rústicas.', 62000, true, 'Favorito'),
('menu-3', 'Sándwich de Lomito Completo', 'Comida & Picadas', 'Bife de lomo tierno, jamón cocido, queso muzzarella, huevo frito, lechuga y tomate en pan ciabatta.', 52000, true, 'Post-Partido'),
('menu-4', 'Papas Rústicas con Cheddar & Bacon', 'Comida & Picadas', 'Papas con piel crujientes bañadas en salsa cheddar casera y lluvia de panceta crocante.', 38000, true, 'Para Compartir'),
('menu-5', 'Promo 2x1 Chopp (Noches de Copa)', 'Cervezas & Chopp', 'Dos manijas de chopp artesanal helado tirado en el momento (Happy Hour Pádel).', 28000, true, 'Promo Insignia'),
('menu-6', 'Balde x6 Stella Artois 330ml', 'Cervezas & Chopp', 'Balde con hielo picado y 6 botellas de Stella Artois bien frías para la mesa del equipo.', 95000, true, 'Balde Tercer Tiempo'),
('menu-7', 'Balde x6 Patagonia 24.7 IPA', 'Cervezas & Chopp', 'Balde con hielo y 6 botellitas Patagonia Session IPA con notas cítricas y lúpulo fresco.', 110000, true, 'Cerveza Craft'),
('menu-8', 'Chopp Individual 500ml', 'Cervezas & Chopp', 'Chopp rubio servido a -2°C con espuma densa en manija congelada.', 18000, true, 'Barra'),
('menu-9', 'Corona Extra 355ml c/ Lima', 'Cervezas & Chopp', 'Botella servida con gajo de lima fresca en el cuello.', 22000, true, 'Barra'),
('menu-10', 'Gatorade Cool Blue 750ml', 'Hidratación & Bebidas', 'Isotónico con electrolitos para reposición inmediata en cancha.', 16000, true, 'En Cancha'),
('menu-11', 'Agua Mineral San Roque 500ml', 'Hidratación & Bebidas', 'Agua mineral natural sin gas o con gas, bien helada.', 10000, true, 'Básico'),
('menu-12', 'Gaseosas Coca-Cola / Zero 500ml', 'Hidratación & Bebidas', 'Botellita individual clásica de 500ml fría.', 12000, true, 'Refresco'),
('menu-13', 'Red Bull Energy Drink 250ml', 'Hidratación & Bebidas', 'Lata clásica energizante para antes del partido.', 20000, true, 'Pre-Partido'),
('menu-14', 'Tubo Bullpadel Next Pro (x3)', 'Pro-Shop & Merch', 'Pelotas oficiales presurizadas de rebote vivo y máxima durabilidad para partidos oficiales.', 70000, true, 'Pro-Shop'),
('menu-15', 'Remera Técnica Oficial Black Club', 'Pro-Shop & Merch', 'Remera dry-fit negra con logo monocromo de alta densidad y respiración micro-perforada.', 160000, true, 'Merchandising'),
('menu-16', 'Quepi Oficial Black Club (Snapback)', 'Pro-Shop & Merch', 'Gorra deportiva estructurada negra con bordado frontal en relieve y visera semi-curva.', 120000, true, 'Merchandising'),
('menu-17', 'Overgrip Bullpadel Pro Perforado', 'Pro-Shop & Merch', 'Grip micro-perforado de máximo agarre y absorción para clima caluroso.', 25000, true, 'Pro-Shop'),
('menu-18', 'Alquiler de Paleta de Test (90 min)', 'Pro-Shop & Merch', 'Paleta gama alta de carbono para uso durante el turno de juego.', 30000, true, 'Alquiler Cancha')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, available = EXCLUDED.available;

-- 7.4 Membresías BlackGym
INSERT INTO gym_plans (id, name, period, price, badge, featured, description, features)
VALUES
('plan-black-pass', 'Black Pass Completo', 'Mensual Libre', 450000, 'MÁS ELEGIDO', true, 'Acceso total a la sala de fuerza, máquinas Biostrength y vestuarios ejecutivos.', ARRAY['Acceso en ambos turnos (07:00 a 12:00 y 14:00 a 21:00)', 'Sábados de 08:00 a 13:00', 'Evaluación biomecánica y rutina digital personalizada', 'Lockers individuales y toallas de entrenamiento', '1 turno de cancha mensual bonificado en horario prime']),
('plan-morning', 'Turno Mañana Bio', 'Mensual Matutino', 320000, 'MATUTINO', false, 'Enfoque matinal de acondicionamiento físico de alto rendimiento.', ARRAY['Lunes a Viernes de 07:00 a 12:00 hs', 'Sábados de 08:00 a 13:00 hs', 'Seguimiento de progresión física mensual', 'Duchas y vestuarios premium']),
('plan-padel-fit', 'Pádel Functional Training', 'Mensual Específico', 380000, 'ESPECÍFICO PÁDEL', false, 'Preparación física adaptada a los movimientos explosivos y rotacionales del pádel.', ARRAY['3 sesiones semanales con preparador físico especializado', 'Prevención de lesiones de manguito rotador y codo', 'Desarrollo de potencia de salto y desplazamiento lateral', 'Acceso libre a zona de descarga y stretching'])
ON CONFLICT (id) DO NOTHING;

-- 7.5 Circuito & Torneos Oficiales
INSERT INTO tournaments (id, title, type, is_flagship, dates, prize_pool, entry_fee, categories, slots, registered_count, status, description)
VALUES
('tourn-1', 'Circuito Black Pádel · 2da Edición', 'Circuito Oficial', true, '24 - 27 de Noviembre 2026', 20000000, 300000, ARRAY['2da', '3ra', '4ta', '5ta', '6ta'], 64, 48, 'Inscripciones Abiertas', 'Segunda edición del torneo insignia de Black Club Elite. Cuadro oficial con fase de grupos y llaves de eliminación directa.'),
('tourn-2', 'Torneo Nocturno de Principiantes', 'Abierto Social', false, '12 - 13 de Diciembre 2026', 5000000, 200000, ARRAY['6ta', '7ma', 'Iniciación'], 32, 22, 'Inscripciones Abiertas', 'Competencia recreativa para jugadores en formación con tercer tiempo integrado y asado de camaradería.'),
('tourn-3', 'Gran Sorteo Palas Bullpadel & Merch', 'Sorteo & Evento', false, 'Sorteo 20 de Diciembre', 12000000, 50000, ARRAY['General', 'Socios BlackClub'], 200, 135, 'Tickets Habilitados', 'Sorteo de fin de año: 3 Palas Bullpadel Hack 03 Pro, 10 tubos de pelotas y kits exclusivos de indumentaria.')
ON CONFLICT (id) DO NOTHING;

-- 7.6 Directorio de Clientes (CRM)
INSERT INTO players (id, name, phone, category, is_fixed_pass_holder, fixed_pass_day, total_bookings, total_spent, status, last_visit)
VALUES
('plr-1', 'Gonzalo Insfrán', '+595 981 445 210', '2da Categoría', true, 'Jueves 18:00 a 19:00 (Cancha Central)', 24, 4860000, 'Cliente Activo Elite', 'Hoy, 18:00'),
('plr-2', 'Federico Zuccolillo', '+595 981 990 001', '1ra Categoría', true, 'Jueves 20:00 a 21:00 (Cancha Central)', 32, 6240000, 'Cliente Activo Elite', 'Hoy, 20:00'),
('plr-3', 'Rodrigo Villalba', '+595 971 889 012', '3ra Categoría', false, null, 11, 2010000, 'Jugador Frecuente', 'Hoy, 18:00'),
('plr-4', 'Matías Peña', '+595 983 551 772', '4ta Categoría', false, null, 8, 1620000, 'Jugador Frecuente', 'Hoy, 19:00'),
('plr-5', 'Carlos Argaña', '+595 972 660 449', '5ta Categoría', false, null, 7, 1150000, 'Nuevo Registro', 'Hoy, 19:00'),
('plr-6', 'Andrea Benítez', '+595 994 220 889', '3ra Damas', false, null, 14, 2680000, 'Jugadora Frecuente', 'Hoy, 20:00'),
('plr-7', 'Sebastián Duarte', '+595 992 334 115', '4ta Categoría', false, null, 19, 3510000, 'Jugador Frecuente', 'Hoy, 17:00')
ON CONFLICT (id) DO NOTHING;

-- 7.7 Reservas Iniciales del Día (CURRENT_DATE)
INSERT INTO bookings (id, code, court_id, date, time_slot, client_name, client_phone, category, status, court_amount, deposit_paid, bar_table_requested, rented_rackets, ball_tubes, linked_tab_id, created_at_time)
VALUES
('book-101', 'BC-9842', 'court-1', CURRENT_DATE, '18:00 - 19:00', 'Gonzalo Insfrán', '+595 981 445 210', 'Turno Fijo Semanal', 'En Cancha', 160000, 100000, true, 0, 1, 'tab-101', '17:55'),
('book-102', 'BC-9843', 'court-2', CURRENT_DATE, '18:00 - 19:00', 'Rodrigo Villalba', '+595 971 889 012', 'Reserva Estándar', 'En Cancha', 140000, 70000, false, 2, 0, 'tab-102', '17:58'),
('book-103', 'BC-9839', 'court-3', CURRENT_DATE, '17:00 - 18:00', 'Sebastián Duarte', '+595 992 334 115', 'Reserva Estándar', 'Finalizada', 120000, 60000, false, 0, 1, 'tab-103', '16:55'),
('book-104', 'BC-9845', 'court-1', CURRENT_DATE, '19:00 - 20:00', 'Matías Peña', '+595 983 551 772', 'Reserva Estándar', 'Confirmada', 160000, 80000, true, 0, 1, 'tab-104', '17:40'),
('book-105', 'BC-9846', 'court-2', CURRENT_DATE, '19:00 - 20:00', 'Alejandro Benítez (BlackTeam)', '+595 981 112 334', 'Clase BlackTeam', 'Confirmada', 200000, 100000, false, 0, 1, 'tab-105', '16:10'),
('book-106', 'BC-9847', 'court-3', CURRENT_DATE, '19:00 - 20:00', 'Carlos Argaña', '+595 972 660 449', 'Reserva Estándar', 'Seña Pendiente', 120000, 0, false, 0, 0, 'tab-106', '18:15'),
('book-107', 'BC-9848', 'court-1', CURRENT_DATE, '20:00 - 21:00', 'Federico Zuccolillo', '+595 981 990 001', 'Turno Fijo Semanal', 'Confirmada', 160000, 80000, true, 0, 1, 'tab-107', '14:20'),
('book-108', 'BC-9849', 'court-2', CURRENT_DATE, '20:00 - 21:00', 'Andrea Benítez & Binomio', '+595 994 220 889', 'Reserva Estándar', 'Confirmada', 140000, 70000, false, 2, 1, 'tab-108', '15:45'),
('book-109', 'BC-9835', 'court-3', CURRENT_DATE, '11:00 - 12:00', 'Clínica de Perfeccionamiento', '+595 981 777 444', 'Clase BlackTeam', 'Finalizada', 130000, 130000, false, 0, 1, 'tab-109', '10:50')
ON CONFLICT (id) DO NOTHING;

-- 7.8 Cuentas Operativas (POS)
INSERT INTO tabs (id, linked_booking_id, court_id, court_name, client_name, court_amount, deposit_paid, racket_count, racket_unit_fee, ball_tube_count, ball_tube_unit_fee, status, activity_status, payment_method, settled_at, bar_table_requested, opened_at)
VALUES
('tab-101', 'book-101', 'court-1', 'Cancha Central Panorámica', 'Gonzalo Insfrán', 160000, 100000, 0, 30000, 1, 70000, 'open', 'en_cancha', null, null, true, '17:55'),
('tab-102', 'book-102', 'court-2', 'Cancha 2 (Indoor Climatizada)', 'Rodrigo Villalba', 140000, 70000, 2, 30000, 0, 70000, 'open', 'en_cancha', null, null, false, '17:58'),
('tab-103', 'book-103', 'court-3', 'Cancha 3 (Outdoor Techada)', 'Sebastián Duarte', 120000, 60000, 0, 30000, 1, 70000, 'settled', 'liquidada', 'Tarjeta', '18:35', false, '16:55'),
('tab-104', 'book-104', 'court-1', 'Cancha Central (3er Tiempo)', 'Matías Peña', 160000, 80000, 0, 30000, 1, 70000, 'open', 'tercer_tiempo', null, null, true, '17:40'),
('tab-105', 'book-105', 'court-2', 'Barra BlackBar (Post-Clase)', 'Alejandro Benítez (BlackTeam)', 200000, 100000, 0, 30000, 1, 70000, 'open', 'tercer_tiempo', null, null, false, '16:10')
ON CONFLICT (id) DO NOTHING;

-- 7.9 Consumos de Barra / Merchandising en Cuentas
INSERT INTO tab_items (id, tab_id, menu_item_id, name, price, qty)
VALUES
('item-1', 'tab-101', 'menu-5', 'Promo 2x1 Chopp (Noches de Copa)', 28000, 1),
('item-2', 'tab-101', 'menu-1', 'Picada Black Club', 85000, 1),
('item-3', 'tab-102', 'menu-10', 'Gatorade Cool Blue 750ml', 16000, 2),
('item-4', 'tab-102', 'menu-11', 'Agua Mineral San Roque 500ml', 10000, 2),
('item-5', 'tab-103', 'menu-6', 'Balde x6 Stella Artois 330ml', 95000, 1),
('item-6', 'tab-104', 'menu-5', 'Promo 2x1 Chopp (Noches de Copa)', 28000, 2),
('item-7', 'tab-104', 'menu-2', 'Black Angus Burger', 62000, 2),
('item-8', 'tab-105', 'menu-10', 'Gatorade Cool Blue 750ml', 16000, 1)
ON CONFLICT (id) DO NOTHING;
