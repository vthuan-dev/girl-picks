import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/lib/api/types';
import { unwrapResponse } from '@/lib/api/response-helper';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export const categoriesApi = {
  // Get all categories
  getAll: async (includeInactive?: boolean): Promise<Category[]> => {
    const params = new URLSearchParams();
    if (includeInactive) {
      params.append('includeInactive', 'true');
    }
    
    const response = await apiClient.get<any>(
      `/categories${params.toString() ? `?${params.toString()}` : ''}`
    );
    const unwrapped = unwrapResponse<any>(response.data);
    if (Array.isArray(unwrapped)) {
      return unwrapped;
    }
    if (unwrapped && typeof unwrapped === 'object' && 'data' in unwrapped && Array.isArray(unwrapped.data)) {
      return unwrapped.data;
    }
    return [];
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return unwrapResponse(response.data) as Category;
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return unwrapResponse(response.data) as Category;
  },

  // Create category (Admin only)
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    return unwrapResponse(response.data) as Category;
  },

  // Update category (Admin only)
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return unwrapResponse(response.data) as Category;
  },

  // Delete category (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

