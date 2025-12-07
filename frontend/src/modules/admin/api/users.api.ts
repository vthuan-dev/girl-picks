import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'GIRL' | 'CUSTOMER' | 'STAFF_UPLOAD';
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
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

export const usersApi = {
  // Get all users (Admin only)
  getAll: async (role?: string, isActive?: boolean, page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<any>(
      `/admin/users?${params.toString()}`
    );
    const responseData = response.data;
    
    // Handle wrapped response {success: true, data: {...}}
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Get user by ID
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<any>(`/admin/users/${id}`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Update user
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  // Activate user
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<any>(`/admin/users/${id}/activate`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Deactivate user
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<any>(`/admin/users/${id}/deactivate`);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },
};

