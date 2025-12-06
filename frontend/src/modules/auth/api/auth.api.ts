import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';
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
  login: async (data: LoginDto): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },

  // Register
  register: async (data: RegisterDto): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },

  // Refresh Token
  refreshToken: async (data: RefreshTokenDto): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  // Request Password Reset
  requestPasswordReset: async (data: PasswordResetDto): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', data);
    return response.data;
  },

  // Confirm Password Reset
  confirmPasswordReset: async (data: PasswordResetConfirmDto): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/auth/reset-password', data);
    return response.data;
  },

  // Get Current User
  getCurrentUser: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    const response = await apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/me');
    return response.data;
  },
};

