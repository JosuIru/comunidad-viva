// Community Onboarding Packs Configuration
// Defines pre-configured setups for organized communities

export type OrganizedCommunityType =
  | 'CONSUMER_GROUP'
  | 'HOUSING_COOP'
  | 'COMMUNITY_BAR'
  | 'SOCIAL_CENTER'
  | 'WORKER_COOP'
  | 'NEIGHBORHOOD_ASSOCIATION'
  | 'TRANSITION_TOWN'
  | 'ECOVILLAGE'
  | 'SOLIDARITY_NETWORK'
  | 'CULTURAL_SPACE';

export interface CommunityPackConfig {
  type: OrganizedCommunityType;
  name: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  color: string;
  targetAudience: string[];
  features: string[];
  setupSteps: SetupStep[];
  metrics: MetricConfig[];
  successStories?: SuccessStory[];
}

export interface SetupStep {
  key: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  required: boolean;
}

export interface MetricConfig {
  key: string;
  name: string;
  unit: string;
  icon: string;
  description: string;
  targetValue?: number;
}

export interface SuccessStory {
  communityName: string;
  location: string;
  members: number;
  monthsActive: number;
  keyMetric: string;
  quote: string;
  author: string;
}

// ============= CONSUMER GROUP PACK =============

export const CONSUMER_GROUP_PACK: CommunityPackConfig = {
  type: 'CONSUMER_GROUP',
  name: 'Grupo de Consumo',
  shortDescription: 'Compras colectivas de productos locales y ecológicos',
  fullDescription:
    'Organiza compras colectivas, gestiona pedidos, distribuye costes y conecta con productores locales. Ideal para grupos que quieren acceder a productos ecológicos de calidad a precios justos.',
  icon: '🥬',
  color: 'green',
  targetAudience: [
    'Grupos de consumo ecológico',
    'Cooperativas de consumidores',
    'Redes de consumo responsable',
    'Grupos de compra colectiva',
  ],
  features: [
    '📦 Gestión de pedidos colectivos',
    '💰 Calculadora de distribución de costes',
    '🚚 Coordinación de recogida y reparto',
    '🌾 Directorio de productores locales',
    '⭐ Sistema de evaluación de calidad',
    '📊 Estadísticas de ahorro colectivo',
    '📅 Calendario de pedidos recurrentes',
    '💬 Chat grupal para coordinación',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información Básica',
      description: 'Nombre, ubicación y descripción de tu grupo',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'invite_members',
      title: 'Invitar Primeros Miembros',
      description: 'Añade a las personas de tu grupo',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'configure_orders',
      title: 'Configurar Sistema de Pedidos',
      description: 'Define frecuencia, productos y proveedores',
      estimatedMinutes: 15,
      required: true,
    },
    {
      key: 'set_pickup_point',
      title: 'Punto de Recogida',
      description: 'Establece dónde recoger los pedidos',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'first_order',
      title: 'Primer Pedido',
      description: 'Crea tu primer pedido colectivo',
      estimatedMinutes: 10,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'monthly_savings',
      name: 'Ahorro Mensual',
      unit: 'EUR',
      icon: '💰',
      description: 'Dinero ahorrado vs. compra individual',
      targetValue: 500,
    },
    {
      key: 'active_members',
      name: 'Miembros Activos',
      unit: 'personas',
      icon: '👥',
      description: 'Personas que participan activamente',
      targetValue: 20,
    },
    {
      key: 'orders_completed',
      name: 'Pedidos Completados',
      unit: 'pedidos',
      icon: '📦',
      description: 'Total de pedidos colectivos realizados',
    },
    {
      key: 'local_producers',
      name: 'Productores Locales',
      unit: 'productores',
      icon: '🌾',
      description: 'Productores con los que trabajas',
      targetValue: 10,
    },
    {
      key: 'kg_local_food',
      name: 'Comida Local (kg)',
      unit: 'kg',
      icon: '🥕',
      description: 'Kilogramos de comida local consumida',
    },
    {
      key: 'co2_avoided',
      name: 'CO2 Evitado',
      unit: 'kg',
      icon: '🌱',
      description: 'CO2 ahorrado por consumo local',
    },
  ],
  successStories: [
    {
      communityName: 'Grupo Consumo Zurriola',
      location: 'Donostia / San Sebastián',
      members: 67,
      monthsActive: 18,
      keyMetric: '€8,040 ahorrados en el último año',
      quote:
        'Truk nos permitió crecer de 15 a 67 familias sin perder la cercanía. Ahora coordinamos 4 pedidos mensuales y trabajamos con 12 productores locales.',
      author: 'Amaia L., coordinadora',
    },
  ],
};

// ============= HOUSING COOP PACK =============

export const HOUSING_COOP_PACK: CommunityPackConfig = {
  type: 'HOUSING_COOP',
  name: 'Cooperativa de Vivienda / Mancomunidad',
  shortDescription: 'Gestión de espacios compartidos y recursos comunes',
  fullDescription:
    'Herramientas para cooperativas de vivienda y mancomunidades: gestión de espacios comunes, banco de herramientas, mantenimiento compartido y decisiones colectivas.',
  icon: '🏠',
  color: 'blue',
  targetAudience: [
    'Cooperativas de vivienda',
    'Mancomunidades',
    'Cohousing / Covivienda',
    'Comunidades de vecinos organizadas',
  ],
  features: [
    '🔧 Banco de herramientas compartidas',
    '📅 Reserva de espacios comunes',
    '💰 Gestión de gastos comunes',
    '🗳️ Votaciones y propuestas',
    '📋 Tablón de anuncios',
    '⏰ Banco de tiempo entre vecinos',
    '🛠️ Coordinación de mantenimiento',
    '📊 Dashboard de administración',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información de la Cooperativa',
      description: 'Datos básicos de tu cooperativa o mancomunidad',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'add_units',
      title: 'Añadir Viviendas/Unidades',
      description: 'Registra las viviendas de la comunidad',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'common_spaces',
      title: 'Espacios Comunes',
      description: 'Define espacios reservables (lavandería, sala, etc.)',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'tool_bank',
      title: 'Banco de Herramientas',
      description: 'Catálogo de herramientas compartidas',
      estimatedMinutes: 15,
      required: false,
    },
    {
      key: 'governance',
      title: 'Sistema de Gobernanza',
      description: 'Configura votaciones y propuestas',
      estimatedMinutes: 10,
      required: true,
    },
  ],
  metrics: [
    {
      key: 'tool_uses',
      name: 'Usos de Herramientas',
      unit: 'usos',
      icon: '🔧',
      description: 'Veces que se usaron herramientas compartidas',
    },
    {
      key: 'savings_per_unit',
      name: 'Ahorro por Vivienda',
      unit: 'EUR/año',
      icon: '💰',
      description: 'Ahorro estimado por no comprar herramientas',
      targetValue: 800,
    },
    {
      key: 'space_bookings',
      name: 'Reservas de Espacios',
      unit: 'reservas',
      icon: '📅',
      description: 'Uso de espacios comunes',
    },
    {
      key: 'participation_rate',
      name: 'Tasa de Participación',
      unit: '%',
      icon: '🗳️',
      description: 'Porcentaje de vecinos que participan activamente',
      targetValue: 75,
    },
  ],
};

// ============= COMMUNITY BAR PACK =============

export const COMMUNITY_BAR_PACK: CommunityPackConfig = {
  type: 'COMMUNITY_BAR',
  name: 'Bar Comunitario',
  shortDescription: 'Hub social con economía local y eventos',
  fullDescription:
    'Gestiona tu bar comunitario o cooperativo: eventos, proveedores locales, moneda local, sistema de socios y actividades culturales.',
  icon: '☕',
  color: 'amber',
  targetAudience: [
    'Bares comunitarios',
    'Bares cooperativos',
    'Espacios culturales con bar',
    'Centros sociales',
  ],
  features: [
    '📅 Gestión de eventos y actividades',
    '🍺 Proveedores locales',
    '💳 Sistema de moneda local',
    '👥 Gestión de socios',
    '🎫 Venta de entradas',
    '📊 Dashboard de gestión',
    '💬 Comunidad de clientes habituales',
    '🎨 Calendario cultural',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información del Bar',
      description: 'Nombre, ubicación, horarios',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'setup_memberships',
      title: 'Sistema de Socios',
      description: 'Define tipos de socios y cuotas',
      estimatedMinutes: 10,
      required: false,
    },
    {
      key: 'local_suppliers',
      title: 'Proveedores Locales',
      description: 'Añade productores con los que trabajas',
      estimatedMinutes: 15,
      required: false,
    },
    {
      key: 'first_event',
      title: 'Primer Evento',
      description: 'Crea tu primer evento o actividad',
      estimatedMinutes: 10,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'events_hosted',
      name: 'Eventos Realizados',
      unit: 'eventos',
      icon: '🎪',
      description: 'Actividades organizadas',
    },
    {
      key: 'active_members',
      name: 'Socios Activos',
      unit: 'socios',
      icon: '👥',
      description: 'Socios que participan regularmente',
    },
    {
      key: 'local_currency',
      name: 'Moneda Local Circulando',
      unit: 'EUR',
      icon: '💳',
      description: 'Valor en moneda local en circulación',
    },
    {
      key: 'local_suppliers',
      name: 'Proveedores Locales',
      unit: 'proveedores',
      icon: '🌾',
      description: 'Productores locales con los que trabajas',
    },
  ],
};

// ============= SOCIAL CENTER PACK =============

export const SOCIAL_CENTER_PACK: CommunityPackConfig = {
  type: 'SOCIAL_CENTER',
  name: 'Centro Social',
  shortDescription: 'Espacio autogestionado de encuentro y activismo',
  fullDescription:
    'Organiza tu centro social, ateneo o espacio autogestionado: gestiona asambleas, talleres, campañas, recursos compartidos y actividades político-culturales.',
  icon: '🏛️',
  color: 'purple',
  targetAudience: [
    'Centros sociales okupados',
    'Ateneos libertarios',
    'Espacios autogestionados',
    'Casas del pueblo',
  ],
  features: [
    '📢 Gestión de campañas y movilizaciones',
    '🗣️ Sistema de asambleas',
    '📚 Biblioteca y archivo',
    '🎓 Talleres y formación',
    '🛠️ Herramientas compartidas',
    '💬 Grupos de trabajo',
    '📅 Calendario de actividades',
    '🤝 Redes de apoyo mutuo',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información del Centro',
      description: 'Nombre, ubicación y principios del espacio',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'working_groups',
      title: 'Grupos de Trabajo',
      description: 'Define comisiones y áreas de trabajo',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'assembly_system',
      title: 'Sistema de Asambleas',
      description: 'Configura periodicidad y metodología',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'resources',
      title: 'Recursos Compartidos',
      description: 'Catálogo de materiales y espacios',
      estimatedMinutes: 15,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'assemblies_held',
      name: 'Asambleas Realizadas',
      unit: 'asambleas',
      icon: '🗣️',
      description: 'Asambleas plenarias celebradas',
    },
    {
      key: 'active_campaigns',
      name: 'Campañas Activas',
      unit: 'campañas',
      icon: '📢',
      description: 'Movilizaciones y campañas en curso',
    },
    {
      key: 'workshop_hours',
      name: 'Horas de Talleres',
      unit: 'horas',
      icon: '🎓',
      description: 'Horas de formación impartidas',
    },
    {
      key: 'participation_rate',
      name: 'Tasa de Participación',
      unit: '%',
      icon: '👥',
      description: 'Porcentaje de personas activas',
      targetValue: 60,
    },
  ],
};

// ============= WORKER COOP PACK =============

export const WORKER_COOP_PACK: CommunityPackConfig = {
  type: 'WORKER_COOP',
  name: 'Cooperativa de Trabajo',
  shortDescription: 'Empresa autogestionada por sus trabajadores',
  fullDescription:
    'Gestiona tu cooperativa de trabajo: decisiones colectivas, reparto de beneficios, proyectos, clientes y recursos compartidos.',
  icon: '👷',
  color: 'blue',
  targetAudience: [
    'Cooperativas de trabajo asociado',
    'Empresas autogestionadas',
    'Colectivos profesionales',
    'Sociedades laborales',
  ],
  features: [
    '📊 Dashboard de gestión',
    '💰 Reparto de beneficios',
    '🗳️ Decisiones colectivas',
    '📁 Gestión de proyectos',
    '👥 Directorio de socios trabajadores',
    '⏰ Registro de horas',
    '📈 Métricas de sostenibilidad',
    '🤝 Intercooperación',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información de la Cooperativa',
      description: 'Datos básicos y sector de actividad',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'add_members',
      title: 'Socios Trabajadores',
      description: 'Añade a los miembros de la cooperativa',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'governance',
      title: 'Sistema de Gobernanza',
      description: 'Configura votaciones y toma de decisiones',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'projects',
      title: 'Proyectos y Clientes',
      description: 'Gestión de proyectos y cartera de clientes',
      estimatedMinutes: 15,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'active_projects',
      name: 'Proyectos Activos',
      unit: 'proyectos',
      icon: '📁',
      description: 'Proyectos en curso',
    },
    {
      key: 'revenue_per_member',
      name: 'Facturación por Socio',
      unit: 'EUR/mes',
      icon: '💰',
      description: 'Ingresos medios por socio trabajador',
      targetValue: 2000,
    },
    {
      key: 'participation_rate',
      name: 'Participación en Decisiones',
      unit: '%',
      icon: '🗳️',
      description: 'Socios que votan en las decisiones',
      targetValue: 80,
    },
    {
      key: 'client_satisfaction',
      name: 'Satisfacción de Clientes',
      unit: '/5',
      icon: '⭐',
      description: 'Valoración media de clientes',
      targetValue: 4.5,
    },
  ],
};

// ============= NEIGHBORHOOD ASSOCIATION PACK =============

export const NEIGHBORHOOD_ASSOCIATION_PACK: CommunityPackConfig = {
  type: 'NEIGHBORHOOD_ASSOCIATION',
  name: 'Asociación de Vecinos',
  shortDescription: 'Organización vecinal para mejorar el barrio',
  fullDescription:
    'Coordina tu asociación de vecinos: propuestas vecinales, gestión de quejas, eventos comunitarios, mejoras del barrio y participación ciudadana.',
  icon: '🏘️',
  color: 'orange',
  targetAudience: [
    'Asociaciones de vecinos',
    'Comunidades de barrio',
    'Juntas vecinales',
    'Plataformas ciudadanas',
  ],
  features: [
    '📝 Buzón de propuestas y quejas',
    '🗳️ Votaciones vecinales',
    '📅 Calendario de eventos del barrio',
    '🏗️ Seguimiento de obras y mejoras',
    '📢 Comunicados y avisos',
    '🌳 Proyectos de mejora urbana',
    '💬 Foros de discusión',
    '📊 Estadísticas de participación',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información de la Asociación',
      description: 'Nombre, zona del barrio, contacto',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'boundaries',
      title: 'Delimitación del Barrio',
      description: 'Define el área geográfica',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'invite_neighbors',
      title: 'Invitar Vecinos',
      description: 'Difusión y primeros miembros',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'first_initiatives',
      title: 'Primeras Iniciativas',
      description: 'Propuestas y proyectos iniciales',
      estimatedMinutes: 15,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'active_members',
      name: 'Vecinos Activos',
      unit: 'vecinos',
      icon: '👥',
      description: 'Vecinos que participan regularmente',
    },
    {
      key: 'proposals_implemented',
      name: 'Propuestas Implementadas',
      unit: 'propuestas',
      icon: '✅',
      description: 'Iniciativas vecinales llevadas a cabo',
    },
    {
      key: 'events_organized',
      name: 'Eventos Organizados',
      unit: 'eventos',
      icon: '🎉',
      description: 'Actividades comunitarias realizadas',
    },
    {
      key: 'neighborhood_satisfaction',
      name: 'Satisfacción con el Barrio',
      unit: '/10',
      icon: '⭐',
      description: 'Valoración de la calidad de vida',
      targetValue: 8,
    },
  ],
};

// ============= TRANSITION TOWN PACK =============

export const TRANSITION_TOWN_PACK: CommunityPackConfig = {
  type: 'TRANSITION_TOWN',
  name: 'Pueblo en Transición',
  shortDescription: 'Transición hacia la sostenibilidad local',
  fullDescription:
    'Coordina iniciativas de transición: huertos comunitarios, energía renovable, economía local, grupos de trabajo y resiliencia comunitaria.',
  icon: '🔄',
  color: 'green',
  targetAudience: [
    'Movimientos de transición',
    'Iniciativas de resiliencia',
    'Pueblos sostenibles',
    'Comunidades en transición',
  ],
  features: [
    '🌱 Huertos y jardines comunitarios',
    '⚡ Proyectos de energía renovable',
    '🛒 Mercados y moneda local',
    '🚴 Movilidad sostenible',
    '♻️ Gestión de residuos',
    '🏘️ Grupos de trabajo temáticos',
    '📚 Biblioteca de saberes',
    '📊 Métricas de sostenibilidad',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información de la Iniciativa',
      description: 'Nombre, localidad, visión',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'working_groups',
      title: 'Grupos de Trabajo',
      description: 'Define áreas: energía, alimentación, etc.',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'baseline',
      title: 'Diagnóstico Inicial',
      description: 'Situación actual de sostenibilidad',
      estimatedMinutes: 15,
      required: true,
    },
    {
      key: 'action_plan',
      title: 'Plan de Acción',
      description: 'Proyectos y cronograma',
      estimatedMinutes: 20,
      required: true,
    },
  ],
  metrics: [
    {
      key: 'local_food_percentage',
      name: 'Alimentación Local',
      unit: '%',
      icon: '🌾',
      description: 'Porcentaje de alimentos de producción local',
      targetValue: 40,
    },
    {
      key: 'renewable_energy',
      name: 'Energía Renovable',
      unit: 'kWh',
      icon: '⚡',
      description: 'Energía renovable generada',
    },
    {
      key: 'co2_avoided',
      name: 'CO2 Evitado',
      unit: 'toneladas',
      icon: '🌍',
      description: 'Emisiones evitadas por iniciativas',
    },
    {
      key: 'active_participants',
      name: 'Participantes Activos',
      unit: 'personas',
      icon: '👥',
      description: 'Personas involucradas en proyectos',
    },
  ],
};

// ============= ECOVILLAGE PACK =============

export const ECOVILLAGE_PACK: CommunityPackConfig = {
  type: 'ECOVILLAGE',
  name: 'Ecoaldea',
  shortDescription: 'Comunidad intencional sostenible',
  fullDescription:
    'Gestiona tu ecoaldea o comunidad intencional: viviendas, terrenos compartidos, economía interna, toma de decisiones colectiva y vida sostenible.',
  icon: '🌱',
  color: 'green',
  targetAudience: [
    'Ecoaldeas',
    'Comunidades intencionales',
    'Proyectos de co-housing ecológico',
    'Comunidades rurales sostenibles',
  ],
  features: [
    '🏡 Gestión de viviendas y terrenos',
    '🌾 Coordinación de cultivos',
    '💰 Economía interna',
    '🗣️ Sociocracia y consenso',
    '♻️ Gestión de residuos y energía',
    '👥 Membresías y proceso de entrada',
    '📅 Turnos y responsabilidades',
    '📊 Métricas de sostenibilidad',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información de la Ecoaldea',
      description: 'Nombre, ubicación, principios',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'land_houses',
      title: 'Terrenos y Viviendas',
      description: 'Mapea espacios y asignaciones',
      estimatedMinutes: 15,
      required: true,
    },
    {
      key: 'governance',
      title: 'Sistema de Gobernanza',
      description: 'Método de toma de decisiones',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'economy',
      title: 'Economía Interna',
      description: 'Sistema de contribuciones y recursos',
      estimatedMinutes: 15,
      required: true,
    },
  ],
  metrics: [
    {
      key: 'food_self_sufficiency',
      name: 'Autosuficiencia Alimentaria',
      unit: '%',
      icon: '🥕',
      description: 'Porcentaje de alimentos propios',
      targetValue: 50,
    },
    {
      key: 'energy_self_sufficiency',
      name: 'Autosuficiencia Energética',
      unit: '%',
      icon: '⚡',
      description: 'Porcentaje de energía autogenerada',
      targetValue: 80,
    },
    {
      key: 'resident_satisfaction',
      name: 'Satisfacción de Residentes',
      unit: '/10',
      icon: '😊',
      description: 'Bienestar y satisfacción con la vida comunitaria',
      targetValue: 8,
    },
    {
      key: 'ecological_footprint',
      name: 'Huella Ecológica',
      unit: 'hectáreas/persona',
      icon: '🌍',
      description: 'Impacto ambiental per cápita',
      targetValue: 1.5,
    },
  ],
};

// ============= SOLIDARITY NETWORK PACK =============

export const SOLIDARITY_NETWORK_PACK: CommunityPackConfig = {
  type: 'SOLIDARITY_NETWORK',
  name: 'Red de Apoyo Mutuo',
  shortDescription: 'Red solidaria de ayuda vecinal',
  fullDescription:
    'Organiza tu red de apoyo mutuo: gestión de necesidades, ofertas de ayuda, recursos compartidos, banco de tiempo y economía del cuidado.',
  icon: '🤝',
  color: 'pink',
  targetAudience: [
    'Redes de apoyo mutuo',
    'Redes de cuidados',
    'Grupos de ayuda vecinal',
    'Comunidades solidarias',
  ],
  features: [
    '🆘 Mapa de necesidades',
    '🎁 Ofertas de ayuda',
    '⏰ Banco de tiempo',
    '📦 Recursos compartidos',
    '🍲 Comidas comunitarias',
    '👥 Matching de necesidades y ofertas',
    '💬 Chat de coordinación',
    '📊 Métricas de impacto social',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información de la Red',
      description: 'Nombre, área de actuación, contacto',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'invite_members',
      title: 'Invitar Miembros',
      description: 'Difusión y primeras incorporaciones',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'needs_offers',
      title: 'Necesidades y Ofertas',
      description: 'Primeras necesidades y ofertas de ayuda',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'timebank',
      title: 'Banco de Tiempo',
      description: 'Configurar intercambio de servicios',
      estimatedMinutes: 10,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'needs_covered',
      name: 'Necesidades Cubiertas',
      unit: 'necesidades',
      icon: '✅',
      description: 'Peticiones de ayuda resueltas',
    },
    {
      key: 'hours_exchanged',
      name: 'Horas Intercambiadas',
      unit: 'horas',
      icon: '⏰',
      description: 'Tiempo de ayuda mutua',
    },
    {
      key: 'active_helpers',
      name: 'Personas Solidarias',
      unit: 'personas',
      icon: '🤝',
      description: 'Miembros que han ofrecido ayuda',
    },
    {
      key: 'community_bonds',
      name: 'Vínculos Creados',
      unit: 'conexiones',
      icon: '💞',
      description: 'Nuevas relaciones de ayuda mutua',
    },
  ],
};

// ============= CULTURAL SPACE PACK =============

export const CULTURAL_SPACE_PACK: CommunityPackConfig = {
  type: 'CULTURAL_SPACE',
  name: 'Espacio Cultural',
  shortDescription: 'Centro cultural autogestionado',
  fullDescription:
    'Gestiona tu espacio cultural: programación de actividades, reservas de salas, grupos de trabajo, eventos, talleres y difusión cultural.',
  icon: '🎨',
  color: 'purple',
  targetAudience: [
    'Centros culturales',
    'Salas de ensayo',
    'Espacios de creación',
    'Centros cívicos autogestionados',
  ],
  features: [
    '📅 Calendario de programación',
    '🎭 Gestión de eventos y talleres',
    '🏢 Reserva de salas y espacios',
    '👥 Gestión de colectivos usuarios',
    '🎫 Venta de entradas',
    '📢 Difusión y comunicación',
    '💰 Gestión económica',
    '📊 Estadísticas de uso',
  ],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información del Espacio',
      description: 'Nombre, ubicación, disciplinas artísticas',
      estimatedMinutes: 5,
      required: true,
    },
    {
      key: 'spaces',
      title: 'Salas y Espacios',
      description: 'Define salas disponibles y equipamiento',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'collectives',
      title: 'Colectivos Usuarios',
      description: 'Grupos y artistas que usan el espacio',
      estimatedMinutes: 10,
      required: true,
    },
    {
      key: 'programming',
      title: 'Programación Cultural',
      description: 'Primeros eventos y actividades',
      estimatedMinutes: 15,
      required: false,
    },
  ],
  metrics: [
    {
      key: 'events_hosted',
      name: 'Eventos Realizados',
      unit: 'eventos',
      icon: '🎭',
      description: 'Actividades culturales organizadas',
    },
    {
      key: 'space_occupancy',
      name: 'Ocupación de Salas',
      unit: '%',
      icon: '📊',
      description: 'Porcentaje de uso de los espacios',
      targetValue: 70,
    },
    {
      key: 'attendees',
      name: 'Asistentes',
      unit: 'personas',
      icon: '👥',
      description: 'Público que participa en actividades',
    },
    {
      key: 'cultural_diversity',
      name: 'Diversidad Cultural',
      unit: 'disciplinas',
      icon: '🎨',
      description: 'Variedad de expresiones artísticas',
    },
  ],
};

// Main registry
export const COMMUNITY_PACKS: Record<OrganizedCommunityType, CommunityPackConfig> = {
  CONSUMER_GROUP: CONSUMER_GROUP_PACK,
  HOUSING_COOP: HOUSING_COOP_PACK,
  COMMUNITY_BAR: COMMUNITY_BAR_PACK,
  SOCIAL_CENTER: SOCIAL_CENTER_PACK,
  WORKER_COOP: WORKER_COOP_PACK,
  NEIGHBORHOOD_ASSOCIATION: NEIGHBORHOOD_ASSOCIATION_PACK,
  TRANSITION_TOWN: TRANSITION_TOWN_PACK,
  ECOVILLAGE: ECOVILLAGE_PACK,
  SOLIDARITY_NETWORK: SOLIDARITY_NETWORK_PACK,
  CULTURAL_SPACE: CULTURAL_SPACE_PACK,
};

// Get pack by type
export function getCommunityPack(type: OrganizedCommunityType): CommunityPackConfig | undefined {
  return COMMUNITY_PACKS[type];
}

// Get all defined packs
export function getAllCommunityPacks(): CommunityPackConfig[] {
  return Object.values(COMMUNITY_PACKS).filter((pack) => pack.name);
}
