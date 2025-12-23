import apiClient from '@/lib/api/client';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';
import { unwrapResponse, getPaginatedData } from '@/lib/api/response-helper';

export interface ChatSexGirl {
  id: string;
  name: string;
  slug?: string;
  title?: string;
  age?: number;
  birthYear?: number;
  height?: string;
  weight?: string;
  bio?: string;
  phone?: string;
  zalo?: string;
  telegram?: string;
  location?: string;
  province?: string;
  address?: string;
  price?: string;
  price15min?: string;
  paymentInfo?: string;
  services?: string[];
  workingHours?: string;
  instruction?: string;
  images?: string[];
  videos?: string[];
  coverImage?: string;
  tags?: string[];
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isAvailable: boolean;
  rating?: number;
  viewCount: number;
  sourceUrl?: string;
  crawledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSexReview {
  id: string;
  girlId: string;
  userId?: string;
  rating: number;
  comment?: string;
  images?: string[]; // Array of image URLs
  userName?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
  };
}

export const chatSexApi = {
  // Get all chat sex girls (public endpoint)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    province?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isVerified?: boolean;
  }): Promise<PaginatedResponse<ChatSexGirl>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.province) searchParams.append('province', params.province);
    if (params?.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());
    if (params?.isFeatured !== undefined)
      searchParams.append('isFeatured', params.isFeatured.toString());
    if (params?.isVerified !== undefined)
      searchParams.append('isVerified', params.isVerified.toString());

    const response = await apiClient.get<any>(
      `/chat-sex?${searchParams.toString()}`,
    );

    // Backend wraps response in { success: true, data: { data: [...], meta: {...} } }
    const unwrapped = unwrapResponse(response.data);
    return getPaginatedData<ChatSexGirl>(unwrapped);
  },

  // Get chat sex girl by ID (public endpoint)
  getById: async (id: string): Promise<ChatSexGirl> => {
    const response = await apiClient.get<any>(`/chat-sex/${id}`);
    const unwrapped = unwrapResponse(response.data);
    return unwrapped as ChatSexGirl;
  },

  // Increment view count (public endpoint)
  incrementView: async (id: string): Promise<void> => {
    await apiClient.post(`/chat-sex/${id}/view`);
  },

  // Get reviews for a chat sex girl
  getReviews: async (
    girlId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<ChatSexReview>> => {
    const response = await apiClient.get<any>(
      `/chat-sex/${girlId}/reviews?page=${page}&limit=${limit}`,
    );
    const unwrapped = unwrapResponse(response.data);
    return getPaginatedData<ChatSexReview>(unwrapped);
  },

  // Create a review for a chat sex girl
  createReview: async (
    girlId: string,
    data: {
      rating: number;
      comment?: string;
      images?: string[]; // Array of image URLs or base64
      userName?: string;
    },
  ): Promise<ChatSexReview> => {
    const response = await apiClient.post<any>(
      `/chat-sex/${girlId}/reviews`,
      data,
    );
    const unwrapped = unwrapResponse(response.data);
    return unwrapped as ChatSexReview;
  },
};

