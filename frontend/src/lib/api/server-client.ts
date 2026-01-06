import { cookies } from 'next/headers';
import { cache } from 'react';

// For server-side rendering, we need to detect Docker environment at runtime
// NEXT_PUBLIC_API_URL is embedded at build time, but we need runtime detection for server-side
// Always use environment variables, never hardcode URLs
const getApiUrl = () => {
  // Priority 1: Check for explicit API_URL environment variable (set at runtime, not build time)
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  // Priority 2: Use NEXT_PUBLIC_API_URL if available (for VPS deployment)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // No hardcoded fallback - require environment variable to be set
  const errorMsg = 'API_URL or NEXT_PUBLIC_API_URL must be set in environment variables';
  console.error(`[getApiUrl] ERROR: ${errorMsg}`);
  throw new Error(errorMsg);
};

const API_URL = getApiUrl();

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

  const url = `${API_URL}${endpoint}`;


  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Determine caching strategy based on endpoint
    // Girl detail pages can be cached with ISR for better performance
    const isGirlDetailEndpoint = /^\/girls\/[^\/]+$/.test(endpoint) && !endpoint.includes('?');
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      ...(isGirlDetailEndpoint
        ? { next: { revalidate: 60 } } // Cache for 60 seconds with ISR
        : { cache: 'no-store' as RequestCache }), // Always fresh for other endpoints
    };

    const response = await fetch(url, fetchOptions);


    if (!response.ok) {
      // Handle 404
      if (response.status === 404) {
        const errorText = await response.text();
        console.error(`API 404 Error [${endpoint}]:`, errorText);
        throw new Error('Not Found');
      }
      // Handle other errors
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error [${endpoint}]:`, response.status, errorData);
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error.message || error);
    throw error;
  }
}

/**
 * Get girl by ID (server-side)
 */
export const getGirlById = cache(async (id: string) => {
  try {
    const response = await serverApiClient<any>(`/girls/${id}`);

    // Backend returns {success: true, data: {...}}
    if (response && typeof response === 'object') {
      // If wrapped in {success: true, data: {...}}
      if ('success' in response && 'data' in response && response.success) {
        const girlData = (response as any).data;
        // Ensure we return the girl object directly
        if (girlData && (girlData.id || girlData.name)) {
          return { data: girlData };
        }
        return { data: girlData };
      }
      // If direct data object (shouldn't happen but handle it)
      if ('id' in response || 'name' in response || 'fullName' in response) {
        return { data: response };
      }
      // If response.data exists but not wrapped
      if ('data' in response) {
        return { data: (response as any).data };
      }
    }

    // Fallback
    return { data: response };
  } catch (error: any) {
    console.error(`Failed to fetch girl ${id}:`, error);
    // Re-throw to trigger notFound() in page component
    throw error;
  }
});

/**
 * Get girl by slug (server-side)
 */
export const getGirlBySlug = cache(async (slug: string) => {
  try {
    const response = await serverApiClient<any>(`/girls/${slug}`);
    if (response && typeof response === 'object') {
      if ('success' in response && 'data' in response && (response as any).success) {
        return { data: (response as any).data };
      }
      if ('id' in response || 'name' in response || 'fullName' in response) {
        return { data: response };
      }
      if ('data' in response) {
        return { data: (response as any).data };
      }
    }
    return { data: response };
  } catch (error: any) {
    console.error(`Failed to fetch girl by slug ${slug}:`, error);
    throw error;
  }
});

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

