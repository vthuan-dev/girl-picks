'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, MouseEvent } from 'react';

interface SmoothLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  scroll?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function SmoothLink({
  href,
  children,
  className,
  prefetch = true,
  scroll = true,
  onClick,
  ...props
}: SmoothLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // If it's a regular click (not cmd/ctrl+click, etc.)
    if (
      e.button === 0 && // left click
      !e.metaKey && // not cmd on Mac
      !e.ctrlKey && // not ctrl
      !e.shiftKey && // not shift
      !e.altKey && // not alt
      !e.defaultPrevented
    ) {
      e.preventDefault();

      // Use View Transitions API if available for smooth transition
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        const transition = (document as any).startViewTransition(() => {
          router.push(href);
        });
        
        // Optional: handle transition events
        transition.finished.catch(() => {
          // Transition was interrupted or failed, that's okay
        });
      } else {
        // Fallback for browsers without View Transitions API
        router.push(href);
      }
    }
  };

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      scroll={scroll}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}

