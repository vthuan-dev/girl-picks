import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { Post, PostListParams, CreatePostDto, UpdatePostDto } from '@/types/post';
import { unwrapResponse, getPaginatedData } from '@/lib/api/response-helper';

export const postsApi = {
  // Get all posts (public - approved only by default)
  getAll: async (params?: PostListParams): Promise<PaginatedResponse<Post>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.girlId) searchParams.append('girlId', params.girlId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
      if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    
    const response = await apiClient.get<any>(`/posts?${searchParams.toString()}`);
    
    // Backend wraps response in { success: true, data: { data: [...], meta: {...} } }
    const unwrapped = unwrapResponse(response.data);
    return getPaginatedData<Post>(unwrapped);
  },

  // Get post by ID
  getById: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return unwrapResponse(response.data) as ApiResponse<Post>;
  },

  // Get posts by girl ID
  getByGirl: async (girlId: string): Promise<ApiResponse<Post[]>> => {
    const response = await apiClient.get<ApiResponse<Post[]>>(`/posts/girl/${girlId}`);
    return unwrapResponse(response.data) as ApiResponse<Post[]>;
  },

  // Get my posts (requires auth)
  getMyPosts: async (status?: string): Promise<ApiResponse<Post[]>> => {
    const searchParams = status ? `?status=${status}` : '';
    try {
      const response = await apiClient.get<any>(`/posts/me${searchParams}`);
      const unwrapped = unwrapResponse(response.data);
      // Backend wraps response in { success: true, data: [...] }
      // unwrapResponse should extract the data array
      if (Array.isArray(unwrapped)) {
        return { success: true, data: unwrapped } as ApiResponse<Post[]>;
      }
      // If already wrapped in ApiResponse format
      if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped && Array.isArray((unwrapped as any).data)) {
        return unwrapped as ApiResponse<Post[]>;
      }
      // Fallback: return empty array
      return { success: true, data: [] } as ApiResponse<Post[]>;
    } catch (error: any) {
      console.error('Error in getMyPosts:', error);
      throw error;
    }
  },

  // Create post (requires auth)
  create: async (data: CreatePostDto): Promise<ApiResponse<Post>> => {
    const response = await apiClient.post<ApiResponse<Post>>('/posts', data);
    return unwrapResponse(response.data) as ApiResponse<Post>;
  },

  // Update post (requires auth)
  update: async (id: string, data: UpdatePostDto): Promise<ApiResponse<Post>> => {
    const response = await apiClient.patch<ApiResponse<Post>>(`/posts/${id}`, data);
    return unwrapResponse(response.data) as ApiResponse<Post>;
  },

  // Delete post (requires auth)
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/posts/${id}`);
    return unwrapResponse(response.data) as ApiResponse<void>;
  },

  // Like post (requires auth)
  like: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(`/posts/${id}/likes`);
    return unwrapResponse(response.data) as ApiResponse<void>;
  },

  // Unlike post (requires auth)
  unlike: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/posts/${id}/likes`);
    return unwrapResponse(response.data) as ApiResponse<void>;
  },

  // Increment view count
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/posts/${id}/view`);
  },

  // Toggle like (requires auth)
  toggleLike: async (id: string): Promise<ApiResponse<{ liked: boolean; count: number }>> => {
    const response = await apiClient.post<any>(`/posts/${id}/like`);
    return unwrapResponse(response.data);
  },

  // Get likes count
  getLikes: async (id: string): Promise<ApiResponse<{ count: number; liked: boolean }>> => {
    const response = await apiClient.get<any>(`/posts/${id}/likes`);
    return unwrapResponse(response.data);
  },

  // Get comments
  getComments: async (id: string, page = 1, limit = 20): Promise<PaginatedResponse<PostComment> & { totalAll?: number }> => {
    const response = await apiClient.get<any>(`/posts/${id}/comments?page=${page}&limit=${limit}`);
    const unwrapped = unwrapResponse(response.data) as any;
    const paginated = getPaginatedData<PostComment>(unwrapped);
    return {
      ...paginated,
      totalAll: unwrapped?.meta?.totalAll || paginated.total,
    };
  },

  // Add comment (requires auth)
  addComment: async (id: string, content: string, parentId?: string): Promise<PostComment> => {
    const response = await apiClient.post<any>(`/posts/${id}/comments`, { content, parentId });
    return unwrapResponse(response.data);
  },

  // Get replies for a comment
  getReplies: async (commentId: string, page = 1, limit = 10): Promise<PaginatedResponse<PostComment>> => {
    const response = await apiClient.get<any>(`/posts/comments/${commentId}/replies?page=${page}&limit=${limit}`);
    const unwrapped = unwrapResponse(response.data);
    return getPaginatedData<PostComment>(unwrapped);
  },
};

// Comment type
export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  replies?: PostComment[];
  _count?: {
    replies: number;
  };
}

