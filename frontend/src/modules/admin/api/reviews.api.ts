import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  girl: {
    id: string;
    name: string;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string;
    };
  };
  approvedBy?: {
    id: string;
    fullName: string;
  };
  _count?: {
    likes: number;
    comments: number;
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

export const reviewsApi = {
  // Get all reviews (Admin can see all, including pending)
  getAll: async (status?: string, girlId?: string, page = 1, limit = 20): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (status && status !== 'Tất cả') params.append('status', status);
    if (girlId) params.append('girlId', girlId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<any>(
      `/reviews?${params.toString()}`
    );
    const responseData = response.data;
    
    // Handle wrapped response {success: true, data: {...}}
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Get review by ID
  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get<any>(`/reviews/${id}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Approve review
  approve: async (id: string, notes?: string): Promise<Review> => {
    const response = await apiClient.post<any>(
      `/reviews/${id}/approve`,
      { notes }
    );
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Reject review
  reject: async (id: string, reason: string): Promise<Review> => {
    const response = await apiClient.post<any>(
      `/reviews/${id}/reject`,
      { reason }
    );
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },
};

