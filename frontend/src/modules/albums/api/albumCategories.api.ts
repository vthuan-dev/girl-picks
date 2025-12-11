import apiClient from '@/lib/api/client';

export interface AlbumCategory {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  order: number;
  isActive: boolean;
}

export const albumCategoriesApi = {
  getAll: async (includeInactive?: boolean): Promise<AlbumCategory[]> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const resp = await apiClient.get<any>(`/album-categories${params}`);
    return Array.isArray(resp.data?.data) ? resp.data.data : Array.isArray(resp.data) ? resp.data : [];
  },

  create: async (data: { name: string; slug?: string; description?: string; order?: number; isActive?: boolean }) => {
    const resp = await apiClient.post('/album-categories', data);
    return resp.data;
  },
};

