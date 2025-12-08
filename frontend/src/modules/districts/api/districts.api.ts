import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { District, DistrictListParams } from '@/types/district';
import { unwrapResponse } from '@/lib/api/response-helper';

export const districtsApi = {
  // Get districts list
  getDistricts: async (params?: DistrictListParams): Promise<ApiResponse<PaginatedResponse<District>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<District>>>('/districts', { params });
    return response.data;
  },

  // Get district by ID
  getDistrictById: async (id: string): Promise<ApiResponse<District>> => {
    const response = await apiClient.get<ApiResponse<District>>(`/districts/${id}`);
    return response.data;
  },

  // Get all districts (no pagination)
  getAllDistricts: async (): Promise<ApiResponse<District[]>> => {
    const response = await apiClient.get<any>('/districts/all');
    const unwrapped = unwrapResponse(response.data);
    // Backend may return District[] directly or wrapped
    if (Array.isArray(unwrapped)) {
      return { success: true, data: unwrapped } as ApiResponse<District[]>;
    }
    return unwrapped as ApiResponse<District[]>;
  },
};

