import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { unwrapResponse, getPaginatedData } from '@/lib/api/response-helper';

export interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  // Video/Movie fields (for phim-sex)
  videoUrl?: string;
  videoSources?: Array<{ url: string; type?: string; label?: string; resolution?: string }>;
  duration?: string;
  viewCount?: number;
  rating?: number;
  category?: string;
  tags?: string[];
  poster?: string;
  thumbnail?: string;
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

// Use PaginatedResponse from @/lib/api/types

export const postsApi = {
  // Get all posts (public endpoint)
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Admin: Get all posts with filters
  getAllAdmin: async (params?: {
    search?: string;
    status?: string;
    girlId?: string;
    authorId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.girlId) searchParams.append('girlId', params.girlId);
    if (params?.authorId) searchParams.append('authorId', params.authorId);
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 20).toString());
    
    const response = await apiClient.get<any>(
      `/admin/posts?${searchParams.toString()}`
    );
    
    // Use helper to unwrap response
    return getPaginatedData<Post>(response.data);
  },

  // Admin: Get post details
  getDetailsAdmin: async (id: string): Promise<Post> => {
    const response = await apiClient.get<any>(`/admin/posts/${id}`);
    const responseData = response.data;
    
    // Unwrap response if needed
    if (responseData?.success && responseData?.data) {
      return responseData.data;
    }
    
    if (responseData?.id) {
      return responseData;
    }
    
    if (responseData?.data) {
      return responseData.data;
    }
    
    return responseData;
  },

  // Admin: Create post
  createAdmin: async (data: {
    title: string;
    content?: string;
    images?: string[];
    girlId?: string;
    status?: string;
    videoUrl?: string;
  }): Promise<Post> => {
    const response = await apiClient.post<Post>(`/admin/posts`, data);
    return response.data;
  },

  // Admin: Update post
  updateAdmin: async (id: string, data: {
    title?: string;
    content?: string;
    images?: string[];
    girlId?: string;
    status?: string;
    videoUrl?: string;
  }): Promise<Post> => {
    const response = await apiClient.patch<Post>(`/admin/posts/${id}`, data);
    return response.data;
  },

  // Admin: Delete post
  deleteAdmin: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/posts/${id}`);
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Delete post
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};

