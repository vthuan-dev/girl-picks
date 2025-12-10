import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';

// Types
export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalGirls: number;
    totalCustomers: number;
    totalPosts: number;
    totalReviews: number;
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    completedBookings: number;
  };
  pending: {
    posts: number;
    reviews: number;
    verifications: number;
    reports: number;
  };
  recent: {
    users: any[];
    bookings: any[];
  };
  trends: {
    monthlyRevenue: any[];
  };
}

export interface PendingPost {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  author?: {
    id: string;
    fullName: string;
    email: string;
  };
  girl?: {
    id: string;
    name: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

export interface PendingReview {
  id: string;
  title: string;
  content: string;
  rating: number;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
  };
  girl: {
    id: string;
    name: string;
    user: {
      id: string;
      fullName: string;
    };
  };
}

export interface PendingVerification {
  id: string;
  verificationStatus: string;
  verificationRequestedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    fullName: string;
    email: string;
  };
  reportedUser?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// Use PaginatedResponse from @/lib/api/types

export const adminApi = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<any>('/admin/stats');
    const responseData = response.data;
    
    // Handle wrapped response {success: true, data: {...}}
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.overview) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Pending Posts
  getPendingPosts: async (page = 1, limit = 20): Promise<PaginatedResponse<PendingPost>> => {
    const response = await apiClient.get<any>(
      `/admin/pending/posts?page=${page}&limit=${limit}`
    );
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Pending Reviews
  getPendingReviews: async (page = 1, limit = 20): Promise<PaginatedResponse<PendingReview>> => {
    const response = await apiClient.get<any>(
      `/admin/pending/reviews?page=${page}&limit=${limit}`
    );
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Pending Verifications
  getPendingVerifications: async (page = 1, limit = 20): Promise<PaginatedResponse<PendingVerification>> => {
    const response = await apiClient.get<any>(
      `/admin/pending/verifications?page=${page}&limit=${limit}`
    );
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Reports
  getReports: async (status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Report>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<PaginatedResponse<Report>>(
      `/admin/reports?${params.toString()}`
    );
    return response.data;
  },

  // Process Report
  processReport: async (reportId: string, action: 'RESOLVED' | 'DISMISSED', notes?: string): Promise<void> => {
    await apiClient.post(`/admin/reports/${reportId}/process`, { action, notes });
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 50): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `/admin/audit-logs?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Search
  search: async (query: string): Promise<{
    users?: any[];
    girls?: any[];
    posts?: any[];
    reviews?: any[];
  }> => {
    try {
      const response = await apiClient.get<{
        users?: any[];
        girls?: any[];
        posts?: any[];
        reviews?: any[];
      }>(`/admin/search?q=${encodeURIComponent(query)}`);
      return response.data || {};
    } catch (error) {
      console.error('Search error:', error);
      return {};
    }
  },

  // Notifications
  getNotifications: async (unreadOnly: boolean = false, limit: number = 20): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>(
        `/admin/notifications?unreadOnly=${unreadOnly}&limit=${limit}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>('/admin/notifications/unread-count');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  },

  markNotificationAsRead: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/admin/notifications/${id}/read`);
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  },

  markAllNotificationsAsRead: async (): Promise<void> => {
    try {
      await apiClient.post('/admin/notifications/read-all');
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
    }
  },
};

