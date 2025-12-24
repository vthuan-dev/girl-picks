import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface CommunityPost {
  id: string;
  content: string;
  images: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
  girl?: {
    id: string;
    name?: string | null;
    user?: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
    } | null;
  } | null;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface CommunityPostComment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  replies?: CommunityPostComment[];
  _count?: {
    replies: number;
  };
}

export interface CreateCommunityPostDto {
  content: string;
  girlId?: string;
  images?: string[];
}

export interface CreateCommunityPostCommentDto {
  content: string;
  parentId?: string;
}

export interface CommunityPostsResponse {
  data: CommunityPost[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CommentsResponse {
  data: CommunityPostComment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CommunityPostInteractionType = 'likes' | 'comments';

export interface CommunityPostInteraction {
  id: string;
  postId: string;
  postTitle: string;
  girlName?: string | null;
  previewImage?: string | null;
  type: CommunityPostInteractionType;
  createdAt: string;
}

export const communityPostsApi = {
  // Create community post
  create: async (data: CreateCommunityPostDto): Promise<CommunityPost> => {
    const response = await apiClient.post<any>('/community-posts', data);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Get all community posts
  getAll: async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    girlId?: string;
    page?: number;
    limit?: number;
  }): Promise<CommunityPostsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.girlId) queryParams.append('girlId', params.girlId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<any>(`/community-posts?${queryParams.toString()}`);
    const responseData = response.data;
    
    // Handle nested structure: { success: true, data: { data: [...], meta: {...} } }
    if (responseData.success && responseData.data) {
      // Check if data.data exists (nested structure)
      if (responseData.data.data && Array.isArray(responseData.data.data)) {
        return {
          data: responseData.data.data,
          meta: responseData.data.meta || {
            total: responseData.data.data.length,
            page: params?.page || 1,
            limit: params?.limit || 20,
            totalPages: 1,
          },
        };
      }
      // If data is directly an array
      if (Array.isArray(responseData.data)) {
        return {
          data: responseData.data,
          meta: responseData.meta || {
            total: responseData.data.length,
            page: params?.page || 1,
            limit: params?.limit || 20,
            totalPages: 1,
          },
        };
      }
    }
    
    // Handle direct array response
    if (responseData.data && Array.isArray(responseData.data)) {
      return {
        data: responseData.data,
        meta: responseData.meta || {
          total: responseData.data.length,
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalPages: 1,
        },
      };
    }
    
    return {
      data: [],
      meta: {
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 20,
        totalPages: 0,
      },
    };
  },

  // Get community post by ID
  getById: async (id: string): Promise<CommunityPost> => {
    const response = await apiClient.get<any>(`/community-posts/${id}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Get my community posts
  getMyPosts: async (status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<CommunityPost[]> => {
    const queryParams = status ? `?status=${status}` : '';
    const response = await apiClient.get<any>(`/community-posts/me${queryParams}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }
    
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    return [];
  },

  // Update community post
  update: async (id: string, data: Partial<CreateCommunityPostDto>): Promise<CommunityPost> => {
    const response = await apiClient.patch<any>(`/community-posts/${id}`, data);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Delete community post
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/community-posts/${id}`);
  },

  // Toggle like on a community post
  toggleLike: async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiClient.post<any>(`/community-posts/${id}/like`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData;
  },

  // Get likes count for a community post
  getLikes: async (id: string): Promise<number> => {
    const response = await apiClient.get<any>(`/community-posts/${id}/likes`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data.likesCount || 0;
    }
    
    return responseData.likesCount || 0;
  },

  // Get like status for current user
  getLikeStatus: async (id: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiClient.get<any>(`/community-posts/${id}/like-status`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    return responseData;
  },

  // Add comment to a community post
  addComment: async (id: string, data: CreateCommunityPostCommentDto): Promise<CommunityPostComment> => {
    const response = await apiClient.post<any>(`/community-posts/${id}/comments`, data);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Get comments for a community post
  getComments: async (id: string, page = 1, limit = 20): Promise<CommentsResponse> => {
    const response = await apiClient.get<any>(`/community-posts/${id}/comments?page=${page}&limit=${limit}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return {
        data: Array.isArray(responseData.data) ? responseData.data : [],
        total: responseData.total || responseData.meta?.total || 0,
        page: responseData.page || responseData.meta?.page || page,
        limit: responseData.limit || responseData.meta?.limit || limit,
        totalPages: responseData.totalPages || responseData.meta?.totalPages || 0,
      };
    }
    
    if (responseData.data && Array.isArray(responseData.data)) {
      return {
        data: responseData.data,
        total: responseData.total || responseData.data.length,
        page: responseData.page || page,
        limit: responseData.limit || limit,
        totalPages: responseData.totalPages || 1,
      };
    }
    
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  },

  // Get interactions (likes/comments) of current user
  getMyInteractions: async (
    type: CommunityPostInteractionType,
  ): Promise<CommunityPostInteraction[]> => {
    const response = await apiClient.get<any>(
      `/community-posts/interactions/me?type=${type}`,
    );
    const responseData = response.data;

    if (responseData?.success && Array.isArray(responseData.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (responseData?.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }

    return [];
  },
};

