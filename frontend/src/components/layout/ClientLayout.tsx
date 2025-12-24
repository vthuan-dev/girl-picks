'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import PageViewTracker from '@/components/analytics/PageViewTracker';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Không render Header/Footer cho admin routes, auth routes
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname?.startsWith('/auth');
  const isCustomerRoute = pathname === '/profile' ||
    pathname?.startsWith('/profile/') ||
    pathname?.startsWith('/messages') ||
    pathname?.startsWith('/search') ||
    pathname?.startsWith('/client') ||
    pathname?.startsWith('/girl') ||
    pathname?.startsWith('/customer');

  if (isAdminRoute || isAuthRoute) {
    return <>{children}</>;
  }

  // Customer routes: giữ layout riêng nhưng vẫn có footer
  if (isCustomerRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main id="main-content" className="flex-1 pb-24" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-1 bg-background pb-24 pt-14 sm:pt-16 lg:pt-[72px]" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

