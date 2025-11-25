export type UserProfile = 'newbie' | 'consumer' | 'provider' | 'community_manager' | 'power_user';

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface AdaptiveTour {
  id: string;
  name: string;
  profile: UserProfile;
  page: string;
  steps: TourStep[];
  priority: number; // Higher = shown first
}

// Tours por perfil
export const ADAPTIVE_TOURS: Record<string, AdaptiveTour> = {
  // Newbie - Usuario nuevo que nunca usó la plataforma
  NEWBIE_HOMEPAGE: {
    id: 'newbie_homepage',
    name: 'Bienvenida Completa',
    profile: 'newbie',
    page: 'homepage',
    priority: 100,
    steps: [
      {
        target: '[data-tour="tabs"]',
        title: '¡Bienvenido! 👋',
        description: 'Te guiaremos paso a paso. Aquí tienes 3 secciones: Descubre (recursos), Mi Actividad (tu perfil) y Comunidad (estadísticas).',
        position: 'bottom',
      },
      {
        target: '[data-tour="quick-actions"]',
        title: 'Crea tu primer recurso ⚡',
        description: 'Empieza creando una oferta, evento o necesidad. ¡Es gratis y sin comisiones!',
        position: 'bottom',
      },
      {
        target: '[data-tour="map-toggle"]',
        title: 'Explora tu barrio 🗺️',
        description: 'Alterna entre mapa (vista geográfica) y feed (lista). Encuentra recursos cerca de ti.',
        position: 'bottom',
      },
      {
        target: '[data-tour="filters"]',
        title: 'Filtra lo que buscas 🔍',
        description: 'Usa filtros por tipo, comunidad y distancia para encontrar exactamente lo que necesitas.',
        position: 'left',
      },
    ],
  },

  // Consumer - Usuario que principalmente busca/consume
  CONSUMER_HOMEPAGE: {
    id: 'consumer_homepage',
    name: 'Tour para Consumidores',
    profile: 'consumer',
    page: 'homepage',
    priority: 80,
    steps: [
      {
        target: '[data-tour="map-toggle"]',
        title: 'Encuentra lo que buscas 🔍',
        description: 'Usa el mapa para ver recursos cerca de ti o el feed para explorar todo.',
        position: 'bottom',
      },
      {
        target: '[data-tour="filters"]',
        title: 'Filtra por categoría 🎯',
        description: 'Refina tu búsqueda por tipo de recurso, comunidad o proximidad.',
        position: 'left',
      },
    ],
  },

  // Provider - Usuario que principalmente crea/ofrece
  PROVIDER_HOMEPAGE: {
    id: 'provider_homepage',
    name: 'Tour para Proveedores',
    profile: 'provider',
    page: 'homepage',
    priority: 80,
    steps: [
      {
        target: '[data-tour="quick-actions"]',
        title: 'Publica tus recursos ⚡',
        description: 'Desde aquí puedes crear ofertas, eventos, proyectos y más. ¡Aumenta tu visibilidad!',
        position: 'bottom',
      },
      {
        target: '[data-tour="tabs"]',
        title: 'Gestiona tu actividad 📊',
        description: 'Ve a "Mi Actividad" para ver tus publicaciones, interacciones y estadísticas.',
        position: 'bottom',
      },
    ],
  },

  // Community Manager - Gestor de comunidad
  CM_HOMEPAGE: {
    id: 'cm_homepage',
    name: 'Tour para Community Managers',
    profile: 'community_manager',
    page: 'homepage',
    priority: 90,
    steps: [
      {
        target: '[data-tour="tabs"]',
        title: 'Panel de Control Comunitario 🎯',
        description: 'Como gestor, tienes acceso a herramientas especiales. La pestaña "Comunidad" es tu centro de control.',
        position: 'bottom',
      },
      {
        target: '[data-tour="quick-actions"]',
        title: 'Crea Eventos Masivos 📅',
        description: 'Organiza eventos, proyectos y actividades para toda la comunidad.',
        position: 'bottom',
      },
    ],
  },

  // Power User - Usuario experimentado
  POWER_USER_HOMEPAGE: {
    id: 'power_user_homepage',
    name: 'Tour Avanzado',
    profile: 'power_user',
    page: 'homepage',
    priority: 50,
    steps: [
      {
        target: '[data-tour="filters"]',
        title: 'Filtros Avanzados 🚀',
        description: 'Combina múltiples filtros para búsquedas precisas. Prueba filtrar por proximidad + tipo + comunidad.',
        position: 'left',
      },
    ],
  },
};

class AdaptiveTourManager {
  private static STORAGE_KEY = 'adaptive_tours_completed';
  private static PROFILE_KEY = 'user_profile';

  // Detecta el perfil del usuario basado en su comportamiento
  static detectUserProfile(): UserProfile {
    const profile = localStorage.getItem(this.PROFILE_KEY);
    if (profile) return profile as UserProfile;

    // Lógica de detección (puede mejorarse con analytics)
    const badges = localStorage.getItem('user_badges');
    const analytics = localStorage.getItem('analytics_events');

    // Por defecto, usuario nuevo
    if (!badges && !analytics) return 'newbie';

    // TODO: Implementar lógica de detección más sofisticada
    // basada en acciones del usuario (crear vs consumir)

    return 'newbie';
  }

  static setUserProfile(profile: UserProfile) {
    localStorage.setItem(this.PROFILE_KEY, profile);
  }

  static getCompletedTours(): string[] {
    try {
      const tours = localStorage.getItem(this.STORAGE_KEY);
      return tours ? JSON.parse(tours) : [];
    } catch {
      return [];
    }
  }

  static markTourCompleted(tourId: string) {
    const completed = this.getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completed));
    }
  }

  static getNextTourForProfile(page: string = 'homepage'): AdaptiveTour | null {
    const profile = this.detectUserProfile();
    const completed = this.getCompletedTours();

    // Encuentra tours disponibles para el perfil y página
    const availableTours = Object.values(ADAPTIVE_TOURS)
      .filter(tour =>
        tour.profile === profile &&
        tour.page === page &&
        !completed.includes(tour.id)
      )
      .sort((a, b) => b.priority - a.priority);

    return availableTours[0] || null;
  }

  static shouldShowTour(tourId: string): boolean {
    const completed = this.getCompletedTours();
    return !completed.includes(tourId);
  }
}

export default AdaptiveTourManager;
