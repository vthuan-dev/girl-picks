import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';

export interface Movie {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  videoUrl: string;
  poster?: string | null;
  thumbnail?: string | null;
  duration?: string | null;
  categoryId?: string | null;
  tags?: string[] | null;
  viewCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export const moviesApi = {
  // Public: list movies for /phim-sex
  getAll: async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Movie>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.search) searchParams.append('search', params.search.trim());
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 24).toString());

    const res = await apiClient.get<any>(`/movies?${searchParams.toString()}`);
    const data = res.data;

    if (data?.data && Array.isArray(data.data)) {
      return data as PaginatedResponse<Movie>;
    }

    if (data?.success && data?.data) {
      return data.data as PaginatedResponse<Movie>;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Admin: list movies
  getAllAdmin: async (params?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Movie>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 24).toString());

    const res = await apiClient.get<any>(`/admin/movies?${searchParams.toString()}`);
    const data = res.data;
    if (data?.data && Array.isArray(data.data)) {
      return data as PaginatedResponse<Movie>;
    }
    if (data?.success && data?.data) {
      return data.data as PaginatedResponse<Movie>;
    }
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  getById: async (id: string): Promise<Movie> => {
    const res = await apiClient.get<any>(`/movies/${id}`);
    const data = res.data;
    if (data?.success && data?.data) return data.data;
    return data;
  },

  getBySlug: async (slug: string): Promise<Movie> => {
    const res = await apiClient.get<any>(`/movies/slug/${slug}`);
    const data = res.data;
    if (data?.success && data?.data) return data.data;
    return data;
  },

  // Admin create / update / delete
  createAdmin: async (payload: {
    title: string;
    description?: string;
    videoUrl: string;
    poster?: string;
    thumbnail?: string;
    duration?: string;
    categoryId?: string;
    tags?: string[];
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  }): Promise<Movie> => {
    const res = await apiClient.post<any>('/admin/movies', payload);
    return res.data?.data || res.data;
  },

  updateAdmin: async (
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      videoUrl: string;
      poster: string;
      thumbnail: string;
      duration: string;
      categoryId: string;
      tags: string[];
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
    }>,
  ): Promise<Movie> => {
    const res = await apiClient.patch<any>(`/admin/movies/${id}`, payload);
    return res.data?.data || res.data;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/movies/${id}`);
  },

  incrementView: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`/movies/${id}/view`);
    } catch {
      // silent fail, không cần chặn UX nếu +view lỗi
    }
  },
};


