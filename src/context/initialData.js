/**
 * Realistic seed data for BlackClubElite
 * All monetary amounts strictly in Guaraníes (Gs.)
 * Operating schedules and real club data
 */

export const INITIAL_COURTS = [
  {
    id: 'court-1',
    name: 'Pista Central Panorámica',
    code: 'PISTA 01 · WPT',
    specs: 'Vidrio Panorámico 12mm WPT · Césped Monofilamento Negro Texturizado · LED 1000 Lux',
    surface: 'Césped Texturizado Negro Pro',
    enclosure: 'Cristal Panorámico Continuo WPT',
    lighting: 'LED Competition 1000 Lux Anti-Deslumbramiento',
    rate: 180000,
    primeRate: 200000,
    indoor: false,
    panoramic: true,
    status: 'operational',
    image: '/images/court_panoramic.jpg'
  },
  {
    id: 'court-2',
    name: 'Pista Indoor 02',
    code: 'PISTA 02 · CLIMA',
    specs: 'Climatizada 21°C · Cerramiento Acústico · Iluminación LED Directa Difusa',
    surface: 'Césped Monofilamento Tournament',
    enclosure: 'Vidrio Laminado Acústico 10+10mm',
    lighting: 'Paneles LED Difusos Especiales',
    rate: 160000,
    primeRate: 180000,
    indoor: true,
    panoramic: false,
    status: 'operational',
    image: '/images/court_panoramic.jpg'
  },
  {
    id: 'court-3',
    name: 'Pista Pro 03',
    code: 'PISTA 03 · OUTDOOR',
    specs: 'Outdoor Techada · Aluminio Aeroespacial · Césped Tournament Blue',
    surface: 'Césped Fibrilado Azul Oficial',
    enclosure: 'Estructura Aluminio Reforzada',
    lighting: 'Torretas LED Exteriores 800 Lux',
    rate: 140000,
    primeRate: 160000,
    indoor: false,
    panoramic: false,
    status: 'operational',
    image: '/images/court_panoramic.jpg'
  }
];

export const TIME_SLOTS = [
  '08:00 - 09:30',
  '09:30 - 11:00',
  '11:00 - 12:30',
  '12:30 - 14:00',
  '14:00 - 15:30',
  '15:30 - 17:00',
  '17:00 - 18:30',
  '18:30 - 20:00',
  '20:00 - 21:30',
  '21:30 - 23:00',
  '23:00 - 00:30'
];

export const INITIAL_COACHES = [
  {
    id: 'coach-1',
    name: 'Alejandro Benítez',
    role: 'Director Técnico de Academia',
    credentials: 'Ex-Jugador WPT · Entrenador Nivel 3 FIP',
    bio: 'Especialista en biomecánica cinemática del golpe, transiciones ofensivas y táctica en situaciones bajo presión.',
    rate: 240000,
    defaultCourtId: 'court-1',
    avatar: '/images/blackteam.jpg',
    enabledSlots: ['08:00 - 09:30', '15:30 - 17:00', '20:00 - 21:30']
  },
  {
    id: 'coach-2',
    name: 'Santiago Morales',
    role: 'Head Coach de Competición',
    credentials: 'Certificado APA · Especialista en Rendimiento',
    bio: 'Formador de parejas líderes en primera y segunda categoría. Metodología de lectura de pared y aceleración de bandeja.',
    rate: 190000,
    defaultCourtId: 'court-2',
    avatar: '/images/blackteam.jpg',
    enabledSlots: ['09:30 - 11:00', '17:00 - 18:30', '21:30 - 23:00']
  },
  {
    id: 'coach-3',
    name: 'Matías Duarte',
    role: 'Instructor Formativo & Clínicas',
    credentials: 'Técnico Nacional de Pádel',
    bio: 'Enfocado en consolidación técnica para categorías intermedias, consistencia en fondo de pista y juego aéreo.',
    rate: 150000,
    defaultCourtId: 'court-3',
    avatar: '/images/blackteam.jpg',
    enabledSlots: ['11:00 - 12:30', '18:30 - 20:00']
  }
];

export const INITIAL_MENU_ITEMS = [
  // Gastronomía Tercer Tiempo
  {
    id: 'menu-1',
    name: 'Tabla de Cecina Ibérica & Manchego Reserva',
    category: 'Gastronomía Tercer Tiempo',
    description: 'Finas láminas de cecina curada, queso manchego 12 meses, frutos secos tostados y pan focaccia al romero.',
    price: 115000,
    available: true,
    tag: 'Selección Signature'
  },
  {
    id: 'menu-2',
    name: 'Carpaccio de Lomo con Trufa Negra & Alcaparras',
    category: 'Gastronomía Tercer Tiempo',
    description: 'Lomo vacuno corte fino, emulsión de trufa negra, lascas de parmesano reggiano y rúcula selvática.',
    price: 85000,
    available: true,
    tag: 'Destacado'
  },
  {
    id: 'menu-3',
    name: 'Burrata Cremosa con Pesto de Pistacho',
    category: 'Gastronomía Tercer Tiempo',
    description: 'Burrata fresca artesanal, tomates confitados en oliva extra virgen y reducción balsámica de Módena.',
    price: 78000,
    available: true,
    tag: 'Chef Choice'
  },
  {
    id: 'menu-4',
    name: 'Tartare de Salmón & Palta Hass',
    category: 'Gastronomía Tercer Tiempo',
    description: 'Salmón del Pacífico cortado a cuchillo, palta hass curada, sésamo negro y emulsión de ponzu cítrico.',
    price: 82000,
    available: true,
    tag: 'Saludable Pro'
  },

  // Burgers & Cocina Nocturna
  {
    id: 'menu-5',
    name: 'Black Angus Truffle Burger',
    category: 'Burgers y Cocina Nocturna',
    description: '200g de carne Black Angus madurada, queso raclette fundido, cebollas caramelizadas y alioli de trufa en pan brioche.',
    price: 68000,
    available: true,
    tag: 'Favorito del Club'
  },
  {
    id: 'menu-6',
    name: 'Wagyu Sliders x3',
    category: 'Burgers y Cocina Nocturna',
    description: 'Trío de mini burgers de Wagyu con queso cheddar inglés envejecido, pepinillos encurtidos caseros y salsa de la casa.',
    price: 75000,
    available: true,
    tag: 'Para Compartir'
  },
  {
    id: 'menu-7',
    name: 'Club Sandwich de Pollo Pastoril',
    category: 'Burgers y Cocina Nocturna',
    description: 'Pechuga a la plancha con hierbas finas, panceta ahumada crujiente, tomate reliquia, huevo poche y aderezo dijon.',
    price: 55000,
    available: true,
    tag: 'Clásico'
  },
  {
    id: 'menu-8',
    name: 'Wrap Mediterráneo de Salmón Ahumado',
    category: 'Burgers y Cocina Nocturna',
    description: 'Masa de espinaca orgánica, salmón ahumado en madera de roble, queso philadelphia con eneldo y brotes verdes.',
    price: 52000,
    available: true,
    tag: 'Post-Partido'
  },

  // Cervecería y Coctelería
  {
    id: 'menu-9',
    name: 'Chopp Stella Artois Tirada 500ml',
    category: 'Cervecería y Coctelería',
    description: 'Cerveza tirada fría en copa ceremonial a temperatura exacta de servicio 3°C.',
    price: 28000,
    available: true,
    tag: 'Lager Premium'
  },
  {
    id: 'menu-10',
    name: 'Cerveza Patagonia 24.7 Session IPA',
    category: 'Cervecería y Coctelería',
    description: 'Cerveza artesanal con aroma a frutos cítricos y toque de sauco, equilibrada y refrescante.',
    price: 32000,
    available: true,
    tag: 'Craft'
  },
  {
    id: 'menu-11',
    name: 'Gin Tonic Black Reserve Hendrick\'s',
    category: 'Cervecería y Coctelería',
    description: 'Gin escocés Hendrick\'s con agua tónica Fever-Tree Mediterranean, pepino inglés y pétalos de rosa.',
    price: 58000,
    available: true,
    tag: 'Coctel de Autor'
  },
  {
    id: 'menu-12',
    name: 'Negroni Clásico Carpano Antica Formula',
    category: 'Cervecería y Coctelería',
    description: 'Gin Tanqueray London Dry, Campari bitter y Carpano Antica Formula con piel de naranja flambeadas.',
    price: 62000,
    available: true,
    tag: 'Reserva'
  },
  {
    id: 'menu-13',
    name: 'Cerveza Heineken 0.0% Alcohol',
    category: 'Cervecería y Coctelería',
    description: 'Cerveza rubia desalcoholizada de malta pura, ideal para recuperación deportiva inmediata.',
    price: 24000,
    available: true,
    tag: '0.0% Alcohol'
  },

  // Hidratación Deportiva y Pro-Shop
  {
    id: 'menu-14',
    name: 'Isotónica Gatorade Cool Blue 750ml',
    category: 'Hidratación Deportiva y Pro-Shop',
    description: 'Bebida deportiva con reposición rápida de electrolitos esenciales para alto rendimiento.',
    price: 18000,
    available: true,
    tag: 'Recuperación'
  },
  {
    id: 'menu-15',
    name: 'Agua Mineral San Pellegrino 500ml',
    category: 'Hidratación Deportiva y Pro-Shop',
    description: 'Agua mineral con gas natural de manantiales termales italianos.',
    price: 22000,
    available: true,
    tag: 'Importada'
  },
  {
    id: 'menu-16',
    name: 'Agua Alcalina Ionizada Black 750ml',
    category: 'Hidratación Deportiva y Pro-Shop',
    description: 'Agua con pH 9.5 optimizado con minerales puros para combatir la acidez metabólica post-esfuerzo.',
    price: 15000,
    available: true,
    tag: 'pH 9.5'
  },
  {
    id: 'menu-17',
    name: 'Tubo Pelotas Bullpadel Next Pro x3',
    category: 'Hidratación Deportiva y Pro-Shop',
    description: 'Tubo presurizado oficial de máxima durabilidad y velocidad de rebote para pistas rápidas.',
    price: 70000,
    available: true,
    tag: 'Pelota Oficial'
  },
  {
    id: 'menu-18',
    name: 'Pack Overgrip Wilson Pro Comfort x3',
    category: 'Hidratación Deportiva y Pro-Shop',
    description: 'Overgrip de poliuretano ultrafino con adherencia superior y máxima absorción de sudor.',
    price: 35000,
    available: true,
    tag: 'Accesorio Pro'
  },
  {
    id: 'menu-19',
    name: 'Alquiler Pala Bullpadel Vertex / Hack 03',
    category: 'Hidratación Deportiva y Pro-Shop',
    description: 'Pala de competición en fibra de carbono 12K con protector metálico integrado para 90 minutos de juego.',
    price: 30000,
    available: true,
    tag: 'Equipamiento'
  }
];

export const INITIAL_GYM_PLANS = [
  {
    id: 'gym-1',
    name: 'Pase Diario Pro',
    price: 50000,
    period: 'Por jornada única',
    description: 'Acceso total por 1 día al sector de musculación, área de entrenamiento funcional, vestuarios y sauna seco.',
    features: [
      'Acceso completo a maquinaria de biostrength',
      'Zona de cardio y pesas libres hasta 40kg',
      'Vestuarios ejecutivos con toalla y amenidades de cortesía',
      'Acceso al sauna seco post-entrenamiento'
    ],
    badge: 'Acceso Puntual'
  },
  {
    id: 'gym-2',
    name: 'Membresía BlackGym Mensual',
    price: 380000,
    period: 'Facturación mensual',
    description: 'Pase ilimitado a las instalaciones de BlackGym en todos sus horarios operativos semanales y de sábado.',
    features: [
      'Horarios completos: 7:00 a 12:00 y 14:00 a 21:00 (Sáb 8:00 a 13:00)',
      'Evaluación biométrica mensual InBody 270',
      'Locker privado de uso diario y servicio de toallas',
      'Rutina personalizada diseñada por entrenadores de BlackTeam',
      'Acceso al Sauna Seco y Recovery Station'
    ],
    badge: 'Membresía Oficial',
    featured: true
  },
  {
    id: 'gym-3',
    name: 'Membresía Integral BlackClub Elite',
    price: 720000,
    period: 'Facturación mensual',
    description: 'La experiencia completa del club que fusiona BlackGym ilimitado, privilegios en pádel y gastronomía.',
    features: [
      'BlackGym acceso irrestricto todos los días hábiles y fines de semana',
      '2 reservas de pista mensuales bonificadas en horario prime',
      'Reserva prioritaria de canchas con 7 días de antelación',
      '15% de bonificación permanente en consumos de BlackBar',
      'Invitaciones mensuales para invitados sin costo adicional',
      'Valet parking de cortesía'
    ],
    badge: 'Distinción Elite'
  }
];

export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourn-1',
    name: 'Torneo Apertura BlackClub Elite 2026',
    code: 'BCE-TORNEO-01',
    dates: '24 al 26 de Octubre 2026',
    categoryList: ['2da Categoría', '3ra Categoría', '4ta Categoría', '5ta Categoría', '6ta Categoría', 'Mixto Pro'],
    fee: 280000,
    slots: 32,
    registeredCount: 26,
    prizePool: '15.000.000 Gs.',
    welcomeKit: 'Welcome Kit Bullpadel + Remera Técnica Oficial BlackClub',
    description: 'Circuito de apertura oficial en las 3 pistas del complejo. Fase de grupos y cuadro principal con arbitraje oficial FIP.',
    status: 'Inscripciones Abiertas',
    sponsor: 'Bullpadel · Heineken 0.0 · Itaú Personal Bank'
  },
  {
    id: 'tourn-2',
    name: 'Circuito Nocturno Inter-Empresas',
    code: 'BCE-CORP-02',
    dates: '12 al 14 de Noviembre 2026',
    categoryList: ['Corporativo Categoría A', 'Corporativo Categoría B'],
    fee: 350000,
    slots: 16,
    registeredCount: 12,
    prizePool: 'Trofeos de Autor + Noche Gourmet en BlackBar',
    welcomeKit: 'Catering Tercer Tiempo & Degustación de Coctelería de Autor',
    description: 'Campeonato empresarial vespertino con networking exclusivo y servicio gastronómico de alta gama en el salón.',
    status: 'Inscripciones Abiertas',
    sponsor: 'BlackBar & Executive Partners'
  }
];

// Helper to get today's date formatted as YYYY-MM-DD
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const TODAY = getTodayDateString();

export const INITIAL_BOOKINGS = [
  {
    id: 'book-101',
    code: 'BC-9842',
    courtId: 'court-1',
    date: TODAY,
    timeSlot: '18:30 - 20:00',
    clientName: 'Gonzalo Insfrán',
    clientPhone: '+595 981 445 210',
    category: 'Abono Fijo Semanal',
    status: 'En Pista',
    courtAmount: 180000,
    depositPaid: 100000,
    barTableRequested: true,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-101',
    createdAt: '18:25'
  },
  {
    id: 'book-102',
    code: 'BC-9843',
    courtId: 'court-2',
    date: TODAY,
    timeSlot: '18:30 - 20:00',
    clientName: 'Rodrigo Villalba',
    clientPhone: '+595 971 889 012',
    category: 'Reserva Estándar',
    status: 'En Pista',
    courtAmount: 160000,
    depositPaid: 80000,
    barTableRequested: false,
    rentedRackets: 2,
    ballTubes: 0,
    linkedTabId: 'tab-102',
    createdAt: '18:28'
  },
  {
    id: 'book-103',
    code: 'BC-9839',
    courtId: 'court-3',
    date: TODAY,
    timeSlot: '17:00 - 18:30',
    clientName: 'Sebastián Duarte',
    clientPhone: '+595 992 334 115',
    category: 'Reserva Estándar',
    status: 'Finalizada',
    courtAmount: 140000,
    depositPaid: 70000,
    barTableRequested: false,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-103',
    createdAt: '16:55'
  },
  {
    id: 'book-104',
    code: 'BC-9845',
    courtId: 'court-1',
    date: TODAY,
    timeSlot: '20:00 - 21:30',
    clientName: 'Matías Peña',
    clientPhone: '+595 983 551 772',
    category: 'Reserva Estándar',
    status: 'Confirmada',
    courtAmount: 180000,
    depositPaid: 100000,
    barTableRequested: true,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-104',
    createdAt: '17:40'
  },
  {
    id: 'book-105',
    code: 'BC-9846',
    courtId: 'court-2',
    date: TODAY,
    timeSlot: '20:00 - 21:30',
    clientName: 'Alejandro Benítez (Coach BlackTeam)',
    clientPhone: '+595 981 112 334',
    category: 'Clase BlackTeam',
    status: 'Confirmada',
    courtAmount: 240000,
    depositPaid: 120000,
    barTableRequested: false,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-105',
    createdAt: '16:10'
  },
  {
    id: 'book-106',
    code: 'BC-9847',
    courtId: 'court-3',
    date: TODAY,
    timeSlot: '20:00 - 21:30',
    clientName: 'Carlos Argaña',
    clientPhone: '+595 972 660 449',
    category: 'Reserva Estándar',
    status: 'Seña Pendiente',
    courtAmount: 140000,
    depositPaid: 0,
    barTableRequested: false,
    rentedRackets: 0,
    ballTubes: 0,
    linkedTabId: 'tab-106',
    createdAt: '18:15'
  },
  {
    id: 'book-107',
    code: 'BC-9848',
    courtId: 'court-1',
    date: TODAY,
    timeSlot: '21:30 - 23:00',
    clientName: 'Federico Zuccolillo',
    clientPhone: '+595 981 990 001',
    category: 'Abono Fijo Semanal',
    status: 'Confirmada',
    courtAmount: 180000,
    depositPaid: 100000,
    barTableRequested: true,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-107',
    createdAt: '14:20'
  },
  {
    id: 'book-108',
    code: 'BC-9849',
    courtId: 'court-2',
    date: TODAY,
    timeSlot: '21:30 - 23:00',
    clientName: 'Andrea Benítez & Binomio',
    clientPhone: '+595 994 220 889',
    category: 'Reserva Estándar',
    status: 'Confirmada',
    courtAmount: 160000,
    depositPaid: 80000,
    barTableRequested: false,
    rentedRackets: 2,
    ballTubes: 1,
    linkedTabId: 'tab-108',
    createdAt: '15:45'
  },
  {
    id: 'book-109',
    code: 'BC-9835',
    courtId: 'court-3',
    date: TODAY,
    timeSlot: '11:00 - 12:30',
    clientName: 'Clínica de Perfeccionamiento Matutina',
    clientPhone: '+595 981 777 444',
    category: 'Clase BlackTeam',
    status: 'Finalizada',
    courtAmount: 150000,
    depositPaid: 150000,
    barTableRequested: false,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-109',
    createdAt: '10:50'
  }
];

export const INITIAL_TABS = [
  {
    id: 'tab-101',
    linkedBookingId: 'book-101',
    courtId: 'court-1',
    courtName: 'Pista Central Panorámica',
    clientName: 'Gonzalo Insfrán',
    courtAmount: 180000,
    depositPaid: 100000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-9', name: 'Chopp Stella Artois Tirada 500ml', price: 28000, qty: 2 },
      { id: 'menu-5', name: 'Black Angus Truffle Burger', price: 68000, qty: 1 }
    ],
    status: 'open',
    paymentMethod: null,
    barTableRequested: true,
    openedAt: '18:25'
  },
  {
    id: 'tab-102',
    linkedBookingId: 'book-102',
    courtId: 'court-2',
    courtName: 'Pista Indoor 02',
    clientName: 'Rodrigo Villalba',
    courtAmount: 160000,
    depositPaid: 80000,
    racketCount: 2,
    racketUnitFee: 30000,
    ballTubeCount: 0,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-14', name: 'Isotónica Gatorade Cool Blue 750ml', price: 18000, qty: 2 },
      { id: 'menu-16', name: 'Agua Alcalina Ionizada Black 750ml', price: 15000, qty: 2 }
    ],
    status: 'open',
    paymentMethod: null,
    barTableRequested: false,
    openedAt: '18:28'
  },
  {
    id: 'tab-103',
    linkedBookingId: 'book-103',
    courtId: 'court-3',
    courtName: 'Pista Pro 03',
    clientName: 'Sebastián Duarte',
    courtAmount: 140000,
    depositPaid: 70000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-10', name: 'Cerveza Patagonia 24.7 Session IPA', price: 32000, qty: 2 }
    ],
    status: 'settled',
    paymentMethod: 'Tarjeta',
    settledAt: '18:35',
    barTableRequested: false,
    openedAt: '16:55'
  },
  {
    id: 'tab-104',
    linkedBookingId: 'book-104',
    courtId: 'court-1',
    courtName: 'Pista Central Panorámica',
    clientName: 'Matías Peña',
    courtAmount: 180000,
    depositPaid: 100000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [],
    status: 'open',
    paymentMethod: null,
    barTableRequested: true,
    openedAt: '17:40'
  },
  {
    id: 'tab-105',
    linkedBookingId: 'book-105',
    courtId: 'court-2',
    courtName: 'Pista Indoor 02',
    clientName: 'Alejandro Benítez (Coach BlackTeam)',
    courtAmount: 240000,
    depositPaid: 120000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [],
    status: 'open',
    paymentMethod: null,
    barTableRequested: false,
    openedAt: '16:10'
  },
  {
    id: 'tab-106',
    linkedBookingId: 'book-106',
    courtId: 'court-3',
    courtName: 'Pista Pro 03',
    clientName: 'Carlos Argaña',
    courtAmount: 140000,
    depositPaid: 0,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 0,
    ballTubeUnitFee: 70000,
    items: [],
    status: 'open',
    paymentMethod: null,
    barTableRequested: false,
    openedAt: '18:15'
  },
  {
    id: 'tab-107',
    linkedBookingId: 'book-107',
    courtId: 'court-1',
    courtName: 'Pista Central Panorámica',
    clientName: 'Federico Zuccolillo',
    courtAmount: 180000,
    depositPaid: 100000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [],
    status: 'open',
    paymentMethod: null,
    barTableRequested: true,
    openedAt: '14:20'
  },
  {
    id: 'tab-108',
    linkedBookingId: 'book-108',
    courtId: 'court-2',
    courtName: 'Pista Indoor 02',
    clientName: 'Andrea Benítez & Binomio',
    courtAmount: 160000,
    depositPaid: 80000,
    racketCount: 2,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [],
    status: 'open',
    paymentMethod: null,
    barTableRequested: false,
    openedAt: '15:45'
  },
  {
    id: 'tab-109',
    linkedBookingId: 'book-109',
    courtId: 'court-3',
    courtName: 'Pista Pro 03',
    clientName: 'Clínica de Perfeccionamiento Matutina',
    courtAmount: 150000,
    depositPaid: 150000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [],
    status: 'settled',
    paymentMethod: 'Transferencia / QR',
    settledAt: '12:35',
    barTableRequested: false,
    openedAt: '10:50'
  }
];

export const INITIAL_PLAYERS = [
  {
    id: 'plr-1',
    name: 'Gonzalo Insfrán',
    phone: '+595 981 445 210',
    category: '2da Categoría',
    isFixedPassHolder: true,
    fixedPassDay: 'Jueves 18:30 (Pista Central)',
    totalBookings: 24,
    totalSpent: 4860000,
    status: 'Socio Activo Elite',
    lastVisit: 'Hoy, 18:30'
  },
  {
    id: 'plr-2',
    name: 'Federico Zuccolillo',
    phone: '+595 981 990 001',
    category: '1ra Categoría',
    isFixedPassHolder: true,
    fixedPassDay: 'Jueves 21:30 (Pista Central)',
    totalBookings: 32,
    totalSpent: 6240000,
    status: 'Socio Activo Elite',
    lastVisit: 'Hoy, 21:30'
  },
  {
    id: 'plr-3',
    name: 'Rodrigo Villalba',
    phone: '+595 971 889 012',
    category: '3ra Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 11,
    totalSpent: 2010000,
    status: 'Jugador Frecuente',
    lastVisit: 'Hoy, 18:30'
  },
  {
    id: 'plr-4',
    name: 'Matías Peña',
    phone: '+595 983 551 772',
    category: '4ta Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 8,
    totalSpent: 1620000,
    status: 'Jugador Frecuente',
    lastVisit: 'Hoy, 20:00'
  },
  {
    id: 'plr-5',
    name: 'Carlos Argaña',
    phone: '+595 972 660 449',
    category: '5ta Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 3,
    totalSpent: 420000,
    status: 'Nuevo Registro',
    lastVisit: 'Hoy, 20:00'
  },
  {
    id: 'plr-6',
    name: 'Andrea Benítez',
    phone: '+595 994 220 889',
    category: '3ra Damas',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 14,
    totalSpent: 2680000,
    status: 'Jugadora Frecuente',
    lastVisit: 'Hoy, 21:30'
  },
  {
    id: 'plr-7',
    name: 'Sebastián Duarte',
    phone: '+595 992 334 115',
    category: '4ta Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 19,
    totalSpent: 3510000,
    status: 'Jugador Frecuente',
    lastVisit: 'Hoy, 17:00'
  }
];
