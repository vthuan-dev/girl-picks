'use client';

import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ClientHeader from '@/components/layout/ClientHeader';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== UserRole.CUSTOMER) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== UserRole.CUSTOMER) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <main>{children}</main>
    </div>
  );
}

