'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsTracker } from '@/lib/analytics/tracker';

/**
 * Component to automatically track page views
 * Add this to your root layout or specific pages
 */
export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Track page view when pathname changes
    const title = typeof document !== 'undefined' ? document.title : undefined;
    analyticsTracker.trackPageView(pathname, title);
  }, [pathname]);

  return null; // This component doesn't render anything
}

