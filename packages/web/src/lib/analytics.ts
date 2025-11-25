/**
 * Simple analytics utility for tracking user interactions
 * Stores events in localStorage for now, can be extended to send to backend
 */

export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  userId?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private static STORAGE_KEY = 'analytics_events';
  private static MAX_EVENTS = 1000; // Keep last 1000 events

  /**
   * Track an event
   */
  static track(event: string, properties?: Record<string, any>) {
    try {
      const userId = localStorage.getItem('user_id');

      const analyticsEvent: AnalyticsEvent = {
        event,
        timestamp: Date.now(),
        userId: userId || undefined,
        properties,
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics:', analyticsEvent);
      }

      // Store in localStorage
      const events = this.getEvents();
      events.push(analyticsEvent);

      // Keep only last MAX_EVENTS
      const trimmedEvents = events.slice(-this.MAX_EVENTS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedEvents));

      // TODO: Send to backend analytics service
      // this.sendToBackend(analyticsEvent);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Get all stored events
   */
  static getEvents(): AnalyticsEvent[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get events for a specific event name
   */
  static getEventsByName(eventName: string): AnalyticsEvent[] {
    return this.getEvents().filter((e) => e.event === eventName);
  }

  /**
   * Get events for a specific time range
   */
  static getEventsByTimeRange(startTime: number, endTime: number): AnalyticsEvent[] {
    return this.getEvents().filter(
      (e) => e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Get analytics summary
   */
  static getSummary() {
    const events = this.getEvents();
    const eventCounts: Record<string, number> = {};

    events.forEach((e) => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      eventCounts,
      firstEvent: events[0]?.timestamp,
      lastEvent: events[events.length - 1]?.timestamp,
    };
  }

  /**
   * Clear all events
   */
  static clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Predefined event names for consistency
export const ANALYTICS_EVENTS = {
  // Tour events
  TOUR_STARTED: 'tour_started',
  TOUR_COMPLETED: 'tour_completed',
  TOUR_SKIPPED: 'tour_skipped',
  TOUR_STEP_VIEWED: 'tour_step_viewed',

  // Feedback events
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  FEEDBACK_SKIPPED: 'feedback_skipped',

  // Navigation events
  TAB_CHANGED: 'tab_changed',
  VIEW_CHANGED: 'view_changed',

  // Action events
  QUICK_ACTION_CLICKED: 'quick_action_clicked',
  QUICK_ACTIONS_EXPANDED: 'quick_actions_expanded',
  HELP_BUTTON_CLICKED: 'help_button_clicked',

  // Feature usage
  FILTER_APPLIED: 'filter_applied',
  MAP_INTERACTED: 'map_interacted',
  RESOURCE_VIEWED: 'resource_viewed',
  DASHBOARD_CUSTOMIZED: 'dashboard_customized',
  DASHBOARD_CUSTOMIZER_OPENED: 'dashboard_customizer_opened',

  // Intention Onboarding events
  INTENTION_ONBOARDING_OPENED: 'intention_onboarding_opened',
  INTENTION_SELECTED: 'intention_selected',
  INTENTION_COMPLETED: 'intention_completed',
  INTENTION_ABANDONED: 'intention_abandoned',

  // Demo Content events
  DEMO_CONTENT_VIEWED: 'demo_content_viewed',
  DEMO_CONTENT_CLICKED: 'demo_content_clicked',
  DEMO_CONTENT_DISMISSED: 'demo_content_dismissed',
  DEMO_CONVERTED_TO_REGISTER: 'demo_converted_to_register',
} as const;

export default Analytics;
