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
          const response = await authApi.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          // User not authenticated
          logout();
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

