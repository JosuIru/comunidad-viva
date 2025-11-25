export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'onboarding' | 'social' | 'economy' | 'community' | 'special';
  requirement: string;
  points: number;
}

export const BADGES: Record<string, Badge> = {
  EXPLORER: {
    id: 'explorer',
    name: 'Explorador',
    icon: '🧭',
    description: 'Completaste el tour de bienvenida',
    category: 'onboarding',
    requirement: 'tour_completed',
    points: 10,
  },
  FIRST_OFFER: {
    id: 'first_offer',
    name: 'Primer Vendedor',
    icon: '🛍️',
    description: 'Creaste tu primera oferta',
    category: 'economy',
    requirement: 'create_first_offer',
    points: 20,
  },
  FIRST_EVENT: {
    id: 'first_event',
    name: 'Organizador',
    icon: '📅',
    description: 'Organizaste tu primer evento',
    category: 'social',
    requirement: 'create_first_event',
    points: 20,
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Mariposa Social',
    icon: '🦋',
    description: 'Participaste en 5 eventos',
    category: 'social',
    requirement: 'attend_5_events',
    points: 50,
  },
  HELPFUL_NEIGHBOR: {
    id: 'helpful_neighbor',
    name: 'Vecino Útil',
    icon: '🤝',
    description: 'Ayudaste en 10 necesidades',
    category: 'community',
    requirement: 'help_10_needs',
    points: 100,
  },
  TIME_BANKER: {
    id: 'time_banker',
    name: 'Banquero de Tiempo',
    icon: '⏰',
    description: 'Intercambiaste 20 horas en el banco de tiempo',
    category: 'economy',
    requirement: 'timebank_20_hours',
    points: 75,
  },
  COMMUNITY_CHAMPION: {
    id: 'community_champion',
    name: 'Campeón Comunitario',
    icon: '🏆',
    description: 'Alcanzaste 500 créditos acumulados',
    category: 'special',
    requirement: 'earn_500_credits',
    points: 150,
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Madrugador',
    icon: '🌅',
    description: 'Completaste 30 semillas diarias',
    category: 'community',
    requirement: 'complete_30_daily_seeds',
    points: 100,
  },
  SUPER_SHARER: {
    id: 'super_sharer',
    name: 'Súper Compartidor',
    icon: '✨',
    description: 'Compartiste 50 recursos',
    category: 'economy',
    requirement: 'share_50_resources',
    points: 120,
  },
  MASTER_NETWORKER: {
    id: 'master_networker',
    name: 'Maestro de Redes',
    icon: '🌐',
    description: 'Conectaste con 100 vecinos',
    category: 'social',
    requirement: 'connect_100_neighbors',
    points: 200,
  },
};

class BadgeManager {
  private static STORAGE_KEY = 'user_badges';

  static getUserBadges(): string[] {
    try {
      const badges = localStorage.getItem(this.STORAGE_KEY);
      return badges ? JSON.parse(badges) : [];
    } catch {
      return [];
    }
  }

  static awardBadge(badgeId: string): Badge | null {
    const badge = BADGES[badgeId.toUpperCase()];
    if (!badge) return null;

    const currentBadges = this.getUserBadges();
    if (currentBadges.includes(badge.id)) {
      return null; // Already has badge
    }

    currentBadges.push(badge.id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentBadges));

    return badge;
  }

  static hasBadge(badgeId: string): boolean {
    const badges = this.getUserBadges();
    return badges.includes(badgeId);
  }

  static getBadgeProgress(): { earned: number; total: number; percentage: number } {
    const earned = this.getUserBadges().length;
    const total = Object.keys(BADGES).length;
    return {
      earned,
      total,
      percentage: Math.round((earned / total) * 100),
    };
  }

  static getTotalPoints(): number {
    const userBadges = this.getUserBadges();
    return userBadges.reduce((total, badgeId) => {
      const badge = Object.values(BADGES).find(b => b.id === badgeId);
      return total + (badge?.points || 0);
    }, 0);
  }
}

export default BadgeManager;
