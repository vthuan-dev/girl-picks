import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    role: string;
  };
  girl?: {
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

export const postsApi = {
  // Get all posts
  getAll: async (status?: string, girlId?: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (girlId) params.append('girlId', girlId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<any>(
      `/posts?${params.toString()}`
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

  // Get post by ID
  getById: async (id: string): Promise<Post> => {
    const response = await apiClient.get<any>(`/posts/${id}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Approve post
  approve: async (id: string, notes?: string): Promise<Post> => {
    const response = await apiClient.post<any>(
      `/posts/${id}/approve`,
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

  // Reject post
  reject: async (id: string, reason: string): Promise<Post> => {
    const response = await apiClient.post<any>(
      `/posts/${id}/reject`,
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

  // Delete post
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};

