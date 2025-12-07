'use client';

import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Optimize: chỉ subscribe những fields cần thiết với selector
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.user?.role);
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  // Chỉ check auth một lần khi mount hoặc khi auth state thay đổi
  useEffect(() => {
    // Nếu đã authenticated và là admin, không cần check lại
    if (isAuthenticated && userRole === UserRole.ADMIN) {
      setIsChecking(false);
      return;
    }

    // Nếu chưa authenticated hoặc không phải admin, redirect
    if (!isAuthenticated || userRole !== UserRole.ADMIN) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, userRole, router]);

  // Memoize để tránh re-render không cần thiết
  const isAuthorized = useMemo(() => {
    return isAuthenticated && userRole === UserRole.ADMIN;
  }, [isAuthenticated, userRole]);

  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <AdminHeader />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

