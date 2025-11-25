export interface OnboardingTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  minLevel: number; // Nivel mínimo requerido
  maxLevel: number; // Nivel máximo donde es relevante
  trigger: 'manual' | 'auto' | 'action'; // Cómo se activa
  action?: string; // Acción que lo dispara
  page?: string; // Página donde aparece
  once: boolean; // Mostrar solo una vez
}

export const ONBOARDING_TIPS: Record<string, OnboardingTip> = {
  // Nivel 1-2: Básicos
  FIRST_CREDITS: {
    id: 'first_credits',
    title: '¡Ganaste tus primeros créditos! 🎉',
    description: 'Los créditos se usan para intercambiar servicios y productos sin dinero. Gana más completando acciones.',
    icon: '💰',
    minLevel: 1,
    maxLevel: 2,
    trigger: 'action',
    action: 'earn_first_credits',
    once: true,
  },

  EXPLORE_MAP: {
    id: 'explore_map',
    title: 'Explora el mapa 🗺️',
    description: 'El mapa muestra recursos cerca de ti. Haz zoom y click en los marcadores para ver detalles.',
    icon: '🔍',
    minLevel: 1,
    maxLevel: 3,
    trigger: 'auto',
    page: 'homepage',
    once: true,
  },

  // Nivel 3-5: Intermedios
  USE_FILTERS: {
    id: 'use_filters',
    title: 'Usa los filtros avanzados 🎯',
    description: 'Combina filtros de tipo, comunidad y proximidad para encontrar exactamente lo que buscas.',
    icon: '🔍',
    minLevel: 3,
    maxLevel: 5,
    trigger: 'auto',
    page: 'homepage',
    once: true,
  },

  JOIN_COMMUNITY: {
    id: 'join_community',
    title: 'Únete a más comunidades 🏘️',
    description: 'Puedes participar en múltiples comunidades para ampliar tu red y acceder a más recursos.',
    icon: '🤝',
    minLevel: 3,
    maxLevel: 6,
    trigger: 'auto',
    page: 'communities',
    once: true,
  },

  // Nivel 5-8: Avanzados
  TIMEBANK_ADVANCED: {
    id: 'timebank_advanced',
    title: 'Maximiza tu Banco de Tiempo ⏰',
    description: 'Ofrece habilidades únicas para destacar. Tus habilidades más solicitadas aparecerán primero.',
    icon: '💡',
    minLevel: 5,
    maxLevel: 10,
    trigger: 'auto',
    page: 'timebank',
    once: true,
  },

  CREATE_PROJECT: {
    id: 'create_project',
    title: 'Crea un proyecto colaborativo 🚀',
    description: 'Los proyectos permiten coordinar esfuerzos de múltiples personas hacia un objetivo común.',
    icon: '🎯',
    minLevel: 5,
    maxLevel: 8,
    trigger: 'auto',
    page: 'homepage',
    once: true,
  },

  // Nivel 8+: Expertos
  BECOME_CM: {
    id: 'become_cm',
    title: '¿Quieres ser Community Manager? 👑',
    description: 'Con tu experiencia, podrías gestionar tu propia comunidad. Solicita permisos de CM.',
    icon: '⭐',
    minLevel: 8,
    maxLevel: 99,
    trigger: 'auto',
    page: 'profile',
    once: true,
  },

  ADVANCED_ANALYTICS: {
    id: 'advanced_analytics',
    title: 'Accede a tus analytics 📊',
    description: 'Revisa tus estadísticas detalladas: impacto, reputación y contribuciones a la comunidad.',
    icon: '📈',
    minLevel: 8,
    maxLevel: 99,
    trigger: 'auto',
    page: 'profile',
    once: true,
  },
};

class ProgressiveOnboardingManager {
  private static STORAGE_KEY = 'onboarding_tips_shown';
  private static LEVEL_KEY = 'user_level';

  static getUserLevel(): number {
    try {
      const level = localStorage.getItem(this.LEVEL_KEY);
      return level ? parseInt(level) : 1;
    } catch {
      return 1;
    }
  }

  static setUserLevel(level: number) {
    localStorage.setItem(this.LEVEL_KEY, level.toString());
  }

  static getShownTips(): string[] {
    try {
      const tips = localStorage.getItem(this.STORAGE_KEY);
      return tips ? JSON.parse(tips) : [];
    } catch {
      return [];
    }
  }

  static markTipShown(tipId: string) {
    const shown = this.getShownTips();
    if (!shown.includes(tipId)) {
      shown.push(tipId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shown));
    }
  }

  static getRelevantTips(page?: string, action?: string): OnboardingTip[] {
    const userLevel = this.getUserLevel();
    const shownTips = this.getShownTips();

    return Object.values(ONBOARDING_TIPS).filter(tip => {
      // Check level range
      if (userLevel < tip.minLevel || userLevel > tip.maxLevel) {
        return false;
      }

      // Check if already shown (for once tips)
      if (tip.once && shownTips.includes(tip.id)) {
        return false;
      }

      // Check page match
      if (page && tip.page && tip.page !== page) {
        return false;
      }

      // Check action match
      if (action && tip.action && tip.action !== action) {
        return false;
      }

      return true;
    });
  }

  static getNextTipForPage(page: string): OnboardingTip | null {
    const tips = this.getRelevantTips(page).filter(t => t.trigger === 'auto');
    return tips[0] || null;
  }

  static triggerActionTip(action: string): OnboardingTip | null {
    const tips = this.getRelevantTips(undefined, action).filter(t => t.trigger === 'action');
    return tips[0] || null;
  }
}

export default ProgressiveOnboardingManager;
