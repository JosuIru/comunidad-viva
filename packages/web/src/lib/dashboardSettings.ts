export interface DashboardWidget {
  id: string;
  name: string;
  icon: string;
  description: string;
  component: string; // Component name
  defaultEnabled: boolean;
  tab: 'discover' | 'activity' | 'community';
}

export const AVAILABLE_WIDGETS: Record<string, DashboardWidget> = {
  QUICK_ACTIONS: {
    id: 'quick_actions',
    name: 'Acciones Rápidas',
    icon: '⚡',
    description: 'Accesos directos a crear ofertas, eventos, etc.',
    component: 'QuickActions',
    defaultEnabled: true,
    tab: 'discover',
  },
  MAP_VIEW: {
    id: 'map_view',
    name: 'Vista de Mapa',
    icon: '🗺️',
    description: 'Mapa interactivo con recursos cercanos',
    component: 'Map',
    defaultEnabled: true,
    tab: 'discover',
  },
  COMMUNITY_STATS: {
    id: 'community_stats',
    name: 'Estadísticas',
    icon: '📊',
    description: 'Métricas de la comunidad',
    component: 'CommunityStats',
    defaultEnabled: true,
    tab: 'community',
  },
  DAILY_SEED: {
    id: 'daily_seed',
    name: 'Semilla Diaria',
    icon: '🌱',
    description: 'Gana créditos diarios',
    component: 'DailySeed',
    defaultEnabled: true,
    tab: 'community',
  },
  PERSONAL_FEED: {
    id: 'personal_feed',
    name: 'Mi Feed',
    icon: '📰',
    description: 'Tu actividad personal',
    component: 'Feed',
    defaultEnabled: true,
    tab: 'activity',
  },
  UPCOMING_EVENTS: {
    id: 'upcoming_events',
    name: 'Próximos Eventos',
    icon: '📅',
    description: 'Eventos de tu comunidad',
    component: 'UnifiedFeed',
    defaultEnabled: true,
    tab: 'community',
  },
};

class DashboardSettings {
  private static STORAGE_KEY = 'dashboard_settings';

  static getEnabledWidgets(): string[] {
    try {
      const settings = localStorage.getItem(this.STORAGE_KEY);
      if (!settings) {
        // Return defaults
        return Object.values(AVAILABLE_WIDGETS)
          .filter(widgetConfig => widgetConfig.defaultEnabled)
          .map(widgetConfig => widgetConfig.id);
      }
      return JSON.parse(settings);
    } catch {
      return Object.values(AVAILABLE_WIDGETS)
        .filter(widgetConfig => widgetConfig.defaultEnabled)
        .map(widgetConfig => widgetConfig.id);
    }
  }

  static setEnabledWidgets(widgetIds: string[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(widgetIds));
  }

  static toggleWidget(widgetId: string) {
    const enabledWidgets = this.getEnabledWidgets();
    const widgetIndex = enabledWidgets.indexOf(widgetId);

    if (widgetIndex > -1) {
      enabledWidgets.splice(widgetIndex, 1);
    } else {
      enabledWidgets.push(widgetId);
    }

    this.setEnabledWidgets(enabledWidgets);
  }

  static isWidgetEnabled(widgetId: string): boolean {
    return this.getEnabledWidgets().includes(widgetId);
  }

  static getWidgetsForTab(tab: 'discover' | 'activity' | 'community'): DashboardWidget[] {
    const enabledIds = this.getEnabledWidgets();
    return Object.values(AVAILABLE_WIDGETS)
      .filter(widgetConfig => widgetConfig.tab === tab && enabledIds.includes(widgetConfig.id));
  }
}

export default DashboardSettings;
