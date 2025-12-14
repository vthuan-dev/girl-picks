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

export interface TopGirl {
  id: string;
  name: string;
  avatar?: string | null;
  views: number;
  change: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  trafficData?: Array<{ date: string; visits: number }>;
  revenueData?: Array<{ date: string; revenue: number }>;
  topPages?: Array<{ page: string; views: number; change: number }>;
  topGirls?: TopGirl[];
}

export const analyticsApi = {
  // Get analytics data for a specific time range
  getAnalytics: async (timeRange: '7days' | '30days' | '90days' | '1year'): Promise<AnalyticsData> => {
    try {
      // Get analytics from dedicated endpoint
      const response = await apiClient.get<any>(`/admin/analytics?timeRange=${timeRange}`);
      const responseData = response.data;
      
      // Handle nested response structure: { success: true, data: { success: true, data: {...} } }
      if (responseData.success && responseData.data) {
        // Check if data has nested structure
        if (responseData.data.success && responseData.data.data) {
          return responseData.data.data;
        }
        // If data directly contains metrics
        if (responseData.data.metrics) {
          return responseData.data;
        }
        return responseData.data;
      }
      
      // Direct metrics structure
      if (responseData.metrics) {
        return responseData;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      
      // Fallback: Get dashboard stats if analytics endpoint fails
      try {
        const statsResponse = await apiClient.get<any>('/admin/stats');
        const statsData = statsResponse.data;
        const stats: DashboardStats = statsData.success && statsData.data
          ? statsData.data
          : statsData;

        return {
          metrics: {
            totalVisits: stats.overview?.totalBookings || 0,
            newUsers: stats.overview?.totalUsers || 0,
            bookings: stats.overview?.totalBookings || 0,
            revenue: stats.overview?.totalRevenue || 0,
            visitsChange: 0,
            usersChange: 0,
            bookingsChange: 0,
            revenueChange: 0,
          },
          trafficData: [],
          revenueData: [],
          topPages: [],
        };
      } catch (fallbackError) {
        throw error;
      }
    }
  },
};

