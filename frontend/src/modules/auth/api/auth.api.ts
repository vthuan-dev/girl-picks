import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';
import { User } from '@/types/auth';
import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  PasswordResetDto,
  PasswordResetConfirmDto,
} from '@/types/auth';

export const authApi = {
  // Login
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', data);
    // Backend wraps response in {success: true, data: {...}}
    const responseData = response.data;
    
    // Handle both wrapped and unwrapped responses
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.user && responseData.accessToken) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Register
  register: async (data: Omit<RegisterDto, 'username'>): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    const responseData = response.data;
    
    // Handle both wrapped and unwrapped responses
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.user && responseData.accessToken) {
      return responseData;
    }
    
    throw new Error('Invalid response format from server');
  },

  // Refresh Token
  refreshToken: async (data: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', data);
    return response.data;
  },

  // Request Password Reset
  requestPasswordReset: async (data: PasswordResetDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', data);
    return response.data;
  },

  // Confirm Password Reset
  confirmPasswordReset: async (data: PasswordResetConfirmDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      const responseData = response.data;
      
      // Handle both wrapped and unwrapped responses
      if (responseData.success && responseData.data) {
        return responseData;
      }
      
      // If already unwrapped, wrap it
      if (responseData && !responseData.success) {
        return {
          success: true,
          data: responseData as unknown as User,
        };
      }
      
      return responseData;
    } catch (error) {
      // Return error response if backend is not available
      return {
        success: false,
        data: null as any,
        message: 'Backend not available',
      };
    }
  },
};

