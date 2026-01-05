import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';
import { User } from '@/types/auth';
import {
  AuthResponse,
  PendingApprovalResponse,
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
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Register
  register: async (
    data: Omit<RegisterDto, 'username'>,
  ): Promise<AuthResponse | PendingApprovalResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    const responseData = response.data;
    
    // Wrapped
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // Pending approval path (no tokens)
    if (responseData.user && responseData.pendingApproval) {
      return responseData as PendingApprovalResponse;
    }

    // Active user path (has tokens)
    if (responseData.user && responseData.accessToken) {
      return responseData as AuthResponse;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Refresh Token
  refreshToken: async (data: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', data);
    return response.data;
  },

  // Request Password Reset
  requestPasswordReset: async (data: PasswordResetDto): Promise<{ message: string }> => {
    const response = await apiClient.post<any>('/auth/forgot-password', data);
    const responseData = response.data;
    
    // Handle wrapped response from TransformInterceptor
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.message) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Confirm Password Reset
  confirmPasswordReset: async (data: PasswordResetConfirmDto): Promise<{ message: string }> => {
    const response = await apiClient.post<any>('/auth/reset-password', data);
    const responseData = response.data;
    
    // Handle wrapped response from TransformInterceptor
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    
    // If already unwrapped, return directly
    if (responseData.message) {
      return responseData;
    }
    
    throw new Error('Định dạng phản hồi từ server không hợp lệ');
  },

  // Get Current User
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<any>('/users/me');
    const responseData = response.data;
    
    // Backend wraps response in {success: true, data: {...}}
    if (responseData.success && responseData.data) {
      return {
        success: true,
        data: responseData.data,
      };
    }
    
    // If already unwrapped (direct user object), wrap it
    if (responseData && !responseData.success && (responseData.id || responseData.email)) {
      return {
        success: true,
        data: responseData as User,
      };
    }
    
    // Return as is if already in correct format
    return responseData;
  },
};

