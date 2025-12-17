import apiClient from '@/lib/api/client';

export interface MovieReviewComment {
  id: string;
  reviewId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  } | null;
  replies?: MovieReviewComment[];
}

export interface MovieReview {
  id: string;
  movieId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
  } | null;
  comments?: MovieReviewComment[];
}

export interface MovieReviewsResponse {
  data: MovieReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
}

export interface MovieReviewCommentsResponse {
  data: MovieReviewComment[];
  total: number;
}

export const moviesReviewsApi = {
  getReviews: async (movieId: string, page = 1, limit = 10): Promise<MovieReviewsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const res = await apiClient.get<any>(`/movies/${movieId}/reviews?${params.toString()}`);
    const data = res.data;
    if (data?.success && data?.data) return data.data as MovieReviewsResponse;
    return data as MovieReviewsResponse;
  },

  createReview: async (
    movieId: string,
    payload: { rating: number; comment?: string },
  ): Promise<MovieReview> => {
    const res = await apiClient.post<any>(`/movies/${movieId}/reviews`, payload);
    const data = res.data;
    if (data?.success && data?.data) return data.data as MovieReview;
    return data as MovieReview;
  },

  getComments: async (reviewId: string): Promise<MovieReviewCommentsResponse> => {
    const res = await apiClient.get<any>(`/movies/reviews/${reviewId}/comments`);
    const data = res.data;
    if (data?.success && data?.data) return data.data as MovieReviewCommentsResponse;
    return data as MovieReviewCommentsResponse;
  },

  createComment: async (
    reviewId: string,
    payload: { content: string; parentId?: string },
  ): Promise<MovieReviewComment> => {
    const res = await apiClient.post<any>(`/movies/reviews/${reviewId}/comments`, payload);
    const data = res.data;
    if (data?.success && data?.data) return data.data as MovieReviewComment;
    return data as MovieReviewComment;
  },
};


