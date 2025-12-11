import apiClient from '@/lib/api/client';

export interface AlbumImage {
  id: string;
  url: string;
  thumbUrl?: string | null;
  caption?: string | null;
  sortOrder: number;
}

export interface Album {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  category?: string | null;
  tags?: any;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: { images: number };
  images?: AlbumImage[];
}

export interface PaginatedAlbums {
  data: Album[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const albumsApi = {
  getAll: async (params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedAlbums> => {
    const search = new URLSearchParams();
    if (params?.page) search.append('page', String(params.page));
    if (params?.limit) search.append('limit', String(params.limit));
    if (params?.category) search.append('category', params.category);
    const resp = await apiClient.get<PaginatedAlbums>(`/albums${search.toString() ? `?${search.toString()}` : ''}`);
    return resp.data;
  },

  getById: async (id: string): Promise<Album> => {
    const resp = await apiClient.get<Album>(`/albums/${id}`);
    return resp.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    category?: string;
    albumCategoryId?: string;
    tags?: any;
    isPublic?: boolean;
    images: string[];
  }): Promise<Album> => {
    const resp = await apiClient.post<Album>('/albums', data);
    return resp.data;
  },

  addImages: async (id: string, images: string[]): Promise<Album> => {
    const resp = await apiClient.post<Album>(`/albums/${id}/images`, { images });
    return resp.data;
  },

  deleteAlbum: async (id: string): Promise<any> => {
    const resp = await apiClient.delete(`/albums/${id}`);
    return resp.data;
  },

  deleteImage: async (imageId: string): Promise<any> => {
    const resp = await apiClient.delete(`/albums/images/${imageId}`);
    return resp.data;
  },
};

