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

  // Get all provinces
  getProvinces: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await apiClient.get<any>('/districts/provinces');
      console.log('Raw provinces response:', response);
      
      // Backend might return array directly or wrapped
      let data = response.data;
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return { success: true, data } as ApiResponse<string[]>;
      }
      
      // Try to unwrap if wrapped
      const unwrapped = unwrapResponse(data);
      if (Array.isArray(unwrapped)) {
        return { success: true, data: unwrapped } as ApiResponse<string[]>;
      }
      
      // If still wrapped in response.data
      if (data?.data && Array.isArray(data.data)) {
        return { success: true, data: data.data } as ApiResponse<string[]>;
      }
      
      console.warn('Unexpected provinces response format:', data);
      return { success: false, data: [] } as ApiResponse<string[]>;
    } catch (error) {
      console.error('Error in getProvinces:', error);
      throw error;
    }
  },

  // Get districts by province
  getDistrictsByProvince: async (province: string): Promise<ApiResponse<District[]>> => {
    const response = await apiClient.get<any>(`/districts/province/${encodeURIComponent(province)}`);
    const unwrapped = unwrapResponse(response.data);
    if (Array.isArray(unwrapped)) {
      return { success: true, data: unwrapped } as ApiResponse<District[]>;
    }
    return unwrapped as ApiResponse<District[]>;
  },
};

