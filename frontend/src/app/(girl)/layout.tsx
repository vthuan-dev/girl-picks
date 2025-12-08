'use client';

import { UserRole } from '@/types/auth';
import GirlSidebar from '@/components/layout/GirlSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function GirlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[UserRole.GIRL]}>
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar */}
          <GirlSidebar />
          
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

