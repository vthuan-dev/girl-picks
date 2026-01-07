'use client';

import { useLayoutEffect } from 'react';

interface GirlDetailClientProps {
  children: React.ReactNode;
}

export default function GirlDetailClient({ children }: GirlDetailClientProps) {
  // Use useLayoutEffect to scroll before browser paint
  useLayoutEffect(() => {
    // Scroll to top immediately when component mounts (page loads)
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return <>{children}</>;
}

