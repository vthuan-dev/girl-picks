'use client';

import { UserRole } from '@/types/auth';
import ClientHeader from '@/components/layout/ClientHeader';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[UserRole.CUSTOMER]}>
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main>{children}</main>
    </div>
    </AuthGuard>
  );
}

