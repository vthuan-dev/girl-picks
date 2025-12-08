import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/modules/auth/api/auth.api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    if (!isAuthenticated && typeof window !== 'undefined') {
      const checkAuth = async () => {
        try {
          // Check if token exists in cookies first
          const token = document.cookie
            .split('; ')
            .find((row) => row.startsWith('accessToken='))
            ?.split('=')[1];
          
          if (!token) {
            // No token, user is not authenticated
            return;
          }

          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // User not authenticated
            logout();
          }
        } catch (error: any) {
          // User not authenticated or token invalid
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            logout();
          }
          // Silently fail for other errors (network issues, etc.)
        }
      };
      checkAuth();
    }
  }, [isAuthenticated, setUser, logout]);

  return {
    user,
    isAuthenticated,
    logout: () => {
      logout();
      router.push('/auth/login');
    },
  };
}

