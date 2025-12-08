import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface PopularTag {
  name: string;
  count: number;
}

export interface PopularTagsParams {
  limit?: number;
  source?: 'girls' | 'posts' | 'all';
}

export const tagsApi = {
  /**
   * Get popular tags with count
   */
  getPopularTags: async (params?: PopularTagsParams): Promise<PopularTag[]> => {
    try {
      const { limit = 20, source = 'girls' } = params || {};
      const response = await apiClient.get<any>('/tags/popular', {
        params: { limit, source },
      });
      
      const responseData = response.data;
      
      console.log('[tagsApi] Raw response:', responseData);
      
      // Handle wrapped response
      if (responseData && responseData.success && responseData.data) {
        return responseData.data;
      }
      
      // If already unwrapped (direct array), return it
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      // If response is object with array inside
      if (responseData && Array.isArray(responseData)) {
        return responseData;
      }
      
      console.warn('[tagsApi] Unexpected response format:', responseData);
      return [];
    } catch (error: any) {
      console.error('[tagsApi] Error fetching popular tags:', error);
      console.error('[tagsApi] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Get all unique tags
   */
  getAllTags: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/tags/all');
    
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

