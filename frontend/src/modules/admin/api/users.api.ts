import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';

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

// Use PaginatedResponse from @/lib/api/types

export const usersApi = {
  // Get all users (Admin only)
  getAll: async (role?: string, isActive?: boolean, page = 1, limit = 20, search?: string): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    if (search) params.append('search', search);
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Delete user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  // Create user
  create: async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role: 'ADMIN' | 'GIRL' | 'CUSTOMER' | 'STAFF_UPLOAD';
    avatarUrl?: string;
  }): Promise<User> => {
    const response = await apiClient.post<any>('/admin/users', data);
    const responseData = response.data;
    
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    if (responseData.id) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  approveGirl: async (id: string): Promise<User> => {
    const response = await apiClient.post<any>(`/admin/users/${id}/approve-girl`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    if (responseData.id) {
      return responseData;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  rejectGirl: async (id: string): Promise<User> => {
    const response = await apiClient.post<any>(`/admin/users/${id}/reject-girl`);
    const responseData = response.data;

    if (responseData.success && responseData.data) {
      return responseData.data;
    }

    if (responseData.id) {
      return responseData;
    }

    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },
};

