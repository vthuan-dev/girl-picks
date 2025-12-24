'use client';

import { useEffect, useRef } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { postsApi } from '@/modules/posts/api/posts.api';

interface ViewTrackerProps {
  type: 'girl' | 'post';
  id: string;
}

/**
 * Component to track views for girls and posts
 * Automatically increments view count when component mounts
 * Uses sessionStorage + timestamp to prevent duplicate tracking
 * Prevents tracking on rapid navigation/reload
 */
export default function ViewTracker({ type, id }: ViewTrackerProps) {
  const hasTrackedRef = useRef(false);
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) return;

    // Prevent multiple calls in the same render cycle
    if (hasTrackedRef.current) {
      return;
    }

    // Check if already tracked in this session (with timestamp check)
    const storageKey = `viewed_${type}_${id}`;
    const trackedData = sessionStorage.getItem(storageKey);

    // Only allow tracking again after 2 minutes (120000ms)
    const COOLDOWN_MS = 120000;

    if (trackedData) {
      try {
        const { timestamp } = JSON.parse(trackedData);
        const now = Date.now();
        if (now - timestamp < COOLDOWN_MS) {
          return;
        }
      } catch {
        // If parsing fails, treat as old format and allow tracking
      }
    }

    // Clear any existing timeout
    if (trackingTimeoutRef.current) {
      clearTimeout(trackingTimeoutRef.current);
    }

    // Add a small delay to prevent tracking on rapid navigation
    trackingTimeoutRef.current = setTimeout(async () => {
      // Double check after delay
      if (hasTrackedRef.current) {
        return;
      }

      // Check storage again right before calling API to handle rapid navigation/reload
      const latestTrackedData = sessionStorage.getItem(storageKey);
      if (latestTrackedData) {
        try {
          const { timestamp } = JSON.parse(latestTrackedData);
          if (Date.now() - timestamp < COOLDOWN_MS) return;
        } catch { }
      }

      // Mark as tracked IMMEDIATELY to prevent race conditions
      hasTrackedRef.current = true;
      sessionStorage.setItem(storageKey, JSON.stringify({
        tracked: true,
        timestamp: Date.now(),
      }));

      try {
        if (type === 'girl') {
          await girlsApi.incrementView(id);
        } else if (type === 'post') {
          await postsApi.incrementView(id);
        }
      } catch (error) {
        // Silently fail - view tracking should not break the page
        console.error('Failed to track view:', error);
        // We don't reset sessionStorage here to prevent spamming failed retries
        // hasTrackedRef is local to the component instance so it's fine
      }
    }, 1000); // 1 second delay to prevent tracking on unintentional navigation

    // Cleanup function
    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, [type, id]);

  // This component doesn't render anything
  return null;
}

