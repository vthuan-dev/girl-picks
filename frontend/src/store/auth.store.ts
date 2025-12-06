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
        // Store tokens in cookies for HTTP-only security
        Cookies.set('accessToken', authData.accessToken, { expires: 1 }); // 1 day
        Cookies.set('refreshToken', authData.refreshToken, { expires: 7 }); // 7 days

        set({
          user: authData.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
          isAdmin: authData.user.role === UserRole.ADMIN,
        });
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

