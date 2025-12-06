import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { UserProfile, UpdateProfileDto, ChangePasswordDto } from '@/types/user';

export const usersApi = {
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileDto): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.patch<ApiResponse<UserProfile>>('/users/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/users/change-password', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatar: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<ApiResponse<{ avatar: string }>>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get user by ID (public)
  getUserById: async (id: string): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>(`/users/${id}`);
    return response.data;
  },
};

