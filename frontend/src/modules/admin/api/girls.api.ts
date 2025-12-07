import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface Girl {
  id: string;
  name?: string;
  age?: number;
  bio?: string;
  districts: string[];
  ratingAverage: number;
  totalReviews: number;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  viewCount: number;
  favoriteCount: number;
  isFeatured: boolean;
  isPremium: boolean;
  isActive: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
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

export const girlsApi = {
  // Get all girls
  getAll: async (params?: {
    districts?: string[];
    rating?: number;
    verification?: string;
    isFeatured?: boolean;
    isPremium?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Girl>> => {
    const searchParams = new URLSearchParams();
    if (params?.districts) params.districts.forEach(d => searchParams.append('districts', d));
    if (params?.rating) searchParams.append('rating', params.rating.toString());
    if (params?.verification) searchParams.append('verification', params.verification);
    if (params?.isFeatured !== undefined) searchParams.append('isFeatured', params.isFeatured.toString());
    if (params?.isPremium !== undefined) searchParams.append('isPremium', params.isPremium.toString());
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 20).toString());
    
    const response = await apiClient.get<PaginatedResponse<Girl>>(
      `/girls?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get girl by ID
  getById: async (id: string): Promise<Girl> => {
    const response = await apiClient.get<Girl>(`/girls/${id}`);
    return response.data;
  },

  // Approve verification
  approveVerification: async (id: string): Promise<Girl> => {
    const response = await apiClient.post<Girl>(`/girls/${id}/verification/approve`);
    return response.data;
  },

  // Reject verification
  rejectVerification: async (id: string, reason: string): Promise<Girl> => {
    const response = await apiClient.post<Girl>(
      `/girls/${id}/verification/reject`,
      { reason }
    );
    return response.data;
  },

  // Update girl status
  updateStatus: async (id: string, isActive: boolean): Promise<Girl> => {
    const response = await apiClient.patch<Girl>(
      `/admin/girls/${id}/status`,
      { isActive }
    );
    return response.data;
  },
};

