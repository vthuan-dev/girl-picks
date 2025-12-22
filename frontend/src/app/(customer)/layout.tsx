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
        <main className="lg:ml-[260px] min-h-screen bg-background">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

