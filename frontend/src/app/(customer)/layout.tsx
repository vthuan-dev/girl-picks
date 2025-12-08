'use client';

import { UserRole } from '@/types/auth';
import CustomerSidebar from '@/components/layout/CustomerSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard 
      allowedRoles={[UserRole.CUSTOMER, UserRole.STAFF_UPLOAD, UserRole.GIRL]}
    >
      <div className="min-h-screen bg-background">
        <CustomerSidebar />
        
        {/* Main Content */}
        <main className="lg:ml-[260px] min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

