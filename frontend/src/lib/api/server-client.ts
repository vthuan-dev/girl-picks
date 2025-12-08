import { cookies } from 'next/headers';

// For server-side rendering, we need to detect Docker environment at runtime
// NEXT_PUBLIC_API_URL is embedded at build time, but we need runtime detection for server-side
// In Docker, backend service is accessible via 'backend' hostname
// For local development, use 'localhost'
const getApiUrl = () => {
  // Check for explicit API_URL environment variable (set at runtime, not build time)
  if (process.env.API_URL) {
    console.log(`[getApiUrl] Using API_URL from env: ${process.env.API_URL}`);
    return process.env.API_URL;
  }
  
  // In Docker container, always use backend service name when in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`[getApiUrl] Production mode, using backend service: http://backend:3001`);
    return 'http://backend:3001';
  }
  
  // Default: use localhost for local development
  console.log(`[getApiUrl] Development mode, using localhost: http://localhost:3001`);
  return 'http://localhost:3001';
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
  
  console.log(`[serverApiClient] Fetching: ${url}`);
  
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
    
    console.log(`[serverApiClient] Response status: ${response.status} for ${url}`);

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
export async function getGirlById(id: string) {
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

