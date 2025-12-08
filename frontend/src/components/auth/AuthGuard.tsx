'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth';
import { authApi } from '@/modules/auth/api/auth.api';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  showLoading?: boolean;
}

export default function AuthGuard({
  children,
  allowedRoles = [],
  redirectTo = '/auth/login',
  showLoading = true,
}: AuthGuardProps) {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If already authenticated and user exists, check role
        if (isAuthenticated && user) {
          // If no role restrictions, allow access
          if (allowedRoles.length === 0) {
            setIsAuthorized(true);
            setIsChecking(false);
            return;
          }

          // Check if user role is allowed
          if (allowedRoles.includes(user.role)) {
            setIsAuthorized(true);
            setIsChecking(false);
            return;
          } else {
            // Role not allowed, redirect
            router.replace(redirectTo);
            setIsChecking(false);
            return;
          }
        }

        // Not authenticated, check token
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('accessToken='))
          ?.split('=')[1];

        if (!token) {
          // No token, redirect to login
          router.replace(redirectTo);
          setIsChecking(false);
          return;
        }

        // Token exists, verify with backend
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);

            // Check role if restrictions exist
            if (allowedRoles.length > 0) {
              if (allowedRoles.includes(response.data.role)) {
                setIsAuthorized(true);
              } else {
                router.replace(redirectTo);
              }
            } else {
              setIsAuthorized(true);
            }
          } else {
            // Invalid token, logout and redirect
            logout();
            router.replace(redirectTo);
          }
        } catch (error: any) {
          // Token invalid or expired
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            logout();
            router.replace(redirectTo);
          } else {
            // Network error, allow through (will be handled by component)
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, user, allowedRoles, redirectTo, router, setUser, logout]);

  if (isChecking && showLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

