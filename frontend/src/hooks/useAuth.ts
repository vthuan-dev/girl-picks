import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/modules/auth/api/auth.api';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    // Only check if we have a token in storage
    if (!isAuthenticated && typeof window !== 'undefined') {
      const checkAuth = async () => {
        try {
          // Check if token exists in cookies/localStorage first
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
            // Backend not available or user not authenticated
            logout();
          }
        } catch (error) {
          // User not authenticated or backend error
          // Don't logout immediately, might be backend not ready
          console.warn('Auth check failed:', error);
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

