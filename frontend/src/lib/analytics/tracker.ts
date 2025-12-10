import apiClient from '@/lib/api/client';

export interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: string;
}

class AnalyticsTracker {
  private sessionId: string;
  private lastTrackedPath: string | null = null;
  private trackDebounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Generate unique session ID
    this.sessionId = this.generateSessionId();
    
    // Load session ID from sessionStorage if exists
    if (typeof window !== 'undefined') {
      const storedSessionId = sessionStorage.getItem('analytics_session_id');
      if (storedSessionId) {
        this.sessionId = storedSessionId;
      } else {
        sessionStorage.setItem('analytics_session_id', this.sessionId);
      }
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track a page view
   */
  async trackPageView(path: string, title?: string): Promise<void> {
    // Prevent duplicate tracking for the same path
    if (this.lastTrackedPath === path) {
      return;
    }

    // Debounce rapid navigation
    if (this.trackDebounceTimer) {
      clearTimeout(this.trackDebounceTimer);
    }

    this.trackDebounceTimer = setTimeout(async () => {
      try {
        const pageViewData: PageViewData = {
          path: path,
          title: title || document.title,
          referrer: document.referrer || undefined,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          timestamp: new Date().toISOString(),
        };

        // Send to API
        await apiClient.post('/analytics/track', {
          sessionId: this.sessionId,
          ...pageViewData,
        });

        this.lastTrackedPath = path;
      } catch (error) {
        // Silent fail - don't interrupt user experience
        console.error('Failed to track page view:', error);
      }
    }, 500); // 500ms debounce
  }

  /**
   * Track a custom event
   */
  async trackEvent(eventName: string, data?: Record<string, any>): Promise<void> {
    try {
      await apiClient.post('/analytics/event', {
        sessionId: this.sessionId,
        eventName,
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton instance
export const analyticsTracker = new AnalyticsTracker();

