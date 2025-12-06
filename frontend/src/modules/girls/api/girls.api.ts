import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { Girl, GirlListParams, CreateGirlProfileDto, UpdateGirlProfileDto } from '@/types/girl';

export const girlsApi = {
  // Get girls list
  getGirls: async (params?: GirlListParams): Promise<ApiResponse<PaginatedResponse<Girl>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Girl>>>('/girls', { params });
    return response.data;
  },

  // Get girl by ID
  getGirlById: async (id: string): Promise<ApiResponse<Girl>> => {
    const response = await apiClient.get<ApiResponse<Girl>>(`/girls/${id}`);
    return response.data;
  },

  // Create girl profile (for GIRL role)
  createProfile: async (data: CreateGirlProfileDto): Promise<ApiResponse<Girl>> => {
    const response = await apiClient.post<ApiResponse<Girl>>('/girls/profile', data);
    return response.data;
  },

  // Update girl profile
  updateProfile: async (data: UpdateGirlProfileDto): Promise<ApiResponse<Girl>> => {
    const response = await apiClient.patch<ApiResponse<Girl>>('/girls/profile', data);
    return response.data;
  },

  // Get my girl profile
  getMyProfile: async (): Promise<ApiResponse<Girl>> => {
    const response = await apiClient.get<ApiResponse<Girl>>('/girls/profile');
    return response.data;
  },

  // Get featured girls
  getFeaturedGirls: async (limit?: number): Promise<ApiResponse<Girl[]>> => {
    const response = await apiClient.get<ApiResponse<Girl[]>>('/girls/featured', {
      params: { limit },
    });
    return response.data;
  },
};

