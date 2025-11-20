/**
 * Demo Content System
 * Pre-populated content to avoid cold start problem for new users
 */

// Base interface for all demo content
export interface DemoBase {
  isDemo: true;
  createdDaysAgo: number;
}

export interface DemoOffer extends DemoBase {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'PRODUCT' | 'SERVICE' | 'SKILL';
  priceEur?: number;
  priceCredits?: number;
  isFree: boolean;
  location: string;
  lat: number;
  lng: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
  };
  images: string[];
  status: 'ACTIVE';
  interestedCount: number;
}

export interface DemoEvent extends DemoBase {
  id: string;
  title: string;
  description: string;
  image?: string;
  address: string;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt?: string;
  capacity?: number;
  category: string;
  type: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
  creditsReward?: number;
  tags: string[];
  requirements: string[];
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'PUBLISHED';
  registrationsCount: number;
}

export interface DemoCommunity extends DemoBase {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  coverImage?: string;
  memberCount: number;
  location: string;
  lat: number;
  lng: number;
  type: 'NEIGHBORHOOD' | 'CITY' | 'REGION';
  isPublic: true;
  activeOffers: number;
  upcomingEvents: number;
}

// Helper function to get a date X days ago
const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Helper function to get a future date X days from now
const getDaysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/**
 * DEMO OFFERS - 30 varied examples across Spain
 */
export const DEMO_OFFERS: DemoOffer[] = [
  // FOOD Category
  {
    id: 'demo-offer-food-1',
    title: 'Verduras ecológicas del huerto',
    description: 'Tomates, lechugas, calabacines y pimientos frescos. Recogida semanal disponible.',
    category: 'FOOD',
    type: 'PRODUCT',
    priceEur: 12,
    priceCredits: 12,
    isFree: false,
    location: 'Malasaña, Madrid',
    lat: 40.4268,
    lng: -3.7038,
    user: { id: 'demo-user-1', name: 'Carlos R.', reputation: 95 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 8,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-offer-food-2',
    title: 'Pan artesano de masa madre',
    description: 'Hogaza de trigo integral con fermentación lenta. Listo cada viernes.',
    category: 'FOOD',
    type: 'PRODUCT',
    priceEur: 4.5,
    priceCredits: 5,
    isFree: false,
    location: 'Gràcia, Barcelona',
    lat: 41.4036,
    lng: 2.1586,
    user: { id: 'demo-user-2', name: 'Ana M.', reputation: 88 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 15,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-food-3',
    title: 'Miel artesana de apicultura local',
    description: 'Miel pura de flores silvestres. Bote de 500g directo del productor.',
    category: 'FOOD',
    type: 'PRODUCT',
    priceEur: 8,
    priceCredits: 8,
    isFree: false,
    location: 'Ruzafa, Valencia',
    lat: 39.4632,
    lng: -0.3691,
    user: { id: 'demo-user-3', name: 'Javier P.', reputation: 92 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 12,
    isDemo: true,
    createdDaysAgo: 3,
  },
  {
    id: 'demo-offer-food-4',
    title: 'Queso de oveja artesano',
    description: 'Queso semicurado elaborado con leche de oveja local. Pedidos mínimos 500g.',
    category: 'FOOD',
    type: 'PRODUCT',
    priceEur: 15,
    priceCredits: 15,
    isFree: false,
    location: 'Pamplona',
    lat: 42.8125,
    lng: -1.6458,
    user: { id: 'demo-user-4', name: 'María S.', reputation: 97 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 6,
    isDemo: true,
    createdDaysAgo: 1,
  },

  // EDUCATION Category
  {
    id: 'demo-offer-edu-1',
    title: 'Clases de guitarra española',
    description: 'Profesor con 10 años de experiencia. Todos los niveles, desde principiante hasta avanzado.',
    category: 'EDUCATION',
    type: 'SERVICE',
    priceEur: 20,
    priceCredits: 20,
    isFree: false,
    location: 'Gràcia, Barcelona',
    lat: 41.4036,
    lng: 2.1586,
    user: { id: 'demo-user-5', name: 'María G.', reputation: 98 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 11,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-edu-2',
    title: 'Tutoría de matemáticas ESO y Bachillerato',
    description: 'Ingeniero da clases particulares. Preparación de exámenes y refuerzo.',
    category: 'EDUCATION',
    type: 'SERVICE',
    priceEur: 25,
    priceCredits: 25,
    isFree: false,
    location: 'Chamberí, Madrid',
    lat: 40.4415,
    lng: -3.7033,
    user: { id: 'demo-user-6', name: 'David L.', reputation: 94 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 9,
    isDemo: true,
    createdDaysAgo: 4,
  },
  {
    id: 'demo-offer-edu-3',
    title: 'Clases de inglés conversacional',
    description: 'Native speaker ofrece conversación práctica para mejorar tu fluidez.',
    category: 'EDUCATION',
    type: 'SERVICE',
    priceEur: 15,
    priceCredits: 15,
    isFree: false,
    location: 'Casco Viejo, Bilbao',
    lat: 43.2569,
    lng: -2.9235,
    user: { id: 'demo-user-7', name: 'Sarah W.', reputation: 91 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 14,
    isDemo: true,
    createdDaysAgo: 3,
  },
  {
    id: 'demo-offer-edu-4',
    title: 'Taller de cerámica para principiantes',
    description: 'Aprende técnicas básicas de modelado y torno. Incluye materiales.',
    category: 'EDUCATION',
    type: 'SERVICE',
    priceEur: 35,
    priceCredits: 35,
    isFree: false,
    location: 'Triana, Sevilla',
    lat: 37.3836,
    lng: -5.9979,
    user: { id: 'demo-user-8', name: 'Laura T.', reputation: 89 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 7,
    isDemo: true,
    createdDaysAgo: 5,
  },

  // SERVICES Category
  {
    id: 'demo-offer-service-1',
    title: 'Reparación de bicicletas a domicilio',
    description: 'Mecánico profesional. Ajustes, cambios de piezas y mantenimiento general.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 25,
    priceCredits: 25,
    isFree: false,
    location: 'El Raval, Barcelona',
    lat: 41.3796,
    lng: 2.1678,
    user: { id: 'demo-user-9', name: 'Pablo M.', reputation: 96 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 13,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-offer-service-2',
    title: 'Diseño gráfico para pequeños negocios',
    description: 'Logos, flyers, posts redes sociales. Portfolio disponible.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 50,
    priceCredits: 50,
    isFree: false,
    location: 'Lavapiés, Madrid',
    lat: 40.4085,
    lng: -3.7009,
    user: { id: 'demo-user-10', name: 'Sandra F.', reputation: 93 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 10,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-service-3',
    title: 'Fotografía para eventos familiares',
    description: 'Sesiones de fotos, cumpleaños, bautizos. Entrega digital en 48h.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 120,
    priceCredits: 120,
    isFree: false,
    location: 'Russafa, Valencia',
    lat: 39.4632,
    lng: -0.3691,
    user: { id: 'demo-user-11', name: 'Miguel Á.', reputation: 99 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 5,
    isDemo: true,
    createdDaysAgo: 6,
  },
  {
    id: 'demo-offer-service-4',
    title: 'Jardinería y cuidado de plantas',
    description: 'Poda, riego, trasplantes. Servicio regular o puntual.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 30,
    priceCredits: 30,
    isFree: false,
    location: 'Moncloa, Madrid',
    lat: 40.4378,
    lng: -3.7196,
    user: { id: 'demo-user-12', name: 'Antonio V.', reputation: 87 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 8,
    isDemo: true,
    createdDaysAgo: 3,
  },

  // GOODS Category
  {
    id: 'demo-offer-goods-1',
    title: 'Bicicleta urbana en buen estado',
    description: 'Bici de paseo, 6 velocidades, con cesta. Recién revisada.',
    category: 'GOODS',
    type: 'PRODUCT',
    priceEur: 80,
    priceCredits: 80,
    isFree: false,
    location: 'Eixample, Barcelona',
    lat: 41.3888,
    lng: 2.1590,
    user: { id: 'demo-user-13', name: 'Elena R.', reputation: 90 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 6,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-goods-2',
    title: 'Libros de programación (Python, JavaScript)',
    description: 'Colección de 8 libros técnicos en buen estado. Venta en lote.',
    category: 'GOODS',
    type: 'PRODUCT',
    priceEur: 45,
    priceCredits: 45,
    isFree: false,
    location: 'Arganzuela, Madrid',
    lat: 40.3978,
    lng: -3.6988,
    user: { id: 'demo-user-14', name: 'Roberto C.', reputation: 85 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 4,
    isDemo: true,
    createdDaysAgo: 4,
  },
  {
    id: 'demo-offer-goods-3',
    title: 'Mesa de comedor extensible madera maciza',
    description: 'Mesa roble, 120-180cm, 6-8 personas. Excelente estado.',
    category: 'GOODS',
    type: 'PRODUCT',
    priceEur: 150,
    priceCredits: 150,
    isFree: false,
    location: 'Triana, Sevilla',
    lat: 37.3836,
    lng: -5.9979,
    user: { id: 'demo-user-15', name: 'Carmen N.', reputation: 92 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 7,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-offer-goods-4',
    title: 'Ropa de bebé (0-12 meses)',
    description: 'Lote de 20 prendas en muy buen estado. Bodies, pijamas, conjuntos.',
    category: 'GOODS',
    type: 'PRODUCT',
    priceEur: 30,
    priceCredits: 30,
    isFree: false,
    location: 'Chueca, Madrid',
    lat: 40.4235,
    lng: -3.6957,
    user: { id: 'demo-user-16', name: 'Patricia H.', reputation: 88 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 9,
    isDemo: true,
    createdDaysAgo: 3,
  },

  // HEALTH & WELLNESS Category
  {
    id: 'demo-offer-health-1',
    title: 'Clases de yoga para todos los niveles',
    description: 'Sesiones grupales o privadas. Hatha yoga y meditación.',
    category: 'HEALTH',
    type: 'SERVICE',
    priceEur: 12,
    priceCredits: 12,
    isFree: false,
    location: 'Malasaña, Madrid',
    lat: 40.4268,
    lng: -3.7038,
    user: { id: 'demo-user-17', name: 'Lucía S.', reputation: 96 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 18,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-offer-health-2',
    title: 'Masajes terapéuticos y relajantes',
    description: 'Terapeuta certificada. Masaje deportivo, descontracturante, relajante.',
    category: 'HEALTH',
    type: 'SERVICE',
    priceEur: 40,
    priceCredits: 40,
    isFree: false,
    location: 'Sarrià, Barcelona',
    lat: 41.3989,
    lng: 2.1189,
    user: { id: 'demo-user-18', name: 'Marta B.', reputation: 98 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 11,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-health-3',
    title: 'Nutrición y planes alimentarios personalizados',
    description: 'Dietista-nutricionista colegiada. Primera consulta gratis.',
    category: 'HEALTH',
    type: 'SERVICE',
    priceEur: 50,
    priceCredits: 50,
    isFree: false,
    location: 'El Carmen, Valencia',
    lat: 39.4767,
    lng: -0.3789,
    user: { id: 'demo-user-19', name: 'Isabel G.', reputation: 94 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 7,
    isDemo: true,
    createdDaysAgo: 5,
  },

  // FREE Offers (Skills & Time Sharing)
  {
    id: 'demo-offer-free-1',
    title: 'Ayuda con mudanzas los fines de semana',
    description: 'Disponible sábados y domingos. Tengo furgoneta.',
    category: 'SERVICES',
    type: 'SKILL',
    isFree: true,
    location: 'Tetuán, Madrid',
    lat: 40.4587,
    lng: -3.6969,
    user: { id: 'demo-user-20', name: 'Jorge R.', reputation: 86 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 15,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-offer-free-2',
    title: 'Intercambio de idiomas español-inglés',
    description: 'Native Spanish speaker busca practicar inglés. Café y conversación.',
    category: 'EDUCATION',
    type: 'SKILL',
    isFree: true,
    location: 'Poble Sec, Barcelona',
    lat: 41.3719,
    lng: 2.1649,
    user: { id: 'demo-user-21', name: 'Alicia M.', reputation: 89 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 12,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-free-3',
    title: 'Apoyo escolar para niños de primaria',
    description: 'Estudiante de magisterio ofrece ayuda con deberes gratis.',
    category: 'EDUCATION',
    type: 'SKILL',
    isFree: true,
    location: 'Benimaclet, Valencia',
    lat: 39.4840,
    lng: -0.3535,
    user: { id: 'demo-user-22', name: 'Cristina D.', reputation: 91 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 8,
    isDemo: true,
    createdDaysAgo: 3,
  },
  {
    id: 'demo-offer-free-4',
    title: 'Paseo de perros por el parque',
    description: 'Me encantaría pasear tu perro. Horarios flexibles.',
    category: 'SERVICES',
    type: 'SKILL',
    isFree: true,
    location: 'Retiro, Madrid',
    lat: 40.4153,
    lng: -3.6823,
    user: { id: 'demo-user-23', name: 'Marcos P.', reputation: 93 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 10,
    isDemo: true,
    createdDaysAgo: 1,
  },

  // More varied offers across different cities
  {
    id: 'demo-offer-tech-1',
    title: 'Reparación de ordenadores y móviles',
    description: 'Diagnóstico gratuito. Cambio de pantallas, baterías, formateo.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 35,
    priceCredits: 35,
    isFree: false,
    location: 'Universidad, Zaragoza',
    lat: 41.6488,
    lng: -0.8891,
    user: { id: 'demo-user-24', name: 'Iván L.', reputation: 95 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 14,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-craft-1',
    title: 'Taller de costura y arreglos de ropa',
    description: 'Dobladillos, cremalleras, ajustes. Trabajos en 24-48h.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 15,
    priceCredits: 15,
    isFree: false,
    location: 'Centro, Granada',
    lat: 37.1773,
    lng: -3.5986,
    user: { id: 'demo-user-25', name: 'Dolores A.', reputation: 97 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 9,
    isDemo: true,
    createdDaysAgo: 4,
  },
  {
    id: 'demo-offer-music-1',
    title: 'Clases de piano online o presencial',
    description: 'Profesora titulada. Método adaptado a cada alumno.',
    category: 'EDUCATION',
    type: 'SERVICE',
    priceEur: 25,
    priceCredits: 25,
    isFree: false,
    location: 'Nervión, Sevilla',
    lat: 37.3729,
    lng: -5.9755,
    user: { id: 'demo-user-26', name: 'Beatriz V.', reputation: 99 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 6,
    isDemo: true,
    createdDaysAgo: 3,
  },
  {
    id: 'demo-offer-sports-1',
    title: 'Entrenamiento personal y fitness',
    description: 'Coach certificado. Planes personalizados. Primera sesión gratis.',
    category: 'HEALTH',
    type: 'SERVICE',
    priceEur: 30,
    priceCredits: 30,
    isFree: false,
    location: 'Indautxu, Bilbao',
    lat: 43.2627,
    lng: -2.9253,
    user: { id: 'demo-user-27', name: 'Raúl F.', reputation: 92 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 11,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-offer-art-1',
    title: 'Cuadros y pinturas originales',
    description: 'Obras abstractas y paisajes. Varios tamaños disponibles.',
    category: 'GOODS',
    type: 'PRODUCT',
    priceEur: 75,
    priceCredits: 75,
    isFree: false,
    location: 'El Born, Barcelona',
    lat: 41.3851,
    lng: 2.1823,
    user: { id: 'demo-user-28', name: 'Clara O.', reputation: 88 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 5,
    isDemo: true,
    createdDaysAgo: 7,
  },
  {
    id: 'demo-offer-home-1',
    title: 'Limpieza de hogar ecológica',
    description: 'Productos naturales y no tóxicos. Servicio semanal o quincenal.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 40,
    priceCredits: 40,
    isFree: false,
    location: 'Salamanca, Madrid',
    lat: 40.4301,
    lng: -3.6769,
    user: { id: 'demo-user-29', name: 'Sofía L.', reputation: 96 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 13,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-offer-kids-1',
    title: 'Cuidado de niños tardes y fines de semana',
    description: 'Experiencia con bebés y niños pequeños. Referencias disponibles.',
    category: 'SERVICES',
    type: 'SERVICE',
    priceEur: 10,
    priceCredits: 10,
    isFree: false,
    location: 'Delicias, Zaragoza',
    lat: 41.6403,
    lng: -0.9027,
    user: { id: 'demo-user-30', name: 'Nuria S.', reputation: 98 },
    images: [],
    status: 'ACTIVE',
    interestedCount: 16,
    isDemo: true,
    createdDaysAgo: 1,
  },
];

/**
 * DEMO EVENTS - 15 varied examples
 */
export const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 'demo-event-1',
    title: 'Limpieza colectiva del parque',
    description: 'Ven con guantes y bolsas. Café y snacks incluidos. Ayudemos a mantener nuestro barrio limpio.',
    image: undefined,
    address: 'Parc de la Ciutadella, Barcelona',
    lat: 41.3874,
    lng: 2.1859,
    startsAt: getDaysFromNow(3),
    endsAt: getDaysFromNow(3),
    capacity: 50,
    category: 'COMMUNITY',
    type: 'IN_PERSON',
    creditsReward: 10,
    tags: ['limpieza', 'medio-ambiente', 'voluntariado'],
    requirements: ['Guantes', 'Bolsas de basura'],
    organizer: { id: 'demo-user-31', name: 'Asociación Vecinos Gràcia' },
    status: 'PUBLISHED',
    registrationsCount: 24,
    isDemo: true,
    createdDaysAgo: 5,
  },
  {
    id: 'demo-event-2',
    title: 'Taller de compostaje doméstico',
    description: 'Aprende a hacer tu propia composta. Trae un recipiente para llevarte una muestra.',
    image: undefined,
    address: 'Centro Cultural Conde Duque, Madrid',
    lat: 40.4289,
    lng: -3.7098,
    startsAt: getDaysFromNow(5),
    endsAt: getDaysFromNow(5),
    capacity: 30,
    category: 'EDUCATION',
    type: 'IN_PERSON',
    creditsReward: 8,
    tags: ['sostenibilidad', 'reciclaje', 'educación'],
    requirements: [],
    organizer: { id: 'demo-user-32', name: 'Eco-Madrid' },
    status: 'PUBLISHED',
    registrationsCount: 18,
    isDemo: true,
    createdDaysAgo: 7,
  },
  {
    id: 'demo-event-3',
    title: 'Intercambio de libros y café literario',
    description: 'Trae un libro que ya no leas y llévate otro. Tertulia sobre literatura contemporánea.',
    image: undefined,
    address: 'Librería La Fuga, Valencia',
    lat: 39.4699,
    lng: -0.3763,
    startsAt: getDaysFromNow(2),
    endsAt: getDaysFromNow(2),
    capacity: 25,
    category: 'CULTURE',
    type: 'IN_PERSON',
    creditsReward: 5,
    tags: ['libros', 'cultura', 'intercambio'],
    requirements: ['Un libro para intercambiar'],
    organizer: { id: 'demo-user-33', name: 'Club de Lectura Russafa' },
    status: 'PUBLISHED',
    registrationsCount: 12,
    isDemo: true,
    createdDaysAgo: 4,
  },
  {
    id: 'demo-event-4',
    title: 'Ruta en bici por el parque',
    description: 'Paseo de 15km apto para todos los niveles. Parada para picnic incluida.',
    image: undefined,
    address: 'Casa de Campo, Madrid',
    lat: 40.4193,
    lng: -3.7547,
    startsAt: getDaysFromNow(6),
    endsAt: getDaysFromNow(6),
    capacity: 40,
    category: 'SPORTS',
    type: 'IN_PERSON',
    creditsReward: 6,
    tags: ['ciclismo', 'deporte', 'naturaleza'],
    requirements: ['Bicicleta en buen estado', 'Casco'],
    organizer: { id: 'demo-user-34', name: 'Pedales Urbanos' },
    status: 'PUBLISHED',
    registrationsCount: 28,
    isDemo: true,
    createdDaysAgo: 3,
  },
  {
    id: 'demo-event-5',
    title: 'Huerto urbano comunitario - Jornada de plantación',
    description: 'Plantamos tomates, lechugas y hierbas aromáticas. Herramientas proporcionadas.',
    image: undefined,
    address: 'Huerto del Poblenou, Barcelona',
    lat: 41.4036,
    lng: 2.1969,
    startsAt: getDaysFromNow(4),
    endsAt: getDaysFromNow(4),
    capacity: 20,
    category: 'COMMUNITY',
    type: 'IN_PERSON',
    creditsReward: 12,
    tags: ['agricultura', 'sostenibilidad', 'comunidad'],
    requirements: [],
    organizer: { id: 'demo-user-35', name: 'Huertos Urbanos BCN' },
    status: 'PUBLISHED',
    registrationsCount: 15,
    isDemo: true,
    createdDaysAgo: 6,
  },
  {
    id: 'demo-event-6',
    title: 'Taller de reparación de ropa (Repair Café)',
    description: 'Trae ropa que necesite arreglos. Voluntarios te ayudarán a repararla.',
    image: undefined,
    address: 'Centro Social La Tabacalera, Madrid',
    lat: 40.4087,
    lng: -3.6936,
    startsAt: getDaysFromNow(8),
    endsAt: getDaysFromNow(8),
    capacity: 35,
    category: 'EDUCATION',
    type: 'IN_PERSON',
    creditsReward: 7,
    tags: ['reparación', 'sostenibilidad', 'moda'],
    requirements: ['Prendas para reparar', 'Ganas de aprender'],
    organizer: { id: 'demo-user-36', name: 'Repair Café Madrid' },
    status: 'PUBLISHED',
    registrationsCount: 22,
    isDemo: true,
    createdDaysAgo: 2,
  },
  {
    id: 'demo-event-7',
    title: 'Clase de yoga al aire libre',
    description: 'Yoga para todos los niveles en el parque. Trae tu esterilla.',
    image: undefined,
    address: 'Parque del Retiro, Madrid',
    lat: 40.4153,
    lng: -3.6823,
    startsAt: getDaysFromNow(1),
    endsAt: getDaysFromNow(1),
    capacity: 60,
    category: 'HEALTH',
    type: 'IN_PERSON',
    creditsReward: 4,
    tags: ['yoga', 'salud', 'bienestar'],
    requirements: ['Esterilla de yoga'],
    organizer: { id: 'demo-user-37', name: 'Yoga en el Parque' },
    status: 'PUBLISHED',
    registrationsCount: 45,
    isDemo: true,
    createdDaysAgo: 1,
  },
  {
    id: 'demo-event-8',
    title: 'Mercado de intercambio (Swap Market)',
    description: 'Intercambia ropa, libros, juguetes y más. Sin dinero, solo trueque.',
    image: undefined,
    address: 'Matadero Madrid',
    lat: 40.3919,
    lng: -3.7046,
    startsAt: getDaysFromNow(10),
    endsAt: getDaysFromNow(10),
    capacity: 100,
    category: 'COMMUNITY',
    type: 'IN_PERSON',
    creditsReward: 10,
    tags: ['intercambio', 'economía-circular', 'sostenibilidad'],
    requirements: [],
    organizer: { id: 'demo-user-38', name: 'Swap Madrid' },
    status: 'PUBLISHED',
    registrationsCount: 67,
    isDemo: true,
    createdDaysAgo: 8,
  },
  {
    id: 'demo-event-9',
    title: 'Charla online: Introducción a las criptomonedas',
    description: 'Webinar gratuito sobre blockchain y criptos. Para principiantes.',
    image: undefined,
    address: 'Online - Zoom',
    lat: 40.4168,
    lng: -3.7038,
    startsAt: getDaysFromNow(7),
    endsAt: getDaysFromNow(7),
    capacity: 200,
    category: 'EDUCATION',
    type: 'VIRTUAL',
    creditsReward: 5,
    tags: ['tecnología', 'cripto', 'educación-financiera'],
    requirements: ['Conexión a internet'],
    organizer: { id: 'demo-user-39', name: 'Crypto España' },
    status: 'PUBLISHED',
    registrationsCount: 134,
    isDemo: true,
    createdDaysAgo: 5,
  },
  {
    id: 'demo-event-10',
    title: 'Concierto acústico en el parque',
    description: 'Música en vivo con artistas locales. Trae tu manta y disfruta.',
    image: undefined,
    address: 'Parc de Joan Miró, Barcelona',
    lat: 41.3754,
    lng: 2.1509,
    startsAt: getDaysFromNow(12),
    endsAt: getDaysFromNow(12),
    capacity: 150,
    category: 'CULTURE',
    type: 'IN_PERSON',
    creditsReward: 3,
    tags: ['música', 'cultura', 'aire-libre'],
    requirements: [],
    organizer: { id: 'demo-user-40', name: 'Músicos del Barrio' },
    status: 'PUBLISHED',
    registrationsCount: 89,
    isDemo: true,
    createdDaysAgo: 10,
  },
  {
    id: 'demo-event-11',
    title: 'Taller de fotografía urbana',
    description: 'Aprende técnicas de street photography. Trae tu cámara o móvil.',
    image: undefined,
    address: 'Barrio de las Letras, Madrid',
    lat: 40.4141,
    lng: -3.6957,
    startsAt: getDaysFromNow(9),
    endsAt: getDaysFromNow(9),
    capacity: 15,
    category: 'EDUCATION',
    type: 'IN_PERSON',
    creditsReward: 8,
    tags: ['fotografía', 'arte', 'urbano'],
    requirements: ['Cámara o smartphone'],
    organizer: { id: 'demo-user-41', name: 'Foto Urbana Madrid' },
    status: 'PUBLISHED',
    registrationsCount: 11,
    isDemo: true,
    createdDaysAgo: 4,
  },
  {
    id: 'demo-event-12',
    title: 'Sesión de meditación grupal',
    description: 'Meditación guiada para reducir el estrés. Principiantes bienvenidos.',
    image: undefined,
    address: 'Centro Cívico, Valencia',
    lat: 39.4699,
    lng: -0.3763,
    startsAt: getDaysFromNow(2),
    endsAt: getDaysFromNow(2),
    capacity: 25,
    category: 'HEALTH',
    type: 'IN_PERSON',
    creditsReward: 5,
    tags: ['meditación', 'mindfulness', 'bienestar'],
    requirements: ['Ropa cómoda'],
    organizer: { id: 'demo-user-42', name: 'Centro de Mindfulness' },
    status: 'PUBLISHED',
    registrationsCount: 19,
    isDemo: true,
    createdDaysAgo: 3,
  },
  {
    id: 'demo-event-13',
    title: 'Feria de emprendimiento local',
    description: 'Conoce proyectos de economía social y solidaria de tu zona.',
    image: undefined,
    address: 'Recinto Ferial, Bilbao',
    lat: 43.2630,
    lng: -2.9350,
    startsAt: getDaysFromNow(14),
    endsAt: getDaysFromNow(14),
    capacity: 200,
    category: 'BUSINESS',
    type: 'IN_PERSON',
    creditsReward: 6,
    tags: ['emprendimiento', 'economía-social', 'networking'],
    requirements: [],
    organizer: { id: 'demo-user-43', name: 'Red de Economía Solidaria' },
    status: 'PUBLISHED',
    registrationsCount: 156,
    isDemo: true,
    createdDaysAgo: 12,
  },
  {
    id: 'demo-event-14',
    title: 'Taller de cocina vegetariana',
    description: 'Aprende a cocinar platos vegetarianos deliciosos y nutritivos.',
    image: undefined,
    address: 'Espacio Cultural, Sevilla',
    lat: 37.3886,
    lng: -5.9823,
    startsAt: getDaysFromNow(5),
    endsAt: getDaysFromNow(5),
    capacity: 20,
    category: 'FOOD',
    type: 'IN_PERSON',
    creditsReward: 9,
    tags: ['cocina', 'vegetariano', 'salud'],
    requirements: ['Delantal'],
    organizer: { id: 'demo-user-44', name: 'Chef Verde' },
    status: 'PUBLISHED',
    registrationsCount: 14,
    isDemo: true,
    createdDaysAgo: 6,
  },
  {
    id: 'demo-event-15',
    title: 'Cinefórum: Documentales sobre sostenibilidad',
    description: 'Proyección de documental seguida de debate. Palomitas incluidas.',
    image: undefined,
    address: 'Filmoteca de Catalunya, Barcelona',
    lat: 41.3791,
    lng: 2.1675,
    startsAt: getDaysFromNow(11),
    endsAt: getDaysFromNow(11),
    capacity: 80,
    category: 'CULTURE',
    type: 'IN_PERSON',
    creditsReward: 4,
    tags: ['cine', 'sostenibilidad', 'debate'],
    requirements: [],
    organizer: { id: 'demo-user-45', name: 'Cine y Conciencia' },
    status: 'PUBLISHED',
    registrationsCount: 52,
    isDemo: true,
    createdDaysAgo: 9,
  },
];

/**
 * DEMO COMMUNITIES - 10 varied examples
 */
export const DEMO_COMMUNITIES: DemoCommunity[] = [
  {
    id: 'demo-community-1',
    name: 'Gràcia Sostenible',
    slug: 'gracia-sostenible',
    description: 'Vecinos comprometidos con la economía local y la sostenibilidad ambiental.',
    memberCount: 342,
    location: 'Gràcia, Barcelona',
    lat: 41.4036,
    lng: 2.1586,
    type: 'NEIGHBORHOOD',
    isPublic: true,
    activeOffers: 45,
    upcomingEvents: 7,
    isDemo: true,
    createdDaysAgo: 180,
  },
  {
    id: 'demo-community-2',
    name: 'Malasaña Colaborativa',
    slug: 'malasana-colaborativa',
    description: 'Red de apoyo mutuo y economía colaborativa en el corazón de Madrid.',
    memberCount: 521,
    location: 'Malasaña, Madrid',
    lat: 40.4268,
    lng: -3.7038,
    type: 'NEIGHBORHOOD',
    isPublic: true,
    activeOffers: 68,
    upcomingEvents: 12,
    isDemo: true,
    createdDaysAgo: 240,
  },
  {
    id: 'demo-community-3',
    name: 'Valencia en Transición',
    slug: 'valencia-transicion',
    description: 'Comunidad por la transición ecológica y social en Valencia.',
    memberCount: 289,
    location: 'Valencia Centro',
    lat: 39.4699,
    lng: -0.3763,
    type: 'CITY',
    isPublic: true,
    activeOffers: 34,
    upcomingEvents: 9,
    isDemo: true,
    createdDaysAgo: 150,
  },
  {
    id: 'demo-community-4',
    name: 'Bilbao Solidario',
    slug: 'bilbao-solidario',
    description: 'Red de economía solidaria y apoyo vecinal en Bilbao.',
    memberCount: 198,
    location: 'Casco Viejo, Bilbao',
    lat: 43.2569,
    lng: -2.9235,
    type: 'CITY',
    isPublic: true,
    activeOffers: 28,
    upcomingEvents: 5,
    isDemo: true,
    createdDaysAgo: 120,
  },
  {
    id: 'demo-community-5',
    name: 'Sevilla Comparte',
    slug: 'sevilla-comparte',
    description: 'Espacio de intercambio y economía del bien común en Sevilla.',
    memberCount: 412,
    location: 'Triana, Sevilla',
    lat: 37.3836,
    lng: -5.9979,
    type: 'NEIGHBORHOOD',
    isPublic: true,
    activeOffers: 52,
    upcomingEvents: 8,
    isDemo: true,
    createdDaysAgo: 200,
  },
  {
    id: 'demo-community-6',
    name: 'Zaragoza Colabora',
    slug: 'zaragoza-colabora',
    description: 'Comunidad de consumo responsable y apoyo mutuo.',
    memberCount: 156,
    location: 'Universidad, Zaragoza',
    lat: 41.6488,
    lng: -0.8891,
    type: 'CITY',
    isPublic: true,
    activeOffers: 22,
    upcomingEvents: 4,
    isDemo: true,
    createdDaysAgo: 90,
  },
  {
    id: 'demo-community-7',
    name: 'Pamplona Verde',
    slug: 'pamplona-verde',
    description: 'Red de iniciativas ecológicas y economía local en Navarra.',
    memberCount: 134,
    location: 'Pamplona Centro',
    lat: 42.8125,
    lng: -1.6458,
    type: 'CITY',
    isPublic: true,
    activeOffers: 18,
    upcomingEvents: 6,
    isDemo: true,
    createdDaysAgo: 110,
  },
  {
    id: 'demo-community-8',
    name: 'Granada Alternativa',
    slug: 'granada-alternativa',
    description: 'Comunidad de economía social y alternativas de consumo.',
    memberCount: 223,
    location: 'Realejo, Granada',
    lat: 37.1773,
    lng: -3.5986,
    type: 'NEIGHBORHOOD',
    isPublic: true,
    activeOffers: 31,
    upcomingEvents: 5,
    isDemo: true,
    createdDaysAgo: 160,
  },
  {
    id: 'demo-community-9',
    name: 'El Raval Coopera',
    slug: 'raval-coopera',
    description: 'Cooperativismo y economía comunitaria en el Raval de Barcelona.',
    memberCount: 267,
    location: 'El Raval, Barcelona',
    lat: 41.3796,
    lng: 2.1678,
    type: 'NEIGHBORHOOD',
    isPublic: true,
    activeOffers: 38,
    upcomingEvents: 10,
    isDemo: true,
    createdDaysAgo: 195,
  },
  {
    id: 'demo-community-10',
    name: 'Lavapiés Mutual',
    slug: 'lavapies-mutual',
    description: 'Red de apoyo mutuo y autogestión vecinal en Lavapiés.',
    memberCount: 389,
    location: 'Lavapiés, Madrid',
    lat: 40.4085,
    lng: -3.7009,
    type: 'NEIGHBORHOOD',
    isPublic: true,
    activeOffers: 56,
    upcomingEvents: 11,
    isDemo: true,
    createdDaysAgo: 220,
  },
];

/**
 * Demo Content Manager
 */
export class DemoContentManager {
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get demo offers filtered by location
   */
  static getDemoOffersByLocation(
    userLatitude: number,
    userLongitude: number,
    radiusKilometers: number = 50
  ): DemoOffer[] {
    return DEMO_OFFERS.filter((offer) => {
      const distance = this.calculateDistance(
        userLatitude,
        userLongitude,
        offer.lat,
        offer.lng
      );
      return distance <= radiusKilometers;
    }).sort((a, b) => {
      // Sort by distance
      const distA = this.calculateDistance(userLatitude, userLongitude, a.lat, a.lng);
      const distB = this.calculateDistance(userLatitude, userLongitude, b.lat, b.lng);
      return distA - distB;
    });
  }

  /**
   * Get demo events filtered by location
   */
  static getDemoEventsByLocation(
    userLatitude: number,
    userLongitude: number,
    radiusKilometers: number = 50
  ): DemoEvent[] {
    return DEMO_EVENTS.filter((event) => {
      const distance = this.calculateDistance(
        userLatitude,
        userLongitude,
        event.lat,
        event.lng
      );
      return distance <= radiusKilometers;
    }).sort((a, b) => {
      // Sort by date (upcoming first)
      return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
    });
  }

  /**
   * Get demo communities filtered by location
   */
  static getDemoCommunitiesByLocation(
    userLatitude: number,
    userLongitude: number,
    radiusKilometers: number = 100
  ): DemoCommunity[] {
    return DEMO_COMMUNITIES.filter((community) => {
      const distance = this.calculateDistance(
        userLatitude,
        userLongitude,
        community.lat,
        community.lng
      );
      return distance <= radiusKilometers;
    }).sort((a, b) => {
      // Sort by member count (most popular first)
      return b.memberCount - a.memberCount;
    });
  }

  /**
   * Blend demo content with real content
   * Rules:
   * - Maximum 50% demos
   * - Real content always first
   * - Diverse demos (no repeats)
   */
  static blendDemoWithReal<T extends { id: string }>(
    realContent: T[],
    demoContent: (T & DemoBase)[],
    maximumDemos: number = 10
  ): (T | (T & DemoBase))[] {
    const realCount = realContent.length;

    // If we have enough real content, don't add demos
    if (realCount >= 20) {
      return realContent;
    }

    // Calculate how many demos to add
    // Rule: Max 50% of total should be demos
    const maxDemosAllowed = Math.min(
      maximumDemos,
      Math.floor(realCount * 0.5), // Max 50% demos
      demoContent.length
    );

    // If we have very few real items, allow more demos but cap at maxDemos
    const demosToAdd = realCount < 5
      ? Math.min(maximumDemos, demoContent.length)
      : maxDemosAllowed;

    // Take the first N demos (already sorted by relevance)
    const selectedDemos = demoContent.slice(0, demosToAdd);

    // Blend: real content first, then demos
    return [...realContent, ...selectedDemos];
  }

  /**
   * Check if an item is demo content
   */
  static isDemo(itemId: string): boolean {
    return itemId.startsWith('demo-');
  }

  /**
   * Get demo statistics for display
   */
  static getDemoStats(): {
    totalOffers: number;
    totalEvents: number;
    totalCommunities: number;
    citiesCovered: number;
  } {
    const uniqueCities = new Set([
      ...DEMO_OFFERS.map(o => o.location.split(',')[1]?.trim()),
      ...DEMO_EVENTS.map(e => e.address.split(',')[1]?.trim()),
      ...DEMO_COMMUNITIES.map(c => c.location.split(',')[1]?.trim()),
    ]);

    return {
      totalOffers: DEMO_OFFERS.length,
      totalEvents: DEMO_EVENTS.length,
      totalCommunities: DEMO_COMMUNITIES.length,
      citiesCovered: uniqueCities.size,
    };
  }

  /**
   * Check if user has dismissed demo content notice
   */
  static hasDismissedDemoNotice(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('demo_content_dismissed') === 'true';
  }

  /**
   * Mark demo content notice as dismissed
   */
  static dismissDemoNotice(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('demo_content_dismissed', 'true');
    localStorage.setItem('demo_content_last_shown', new Date().toISOString());
  }

  /**
   * Reset demo notice (for testing)
   */
  static resetDemoNotice(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('demo_content_dismissed');
    localStorage.removeItem('demo_content_last_shown');
  }
}
