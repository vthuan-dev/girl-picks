import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { CommunityPost } from '@/modules/community-posts/api/community-posts.api';

export const communityPostsAdminApi = {
  // Get pending community posts (Admin only)
  getPending: async (page = 1, limit = 20): Promise<PaginatedResponse<CommunityPost>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CommunityPost>>>(
      `/admin/pending/community-posts?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  // Get all community posts with filters (Admin)
  getAll: async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<CommunityPost>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    queryParams.append('page', (params?.page || 1).toString());
    queryParams.append('limit', (params?.limit || 20).toString());

    const response = await apiClient.get<ApiResponse<PaginatedResponse<CommunityPost>>>(
      `/community-posts?${queryParams.toString()}`
    );
    return response.data.data;
  },

  // Approve community post
  approve: async (id: string, notes?: string): Promise<CommunityPost> => {
    const response = await apiClient.post<ApiResponse<CommunityPost>>(
      `/community-posts/${id}/approve`,
      { notes }
    );
    return response.data.data;
  },

  // Reject community post
  reject: async (id: string, reason: string): Promise<CommunityPost> => {
    const response = await apiClient.post<ApiResponse<CommunityPost>>(
      `/community-posts/${id}/reject`,
      { reason }
    );
    return response.data.data;
  },

  // Delete community post
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/community-posts/${id}`);
  },

  // Get community post details
  getDetails: async (id: string): Promise<CommunityPost> => {
    const response = await apiClient.get<ApiResponse<CommunityPost>>(`/community-posts/${id}`);
    return response.data.data;
  },
};

