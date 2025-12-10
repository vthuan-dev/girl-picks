'use client';

import { UserRole } from '@/types/auth';
import dynamic from 'next/dynamic';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

// Dynamic import AdminHeader to avoid SSR issues
const AdminHeader = dynamic(
  () => import('@/components/layout/AdminHeader'),
  { ssr: false }
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="min-h-screen bg-background">
        {/* Top Header - Fixed */}
        <AdminHeader />
        
        <div className="flex pt-16">
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
    </AuthGuard>
  );
}

