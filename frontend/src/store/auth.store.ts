import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthResponse, UserRole } from '@/types/auth';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (authData: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,

      setAuth: (authData: AuthResponse) => {
        try {
          // Validate required fields
          if (!authData) {
            throw new Error('Auth data is missing');
          }

          if (!authData.accessToken || !authData.refreshToken) {
            throw new Error('Authentication tokens are missing');
          }

          if (!authData.user) {
            throw new Error('User data is missing from auth response');
          }

          // Store tokens in cookies for HTTP-only security
          Cookies.set('accessToken', authData.accessToken, { expires: 1 }); // 1 day
          Cookies.set('refreshToken', authData.refreshToken, { expires: 7 }); // 7 days

          // Map backend user to frontend user format
          // Backend doesn't return username, so we generate it from email
          const user: User = {
            id: authData.user.id,
            email: authData.user.email,
            fullName: authData.user.fullName,
            role: authData.user.role,
            phone: authData.user.phone,
            isActive: authData.user.isActive ?? true,
            createdAt: authData.user.createdAt || new Date().toISOString(),
            updatedAt: authData.user.updatedAt || new Date().toISOString(),
            // Generate username from email if not provided
            username: authData.user.username || (authData.user.email ? authData.user.email.split('@')[0] : 'user'),
            // Map avatar fields
            avatar: authData.user.avatarUrl || authData.user.avatar,
            avatarUrl: authData.user.avatarUrl || authData.user.avatar,
          };

          set({
            user,
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            isAuthenticated: true,
            isAdmin: authData.user.role === UserRole.ADMIN,
          });
        } catch (error: any) {
          console.error('❌ Error in setAuth:', error);
          console.error('Auth data received:', authData);
          throw error;
        }
      },

      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          isAdmin: user.role === UserRole.ADMIN,
        });
      },

      logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...userData } : null;
          return {
            user: updatedUser,
            isAdmin: updatedUser?.role === UserRole.ADMIN || false,
          };
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

