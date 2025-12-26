import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { unwrapResponse, getPaginatedData } from '@/lib/api/response-helper';

export interface Girl {
  id: string;
  name?: string;
  age?: number;
  bio?: string;
  phone?: string;
  price?: string | null;
  workingHours?: string | null;
  height?: string | number | null;
  weight?: string | number | null;
  measurements?: string | null;
  location?: string | null;
  province?: string | null;
  address?: string | null;
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
  services?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  idCardFrontUrl?: string | null;
  idCardBackUrl?: string | null;
  selfieUrl?: string | null;
  needsReverify?: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
}

// Use PaginatedResponse from @/lib/api/types

export const girlsApi = {
  // Get all girls (public endpoint)
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

  // Admin: Get all girls with filters
  getAllAdmin: async (params?: {
    search?: string;
    isActive?: boolean;
    verificationStatus?: string;
    isFeatured?: boolean;
    isPremium?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Girl>> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.verificationStatus) searchParams.append('verificationStatus', params.verificationStatus);
    if (params?.isFeatured !== undefined) searchParams.append('isFeatured', params.isFeatured.toString());
    if (params?.isPremium !== undefined) searchParams.append('isPremium', params.isPremium.toString());
    searchParams.append('page', (params?.page || 1).toString());
    searchParams.append('limit', (params?.limit || 20).toString());
    
    const response = await apiClient.get<any>(
      `/admin/girls?${searchParams.toString()}`
    );
    
    // Use helper to unwrap response
    return getPaginatedData<Girl>(response.data);
  },

  // Admin: Get girl details
  getDetailsAdmin: async (id: string): Promise<Girl> => {
    const response = await apiClient.get<any>(`/admin/girls/${id}`);
    return unwrapResponse(response.data) as Girl;
  },

  // Admin: Delete girl
  deleteAdmin: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/girls/${id}`);
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
    return unwrapResponse(response.data) as Girl;
  },

  // Admin: Create girl user (only creates user, not girl profile)
  createAdmin: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<{ user: any; needsProfileSetup: boolean }> => {
    try {
      const response = await apiClient.post<any>(`/admin/girls`, data);
      // Backend returns { success: true, data: { user, needsProfileSetup } }
      const unwrapped: any = unwrapResponse(response.data);
      // Ensure we return the correct format
      if (unwrapped && unwrapped.user) {
        return unwrapped as { user: any; needsProfileSetup: boolean };
      }
      // Fallback: if response.data is already the object
      if (response.data && response.data.user) {
        return response.data as { user: any; needsProfileSetup: boolean };
      }
      throw new Error('Định dạng phản hồi không hợp lệ');
    } catch (error: any) {
      console.error('Create admin error:', error);
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('CONNECTION_REFUSED') || error?.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy trên port 8000 không.');
      }
      if (error?.response) {
        // Server responded but with error
        throw error;
      }
      throw error;
    }
  },

  // Admin: Create girl profile from user
  createGirlProfile: async (userId: string, data: {
    bio?: string;
    districts?: string[];
    images?: string[];
    age?: number;
    name?: string;
    // Physical Info
    height?: string;
    weight?: string;
    measurements?: string;
    origin?: string;
    // Location
    address?: string;
    location?: string;
    province?: string;
    // Pricing & Services
    price?: string;
    workingHours?: string;
    tags?: string[];
    services?: string[];
  }): Promise<Girl> => {
    const response = await apiClient.post<any>(`/admin/girls/${userId}/profile`, data);
    return unwrapResponse(response.data) as Girl;
  },

  // Admin: Get girls without profile
  getGirlsWithoutProfile: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const response = await apiClient.get<any>(
      `/admin/girls/without-profile?${searchParams.toString()}`
    );
    return getPaginatedData<any>(response.data);
  },

  // Admin: Update girl
  updateAdmin: async (id: string, data: {
    name?: string;
    bio?: string;
    districts?: string[];
    isFeatured?: boolean;
    isPremium?: boolean;
    age?: number;
  }): Promise<Girl> => {
    const response = await apiClient.patch<any>(`/admin/girls/${id}`, data);
    return unwrapResponse(response.data) as Girl;
  },
};

