import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';
import { unwrapResponse } from '@/lib/api/response-helper';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  // Get all notifications for current user
  getAll: async (isRead?: boolean): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }
    
    const response = await apiClient.get<any>(
      `/notifications${params.toString() ? `?${params.toString()}` : ''}`
    );
    const unwrapped = unwrapResponse<any>(response.data);
    // Backend may return array directly or wrapped
    if (Array.isArray(unwrapped)) {
      return unwrapped;
    }
    if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped && Array.isArray(unwrapped.data)) {
      return unwrapped.data;
    }
    return [];
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<any>('/notifications/unread-count');
    const unwrapped = unwrapResponse<any>(response.data);
    // Backend may return { count: number } or just number
    if (typeof unwrapped === 'number') {
      return unwrapped;
    }
    if (unwrapped && typeof unwrapped === 'object' && 'count' in unwrapped && typeof unwrapped.count === 'number') {
      return unwrapped.count;
    }
    return 0;
  },

  // Get notification by ID
  getById: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
    return unwrapResponse(response.data) as ApiResponse<Notification>;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await apiClient.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return unwrapResponse(response.data) as ApiResponse<Notification>;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.patch<ApiResponse<{ count: number }>>('/notifications/read-all');
    return unwrapResponse(response.data) as ApiResponse<{ count: number }>;
  },

  // Delete notification
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};

