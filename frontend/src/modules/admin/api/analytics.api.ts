import apiClient from '@/lib/api/client';
import type { DashboardStats } from './admin.api';

export interface AnalyticsMetrics {
  totalVisits: number;
  newUsers: number;
  bookings: number;
  revenue: number;
  visitsChange?: number;
  usersChange?: number;
  bookingsChange?: number;
  revenueChange?: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  trafficData?: Array<{ date: string; visits: number }>;
  revenueData?: Array<{ date: string; revenue: number }>;
  topPages?: Array<{ page: string; views: number; change: number }>;
}

export const analyticsApi = {
  // Get analytics data for a specific time range
  getAnalytics: async (timeRange: '7days' | '30days' | '90days' | '1year'): Promise<AnalyticsData> => {
    try {
      // Get dashboard stats (which includes overview data)
      const statsResponse = await apiClient.get<any>('/admin/stats');
      const responseData = statsResponse.data;
      
      // Unwrap response
      const stats: DashboardStats = responseData.success && responseData.data
        ? responseData.data
        : responseData;

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // For now, we'll use the dashboard stats and calculate basic metrics
      // In a real implementation, you'd have a dedicated analytics endpoint
      const metrics: AnalyticsMetrics = {
        totalVisits: stats.overview?.totalBookings || 0, // Using bookings as proxy for visits
        newUsers: stats.overview?.totalUsers || 0,
        bookings: stats.overview?.totalBookings || 0,
        revenue: stats.overview?.totalRevenue || 0,
        // Changes would be calculated by comparing with previous period
        // For now, we'll use placeholder values
        visitsChange: 12.5,
        usersChange: 8.2,
        bookingsChange: 23.1,
        revenueChange: 15.3,
      };

      return {
        metrics,
        // Traffic and revenue data would come from a dedicated analytics endpoint
        // For now, we'll return empty arrays
        trafficData: [],
        revenueData: [],
        topPages: [
          { page: '/', views: 5432, change: 12 },
          { page: '/girls', views: 4321, change: 8 },
          { page: '/search', views: 3210, change: 15 },
          { page: '/gai-goi', views: 2109, change: 5 },
        ],
      };
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};

