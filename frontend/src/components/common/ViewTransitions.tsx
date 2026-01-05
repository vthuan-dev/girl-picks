'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ViewTransitions() {
  const pathname = usePathname();

  useEffect(() => {
    // Enable View Transitions API if supported
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // The browser will handle transitions automatically
      return;
    }
  }, [pathname]);

  return null;
}

