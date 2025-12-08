import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { Girl, GirlListParams, CreateGirlProfileDto, UpdateGirlProfileDto } from '@/types/girl';
import { unwrapResponse, getPaginatedData } from '@/lib/api/response-helper';

export const girlsApi = {
  // Get girls list
  getGirls: async (params?: GirlListParams): Promise<PaginatedResponse<Girl>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.districtId) searchParams.append('districtId', params.districtId);
    if (params?.verified !== undefined) searchParams.append('verified', params.verified.toString());
    if (params?.minRating) searchParams.append('rating', params.minRating.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    
    // Add districts filter if provided
    if (params?.districts && Array.isArray(params.districts) && params.districts.length > 0) {
      params.districts.forEach(district => {
        searchParams.append('districts', district);
      });
    }
    
    // Add filter params
    if (params?.priceFilter) searchParams.append('priceFilter', params.priceFilter);
    if (params?.ageFilter) searchParams.append('ageFilter', params.ageFilter);
    if (params?.heightFilter) searchParams.append('heightFilter', params.heightFilter);
    if (params?.weightFilter) searchParams.append('weightFilter', params.weightFilter);
    if (params?.originFilter) searchParams.append('originFilter', params.originFilter);
    if (params?.locationFilter) searchParams.append('locationFilter', params.locationFilter);
    if (params?.province) searchParams.append('province', params.province);
    
    // Add tags filter if provided
    if (params?.tags && Array.isArray(params.tags) && params.tags.length > 0) {
      params.tags.forEach(tag => {
        searchParams.append('tags', tag);
      });
    }
    
    const response = await apiClient.get<any>(`/girls?${searchParams.toString()}`);
    
    console.log('[girlsApi] Raw response.data:', response.data);
    
    // Backend returns: { success: true, data: { data: [...], meta: {...} } }
    // getPaginatedData will handle unwrapping
    const result = getPaginatedData<Girl>(response.data);
    console.log('[girlsApi] Final result:', {
      dataLength: result.data.length,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
    
    return result;
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

  // Increment view count
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/girls/${id}/view`);
  },

  // Get count by province
  getCountByProvince: async (): Promise<Array<{ province: string; count: number }>> => {
    const response = await apiClient.get<any>('/girls/count/by-province');
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    return [];
  },
};

