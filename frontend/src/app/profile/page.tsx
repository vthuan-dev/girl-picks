'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // Redirect to the correct profile page based on role
    switch (user.role) {
      case UserRole.ADMIN:
        router.push('/admin/dashboard');
        break;
      case UserRole.GIRL:
        router.push('/girl/profile');
        break;
      case UserRole.CUSTOMER:
      case UserRole.STAFF_UPLOAD:
        router.push('/customer/profile');
        break;
      default:
        router.push('/');
    }
  }, [user, isAuthenticated, router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-muted">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}

