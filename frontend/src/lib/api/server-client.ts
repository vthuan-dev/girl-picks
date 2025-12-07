import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Server-side API client using fetch
 * Use this in Server Components and Server Actions
 */
export async function serverApiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const url = `${API_URL}/api${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      // Handle 404
      if (response.status === 404) {
        throw new Error('Not Found');
      }
      // Handle other errors
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Get girl by ID (server-side)
 */
export async function getGirlById(id: string) {
  return serverApiClient<{ id: string; fullName: string; [key: string]: any }>(`/girls/${id}`);
}

/**
 * Get girls list (server-side)
 */
export async function getGirls(params?: {
  page?: number;
  limit?: number;
  districtId?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.districtId) queryParams.append('districtId', params.districtId);
  if (params?.search) queryParams.append('search', params.search);

  const queryString = queryParams.toString();
  const endpoint = `/girls${queryString ? `?${queryString}` : ''}`;
  
  return serverApiClient<{ data: any[]; total: number; page: number; limit: number }>(endpoint);
}

