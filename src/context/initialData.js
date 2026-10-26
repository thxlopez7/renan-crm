/**
 * Seed data for Black Club Elite (@blackclubparaguay)
 * Quiet Athletic Luxury · Authentic Paraguayan Padel & Hospitality
 * Monochromatic Branding with Athletic Crimson Accents
 * Currency strictly in Guaraníes (Gs.)
 * Local Paraguayan Terminology: "Cancha" & 1-Hour Time Slots (e.g. 18:00 a 19:00)
 */

export const INITIAL_COURTS = [
  {
    id: 'court-1',
    name: 'Cancha Central Panorámica',
    code: 'CANCHA 01 · WPT',
    specs: 'Vidrio Panorámico 12mm WPT · Césped Monofilamento Negro Texturizado · LED 1000 Lux',
    surface: 'Césped Texturizado Negro Pro',
    enclosure: 'Cristal Panorámico Continuo WPT',
    lighting: 'LED Competition 1000 Lux',
    rate: 160000,
    primeRate: 180000,
    indoor: false,
    panoramic: true,
    status: 'operational',
    image: '/images/court_panoramic.jpg'
  },
  {
    id: 'court-2',
    name: 'Cancha 2 (Indoor Climatizada)',
    code: 'CANCHA 02 · CLIMA',
    specs: 'Climatizada 21°C · Cerramiento Acústico · Iluminación LED Directa Difusa',
    surface: 'Césped Monofilamento Tournament',
    enclosure: 'Vidrio Laminado Acústico 10+10mm',
    lighting: 'Paneles LED Difusos Especiales',
    rate: 140000,
    primeRate: 160000,
    indoor: true,
    panoramic: false,
    status: 'operational',
    image: '/images/court_panoramic.jpg'
  },
  {
    id: 'court-3',
    name: 'Cancha 3 (Outdoor Techada)',
    code: 'CANCHA 03 · OUTDOOR',
    specs: 'Outdoor Techada · Aluminio Aeroespacial · Césped Tournament Blue',
    surface: 'Césped Fibrilado Azul Oficial',
    enclosure: 'Estructura Aluminio Reforzada',
    lighting: 'Torretas LED Exteriores 800 Lux',
    rate: 120000,
    primeRate: 140000,
    indoor: false,
    panoramic: false,
    status: 'operational',
    image: '/images/court_panoramic.jpg'
  }
];

// Horarios de 1 hora entre hora (estándar de clubes de pádel en Paraguay)
export const TIME_SLOTS = [
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
  '22:00 - 23:00',
  '23:00 - 00:00'
];

export const INITIAL_COACHES = [
  {
    id: 'coach-1',
    name: 'Alejandro Benítez',
    role: 'Director Técnico de Academia',
    credentials: 'Ex-Jugador WPT · Entrenador Nivel 3 FIP',
    bio: 'Biomecánica cinemática del golpe, transiciones ofensivas y táctica en situaciones bajo presión.',
    rate: 200000,
    defaultCourtId: 'court-1',
    avatar: '/images/blackteam.jpg',
    enabledSlots: ['08:00 - 09:00', '15:00 - 16:00', '19:00 - 20:00']
  },
  {
    id: 'coach-2',
    name: 'Santiago Morales',
    role: 'Head Coach de Competición',
    credentials: 'Certificado APA · Especialista en Rendimiento',
    bio: 'Formador de parejas líderes en primera y segunda categoría. Lectura de pared y aceleración de bandeja.',
    rate: 160000,
    defaultCourtId: 'court-2',
    avatar: '/images/blackteam.jpg',
    enabledSlots: ['09:00 - 10:00', '17:00 - 18:00', '21:00 - 22:00']
  },
  {
    id: 'coach-3',
    name: 'Matías Duarte',
    role: 'Instructor Formativo & Clínicas',
    credentials: 'Técnico Nacional de Pádel',
    bio: 'Consolidación técnica para categorías intermedias, consistencia en fondo de cancha y juego aéreo.',
    rate: 130000,
    defaultCourtId: 'court-3',
    avatar: '/images/blackteam.jpg',
    enabledSlots: ['11:00 - 12:00', '18:00 - 19:00']
  }
];

// Authentic Paraguayan Padel Club Menu & Merchandising (@blackclubparaguay)
export const INITIAL_MENU_ITEMS = [
  // Comida & Picadas (Tercer Tiempo)
  {
    id: 'menu-1',
    name: 'Picada Black Club',
    category: 'Comida & Picadas',
    description: 'Tiras de lomito vacuno a la plancha, chorizo parrillero artesanal, mandioca frita y dip criollo.',
    price: 85000,
    stock: 25,
    available: true,
    tag: 'Clásico Tercer Tiempo'
  },
  {
    id: 'menu-2',
    name: 'Black Angus Burger',
    category: 'Comida & Picadas',
    description: 'Medallón 180g de novillo seleccionado, queso cheddar fundido, panceta crocante y papas rústicas.',
    price: 62000,
    stock: 30,
    available: true,
    tag: 'Favorito'
  },
  {
    id: 'menu-3',
    name: 'Sándwich de Lomito Completo',
    category: 'Comida & Picadas',
    description: 'Bife de lomo tierno, jamón cocido, queso muzzarella, huevo frito, lechuga y tomate en pan ciabatta.',
    price: 52000,
    stock: 20,
    available: true,
    tag: 'Post-Partido'
  },
  {
    id: 'menu-4',
    name: 'Papas Rústicas con Cheddar & Bacon',
    category: 'Comida & Picadas',
    description: 'Papas con piel crujientes bañadas en salsa cheddar casera y lluvia de panceta crocante.',
    price: 38000,
    stock: 35,
    available: true,
    tag: 'Para Compartir'
  },
  // Cervezas & Chopp (Tercer Tiempo & Noches de Copa)
  {
    id: 'menu-5',
    name: 'Promo 2x1 Chopp (Noches de Copa)',
    category: 'Cervezas & Chopp',
    description: 'Dos manijas de chopp artesanal helado tirado en el momento (Happy Hour Pádel).',
    price: 28000,
    stock: 60,
    available: true,
    tag: 'Promo Insignia'
  },
  {
    id: 'menu-6',
    name: 'Balde x6 Stella Artois 330ml',
    category: 'Cervezas & Chopp',
    description: 'Balde con hielo picado y 6 botellas de Stella Artois bien frías para la mesa del equipo.',
    price: 95000,
    stock: 18,
    available: true,
    tag: 'Balde Tercer Tiempo'
  },
  {
    id: 'menu-7',
    name: 'Balde x6 Patagonia 24.7 IPA',
    category: 'Cervezas & Chopp',
    description: 'Balde con hielo y 6 botellitas Patagonia Session IPA con notas cítricas y lúpulo fresco.',
    price: 110000,
    stock: 15,
    available: true,
    tag: 'Cerveza Craft'
  },
  {
    id: 'menu-8',
    name: 'Chopp Individual 500ml',
    category: 'Cervezas & Chopp',
    description: 'Chopp rubio servido a -2°C con espuma densa en manija congelada.',
    price: 18000,
    stock: 80,
    available: true,
    tag: 'Barra'
  },
  {
    id: 'menu-9',
    name: 'Corona Extra 355ml c/ Lima',
    category: 'Cervezas & Chopp',
    description: 'Botella servida con gajo de lima fresca en el cuello.',
    price: 22000,
    stock: 45,
    available: true,
    tag: 'Barra'
  },
  // Hidratación & Bebidas sin alcohol
  {
    id: 'menu-10',
    name: 'Gatorade Cool Blue 750ml',
    category: 'Hidratación & Bebidas',
    description: 'Isotónico con electrolitos para reposición inmediata en cancha.',
    price: 16000,
    stock: 50,
    available: true,
    tag: 'En Cancha'
  },
  {
    id: 'menu-11',
    name: 'Agua Mineral San Roque 500ml',
    category: 'Hidratación & Bebidas',
    description: 'Agua mineral natural sin gas o con gas, bien helada.',
    price: 10000,
    stock: 120,
    available: true,
    tag: 'Básico'
  },
  {
    id: 'menu-12',
    name: 'Gaseosas Coca-Cola / Zero 500ml',
    category: 'Hidratación & Bebidas',
    description: 'Botellita individual clásica de 500ml fría.',
    price: 12000,
    stock: 70,
    available: true,
    tag: 'Refresco'
  },
  {
    id: 'menu-13',
    name: 'Red Bull Energy Drink 250ml',
    category: 'Hidratación & Bebidas',
    description: 'Lata clásica energizante para antes del partido.',
    price: 20000,
    stock: 40,
    available: true,
    tag: 'Pre-Partido'
  },
  // Pro-Shop & Merch Oficial Black Club
  {
    id: 'menu-14',
    name: 'Tubo Bullpadel Next Pro (x3)',
    category: 'Pro-Shop & Merch',
    description: 'Pelotas oficiales presurizadas de rebote vivo y máxima durabilidad para partidos oficiales.',
    price: 70000,
    stock: 30,
    available: true,
    tag: 'Pro-Shop'
  },
  {
    id: 'menu-15',
    name: 'Remera Técnica Oficial Black Club',
    category: 'Pro-Shop & Merch',
    description: 'Remera dry-fit negra con logo monocromo de alta densidad y respiración micro-perforada.',
    price: 160000,
    stock: 15,
    available: true,
    tag: 'Merchandising'
  },
  {
    id: 'menu-16',
    name: 'Quepi Oficial Black Club (Snapback)',
    category: 'Pro-Shop & Merch',
    description: 'Gorra deportiva estructurada negra con bordado frontal en relieve y visera semi-curva.',
    price: 120000,
    stock: 18,
    available: true,
    tag: 'Merchandising'
  },
  {
    id: 'menu-17',
    name: 'Overgrip Bullpadel Pro Perforado',
    category: 'Pro-Shop & Merch',
    description: 'Grip micro-perforado de máximo agarre y absorción para clima caluroso.',
    price: 25000,
    stock: 50,
    available: true,
    tag: 'Pro-Shop'
  },
  {
    id: 'menu-18',
    name: 'Alquiler de Paleta de Test (90 min)',
    category: 'Pro-Shop & Merch',
    description: 'Paleta gama alta de carbono para uso durante el turno de juego.',
    price: 30000,
    stock: 8,
    available: true,
    tag: 'Alquiler Cancha'
  }
];

// BlackGym & Biostrength Memberships with Official Bio Hours
// Horario: Lun a Vie: 07:00 a 12:00 y 14:00 a 21:00 | Sáb: 08:00 a 13:00
export const INITIAL_GYM_PLANS = [
  {
    id: 'plan-black-pass',
    name: 'Black Pass Completo',
    period: 'Mensual Libre',
    price: 450000,
    badge: 'MÁS ELEGIDO',
    featured: true,
    description: 'Acceso total a la sala de fuerza, máquinas Biostrength y vestuarios ejecutivos.',
    features: [
      'Acceso en ambos turnos (07:00 a 12:00 y 14:00 a 21:00)',
      'Sábados de 08:00 a 13:00',
      'Evaluación biomecánica y rutina digital personalizada',
      'Lockers individuales y toallas de entrenamiento',
      '1 turno de cancha mensual bonificado en horario prime'
    ]
  },
  {
    id: 'plan-morning',
    name: 'Turno Mañana Bio',
    period: 'Mensual Matutino',
    price: 320000,
    badge: 'MATUTINO',
    featured: false,
    description: 'Enfoque matinal de acondicionamiento físico de alto rendimiento.',
    features: [
      'Lunes a Viernes de 07:00 a 12:00 hs',
      'Sábados de 08:00 a 13:00 hs',
      'Seguimiento de progresión física mensual',
      'Duchas y vestuarios premium'
    ]
  },
  {
    id: 'plan-padel-fit',
    name: 'Pádel Functional Training',
    period: 'Mensual Específico',
    price: 380000,
    badge: 'ESPECÍFICO PÁDEL',
    featured: false,
    description: 'Preparación física adaptada a los movimientos explosivos y rotacionales del pádel.',
    features: [
      '3 sesiones semanales con preparador físico especializado',
      'Prevención de lesiones de manguito rotador y codo',
      'Desarrollo de potencia de salto y desplazamiento lateral',
      'Acceso libre a zona de descarga y stretching'
    ]
  }
];

// Real Official Tournaments: Circuito Black Pádel · 2da Edición
export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourn-1',
    title: 'Circuito Black Pádel · 2da Edición',
    type: 'Circuito Oficial',
    isFlagship: true,
    dates: '24 - 27 de Noviembre 2026',
    prizePool: 20000000,
    entryFee: 300000,
    categories: ['2da', '3ra', '4ta', '5ta', '6ta'],
    slots: 64,
    registeredCount: 48,
    status: 'Inscripciones Abiertas',
    description: 'Segunda edición del torneo insignia de Black Club Elite. Cuadro oficial con fase de grupos y llaves de eliminación directa.'
  },
  {
    id: 'tourn-2',
    title: 'Torneo Nocturno de Principiantes',
    type: 'Abierto Social',
    isFlagship: false,
    dates: '12 - 13 de Diciembre 2026',
    prizePool: 5000000,
    entryFee: 200000,
    categories: ['6ta', '7ma', 'Iniciación'],
    slots: 32,
    registeredCount: 22,
    status: 'Inscripciones Abiertas',
    description: 'Competencia recreativa para jugadores en formación con tercer tiempo integrado y asado de camaradería.'
  },
  {
    id: 'tourn-3',
    title: 'Gran Sorteo Palas Bullpadel & Merch',
    type: 'Sorteo & Evento',
    isFlagship: false,
    dates: 'Sorteo 20 de Diciembre',
    prizePool: 12000000,
    entryFee: 50000,
    categories: ['General', 'Socios BlackClub'],
    slots: 200,
    registeredCount: 135,
    status: 'Tickets Habilitados',
    description: 'Sorteo de fin de año: 3 Palas Bullpadel Hack 03 Pro, 10 tubos de pelotas y kits exclusivos de indumentaria.'
  }
];

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
    timeSlot: '18:00 - 19:00',
    clientName: 'Gonzalo Insfrán',
    clientPhone: '+595 981 445 210',
    category: 'Turno Fijo Semanal',
    status: 'En Cancha',
    courtAmount: 160000,
    depositPaid: 100000,
    barTableRequested: true,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-101',
    createdAt: '17:55'
  },
  {
    id: 'book-102',
    code: 'BC-9843',
    courtId: 'court-2',
    date: TODAY,
    timeSlot: '18:00 - 19:00',
    clientName: 'Rodrigo Villalba',
    clientPhone: '+595 971 889 012',
    category: 'Reserva Estándar',
    status: 'En Cancha',
    courtAmount: 140000,
    depositPaid: 70000,
    barTableRequested: false,
    rentedRackets: 2,
    ballTubes: 0,
    linkedTabId: 'tab-102',
    createdAt: '17:58'
  },
  {
    id: 'book-103',
    code: 'BC-9839',
    courtId: 'court-3',
    date: TODAY,
    timeSlot: '17:00 - 18:00',
    clientName: 'Sebastián Duarte',
    clientPhone: '+595 992 334 115',
    category: 'Reserva Estándar',
    status: 'Finalizada',
    courtAmount: 120000,
    depositPaid: 60000,
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
    timeSlot: '19:00 - 20:00',
    clientName: 'Matías Peña',
    clientPhone: '+595 983 551 772',
    category: 'Reserva Estándar',
    status: 'Confirmada',
    courtAmount: 160000,
    depositPaid: 80000,
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
    timeSlot: '19:00 - 20:00',
    clientName: 'Alejandro Benítez (BlackTeam)',
    clientPhone: '+595 981 112 334',
    category: 'Clase BlackTeam',
    status: 'Confirmada',
    courtAmount: 200000,
    depositPaid: 100000,
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
    timeSlot: '19:00 - 20:00',
    clientName: 'Carlos Argaña',
    clientPhone: '+595 972 660 449',
    category: 'Reserva Estándar',
    status: 'Seña Pendiente',
    courtAmount: 120000,
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
    timeSlot: '20:00 - 21:00',
    clientName: 'Federico Zuccolillo',
    clientPhone: '+595 981 990 001',
    category: 'Turno Fijo Semanal',
    status: 'Confirmada',
    courtAmount: 160000,
    depositPaid: 80000,
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
    timeSlot: '20:00 - 21:00',
    clientName: 'Andrea Benítez & Binomio',
    clientPhone: '+595 994 220 889',
    category: 'Reserva Estándar',
    status: 'Confirmada',
    courtAmount: 140000,
    depositPaid: 70000,
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
    timeSlot: '11:00 - 12:00',
    clientName: 'Clínica de Perfeccionamiento',
    clientPhone: '+595 981 777 444',
    category: 'Clase BlackTeam',
    status: 'Finalizada',
    courtAmount: 130000,
    depositPaid: 130000,
    barTableRequested: false,
    rentedRackets: 0,
    ballTubes: 1,
    linkedTabId: 'tab-109',
    createdAt: '10:50'
  }
];

// Operational tabs in POS & Dashboard
// State Coherence: ONLY 1 account per court is 'en_cancha' (green).
// Finished match accounts still open are 'tercer_tiempo' (amber).
export const INITIAL_TABS = [
  {
    id: 'tab-101',
    linkedBookingId: 'book-101',
    courtId: 'court-1',
    courtName: 'Cancha Central Panorámica',
    clientName: 'Gonzalo Insfrán',
    courtAmount: 160000,
    depositPaid: 100000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-5', name: 'Promo 2x1 Chopp (Noches de Copa)', price: 28000, qty: 1 },
      { id: 'menu-1', name: 'Picada Black Club', price: 85000, qty: 1 }
    ],
    status: 'open',
    activityStatus: 'en_cancha', // ACTIVE GAME ON COURT 1
    paymentMethod: null,
    barTableRequested: true,
    openedAt: '17:55'
  },
  {
    id: 'tab-102',
    linkedBookingId: 'book-102',
    courtId: 'court-2',
    courtName: 'Cancha 2 (Indoor Climatizada)',
    clientName: 'Rodrigo Villalba',
    courtAmount: 140000,
    depositPaid: 70000,
    racketCount: 2,
    racketUnitFee: 30000,
    ballTubeCount: 0,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-10', name: 'Gatorade Cool Blue 750ml', price: 16000, qty: 2 },
      { id: 'menu-11', name: 'Agua Mineral San Roque 500ml', price: 10000, qty: 2 }
    ],
    status: 'open',
    activityStatus: 'en_cancha', // ACTIVE GAME ON COURT 2
    paymentMethod: null,
    barTableRequested: false,
    openedAt: '17:58'
  },
  {
    id: 'tab-103',
    linkedBookingId: 'book-103',
    courtId: 'court-3',
    courtName: 'Cancha 3 (Outdoor Techada)',
    clientName: 'Sebastián Duarte',
    courtAmount: 120000,
    depositPaid: 60000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-6', name: 'Balde x6 Stella Artois 330ml', price: 95000, qty: 1 }
    ],
    status: 'settled',
    activityStatus: 'liquidada',
    paymentMethod: 'Tarjeta',
    settledAt: '18:35',
    barTableRequested: false,
    openedAt: '16:55'
  },
  {
    id: 'tab-104',
    linkedBookingId: 'book-104',
    courtId: 'court-1',
    courtName: 'Cancha Central (3er Tiempo)',
    clientName: 'Matías Peña',
    courtAmount: 160000,
    depositPaid: 80000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-5', name: 'Promo 2x1 Chopp (Noches de Copa)', price: 28000, qty: 2 },
      { id: 'menu-2', name: 'Black Angus Burger', price: 62000, qty: 2 }
    ],
    status: 'open',
    activityStatus: 'tercer_tiempo', // IN BAR / 3ER TIEMPO (Court 1 has another open account post-match)
    paymentMethod: null,
    barTableRequested: true,
    openedAt: '17:40'
  },
  {
    id: 'tab-105',
    linkedBookingId: 'book-105',
    courtId: 'court-2',
    courtName: 'Barra BlackBar (Post-Clase)',
    clientName: 'Alejandro Benítez (BlackTeam)',
    courtAmount: 200000,
    depositPaid: 100000,
    racketCount: 0,
    racketUnitFee: 30000,
    ballTubeCount: 1,
    ballTubeUnitFee: 70000,
    items: [
      { id: 'menu-10', name: 'Gatorade Cool Blue 750ml', price: 16000, qty: 1 }
    ],
    status: 'open',
    activityStatus: 'tercer_tiempo', // IN BAR / 3ER TIEMPO
    paymentMethod: null,
    barTableRequested: false,
    openedAt: '16:10'
  }
];

// Consistent Player Data (No empty values)
export const INITIAL_PLAYERS = [
  {
    id: 'plr-1',
    name: 'Gonzalo Insfrán',
    phone: '+595 981 445 210',
    category: '2da Categoría',
    isFixedPassHolder: true,
    fixedPassDay: 'Jueves 18:00 a 19:00 (Cancha Central)',
    totalBookings: 24,
    bookingsCount: 24,
    totalSpent: 4860000,
    totalSpend: 4860000,
    status: 'Cliente Activo Elite',
    lastVisit: 'Hoy, 18:00'
  },
  {
    id: 'plr-2',
    name: 'Federico Zuccolillo',
    phone: '+595 981 990 001',
    category: '1ra Categoría',
    isFixedPassHolder: true,
    fixedPassDay: 'Jueves 20:00 a 21:00 (Cancha Central)',
    totalBookings: 32,
    bookingsCount: 32,
    totalSpent: 6240000,
    totalSpend: 6240000,
    status: 'Cliente Activo Elite',
    lastVisit: 'Hoy, 20:00'
  },
  {
    id: 'plr-3',
    name: 'Rodrigo Villalba',
    phone: '+595 971 889 012',
    category: '3ra Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 11,
    bookingsCount: 11,
    totalSpent: 2010000,
    totalSpend: 2010000,
    status: 'Jugador Frecuente',
    lastVisit: 'Hoy, 18:00'
  },
  {
    id: 'plr-4',
    name: 'Matías Peña',
    phone: '+595 983 551 772',
    category: '4ta Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 8,
    bookingsCount: 8,
    totalSpent: 1620000,
    totalSpend: 1620000,
    status: 'Jugador Frecuente',
    lastVisit: 'Hoy, 19:00'
  },
  {
    id: 'plr-5',
    name: 'Carlos Argaña',
    phone: '+595 972 660 449',
    category: '5ta Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 7,
    bookingsCount: 7,
    totalSpent: 1150000,
    totalSpend: 1150000,
    status: 'Nuevo Registro',
    lastVisit: 'Hoy, 19:00'
  },
  {
    id: 'plr-6',
    name: 'Andrea Benítez',
    phone: '+595 994 220 889',
    category: '3ra Damas',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 14,
    bookingsCount: 14,
    totalSpent: 2680000,
    totalSpend: 2680000,
    status: 'Jugadora Frecuente',
    lastVisit: 'Hoy, 20:00'
  },
  {
    id: 'plr-7',
    name: 'Sebastián Duarte',
    phone: '+595 992 334 115',
    category: '4ta Categoría',
    isFixedPassHolder: false,
    fixedPassDay: null,
    totalBookings: 19,
    bookingsCount: 19,
    totalSpent: 3510000,
    totalSpend: 3510000,
    status: 'Jugador Frecuente',
    lastVisit: 'Hoy, 17:00'
  }
];
