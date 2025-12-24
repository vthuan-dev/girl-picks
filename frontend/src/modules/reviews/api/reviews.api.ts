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
    avatarUrl?: string | null;
  };
  girl: {
    id: string;
    name: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
  liked?: boolean;
}

export interface ReviewComment {
  id: string;
  content: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  parentId?: string | null;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  replies?: ReviewComment[];
  _count?: {
    replies: number;
  };
  review?: {
    id: string;
    title?: string;
    content?: string;
    customer?: {
      id: string;
      fullName: string;
    };
  };
}

export interface CreateReviewDto {
  girlId: string;
  title: string;
  content: string;
  rating: number;
  images?: string[];
}

export interface CreateReviewCommentDto {
  content: string;
  parentId?: string; // ID của comment cha nếu đây là reply
}

export const reviewsApi = {
  // Get reviews by girl ID (public - approved only)
  getByGirlId: async (girlId: string): Promise<Review[]> => {
    const response = await apiClient.get<any>(`/reviews/girl/${girlId}`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return Array.isArray(responseData.data) ? responseData.data : [];
    }

    if (Array.isArray(responseData)) {
      return responseData;
    }

    return [];
  },

  // Create review (Customer only)
  create: async (data: CreateReviewDto): Promise<Review> => {
    const response = await apiClient.post<any>('/reviews', data);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    if (responseData.id) {
      return responseData;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Toggle like on a review
  toggleLike: async (reviewId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiClient.post<any>(`/reviews/${reviewId}/like`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    return responseData;
  },

  // Get like status (liked by current user + count)
  getLikeStatus: async (reviewId: string): Promise<{ liked: boolean; likesCount: number }> => {
    const response = await apiClient.get<any>(`/reviews/${reviewId}/like-status`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    return responseData;
  },

  // Get likes count for a review
  getLikes: async (reviewId: string): Promise<number> => {
    const response = await apiClient.get<any>(`/reviews/${reviewId}/likes`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data.count || 0;
    }

    return responseData.count || 0;
  },

  // Add comment to a review
  addComment: async (reviewId: string, data: CreateReviewCommentDto): Promise<ReviewComment> => {
    const response = await apiClient.post<any>(`/reviews/${reviewId}/comments`, data);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    if (responseData.id) {
      return responseData;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Get comments for a review
  getComments: async (reviewId: string, page = 1, limit = 20): Promise<{ data: ReviewComment[]; total: number }> => {
    const response = await apiClient.get<any>(`/reviews/${reviewId}/comments?page=${page}&limit=${limit}`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return {
        data: Array.isArray(responseData.data) ? responseData.data : [],
        total: responseData.meta?.total ?? Array.isArray(responseData.data) ? responseData.data.length : 0,
      };
    }

    if (Array.isArray(responseData)) {
      return { data: responseData, total: responseData.length };
    }

    return { data: [], total: 0 };
  },

  // Approve comment (Admin only)
  approveComment: async (commentId: string): Promise<ReviewComment> => {
    const response = await apiClient.post<any>(`/reviews/comments/${commentId}/approve`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    if (responseData.id) {
      return responseData;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Reject comment (Admin only)
  rejectComment: async (commentId: string, reason?: string): Promise<ReviewComment> => {
    const response = await apiClient.post<any>(`/reviews/comments/${commentId}/reject`, { reason });
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    if (responseData.id) {
      return responseData;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Get pending comments (Admin only)
  getPendingComments: async (page = 1, limit = 20): Promise<{ data: ReviewComment[]; total: number; meta?: any }> => {
    const response = await apiClient.get<any>(`/admin/pending/review-comments?page=${page}&limit=${limit}`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return {
        data: Array.isArray(responseData.data) ? responseData.data : [],
        total: responseData.meta?.total ?? Array.isArray(responseData.data) ? responseData.data.length : 0,
        meta: responseData.meta,
      };
    }

    if (Array.isArray(responseData)) {
      return { data: responseData, total: responseData.length };
    }

    return { data: [], total: 0 };
  },
};

