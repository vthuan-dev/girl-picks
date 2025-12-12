import apiClient from '@/lib/api/client';
import { unwrapResponse } from '@/lib/api/response-helper';

export interface ChatSexGirl {
  id: string;
  name: string;
  slug?: string;
  title?: string;
  age?: number;
  bio?: string;
  phone?: string;
  zalo?: string;
  telegram?: string;
  location?: string;
  province?: string;
  address?: string;
  price?: string;
  services?: string[];
  workingHours?: string;
  images?: string[];
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
  managedBy?: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface CreateChatSexGirlDto {
  name: string;
  title?: string;
  age?: number;
  bio?: string;
  phone?: string;
  zalo?: string;
  telegram?: string;
  location?: string;
  province?: string;
  address?: string;
  price?: string;
  services?: string[];
  workingHours?: string;
  images?: string[];
  coverImage?: string;
  tags?: string[];
  isVerified?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  isAvailable?: boolean;
  rating?: number;
  sourceUrl?: string;
}

export interface UpdateChatSexGirlDto extends Partial<CreateChatSexGirlDto> {}

export interface ChatSexGirlListResponse {
  data: ChatSexGirl[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ChatSexApi {
  private baseUrl = '/api/chat-sex';

  async getAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    province?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isVerified?: boolean;
  }): Promise<ChatSexGirlListResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);
    if (options?.province) params.append('province', options.province);
    if (options?.isActive !== undefined)
      params.append('isActive', options.isActive.toString());
    if (options?.isFeatured !== undefined)
      params.append('isFeatured', options.isFeatured.toString());
    if (options?.isVerified !== undefined)
      params.append('isVerified', options.isVerified.toString());

    const response = await fetch(
      `${this.baseUrl}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chat sex girls');
    }

    return response.json();
  }

  async getById(id: string): Promise<ChatSexGirl> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat sex girl');
    }

    return response.json();
  }

  async create(dto: CreateChatSexGirlDto): Promise<ChatSexGirl> {
    const response = await apiClient.post<any>(this.baseUrl, dto);
    return unwrapResponse(response.data) as ChatSexGirl;
  }

  async bulkCreate(dtos: CreateChatSexGirlDto[]): Promise<{
    success: number;
    failed: number;
    results: ChatSexGirl[];
    errors: Array<{ data: CreateChatSexGirlDto; error: string }>;
  }> {
    const response = await apiClient.post<any>(`${this.baseUrl}/bulk`, dtos);
    return unwrapResponse(response.data);
  }

  async update(
    id: string,
    dto: UpdateChatSexGirlDto,
  ): Promise<ChatSexGirl> {
    const response = await apiClient.patch<any>(`${this.baseUrl}/${id}`, dto);
    return unwrapResponse(response.data) as ChatSexGirl;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async incrementView(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/${id}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  }
}

export const chatSexApi = new ChatSexApi();

