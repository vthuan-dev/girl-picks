import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
    
    throw new Error('Invalid response format from server');
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
    
    throw new Error('Invalid response format from server');
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
    
    throw new Error('Invalid response format from server');
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
    
    throw new Error('Invalid response format from server');
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
};

