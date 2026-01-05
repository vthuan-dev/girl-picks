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
  private isApiAvailable: boolean = true;

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

        // Skip if API is known to be unavailable
        if (!this.isApiAvailable) {
          return;
        }

        // Send to API with timeout and error handling
        try {
          await apiClient.post('/analytics/track', {
            sessionId: this.sessionId,
            ...pageViewData,
          }, {
            timeout: 5000, // 5 seconds timeout for analytics
          });

          this.lastTrackedPath = path;
          this.isApiAvailable = true; // Reset flag on success
        } catch (apiError: any) {
          // Mark API as unavailable if it's a network error
          if (apiError.code === 'ERR_NETWORK' || apiError.message === 'Network Error') {
            this.isApiAvailable = false;
            // Only log in development
            if (process.env.NODE_ENV === 'development') {
              console.warn('Analytics: Backend not available. Analytics tracking will be skipped until backend is available.');
            }
          } else {
            // Other errors - log in development
            if (process.env.NODE_ENV === 'development') {
              console.error('Analytics: Failed to track page view:', apiError.message || apiError);
            }
          }
          // Don't throw - analytics should not break the app
        }
      } catch (error) {
        // Silent fail - don't interrupt user experience
        if (process.env.NODE_ENV === 'development') {
          console.error('Analytics: Unexpected error:', error);
        }
      }
    }, 500); // 500ms debounce
  }

  /**
   * Track a custom event
   */
  async trackEvent(eventName: string, data?: Record<string, any>): Promise<void> {
    // Skip if API is known to be unavailable
    if (!this.isApiAvailable) {
      return;
    }

    try {
      await apiClient.post('/analytics/event', {
        sessionId: this.sessionId,
        eventName,
        data,
        timestamp: new Date().toISOString(),
      }, {
        timeout: 5000, // 5 seconds timeout for analytics
      });
      
      this.isApiAvailable = true; // Reset flag on success
    } catch (error: any) {
      // Mark API as unavailable if it's a network error
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        this.isApiAvailable = false;
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics: Backend not available. Analytics tracking will be skipped.');
        }
      } else {
        // Other errors - log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Analytics: Failed to track event:', error.message || error);
        }
      }
      // Don't throw - analytics should not break the app
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

