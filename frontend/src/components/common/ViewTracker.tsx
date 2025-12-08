'use client';

import { useEffect } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { postsApi } from '@/modules/posts/api/posts.api';

interface ViewTrackerProps {
  type: 'girl' | 'post';
  id: string;
}

/**
 * Component to track views for girls and posts
 * Automatically increments view count when component mounts
 * Uses sessionStorage to prevent duplicate tracking in the same session
 */
export default function ViewTracker({ type, id }: ViewTrackerProps) {
  useEffect(() => {
    if (!id) return;

    // Check if already tracked in this session
    const storageKey = `viewed_${type}_${id}`;
    const alreadyTracked = sessionStorage.getItem(storageKey);
    
    if (alreadyTracked) {
      // Already tracked in this session, skip
      return;
    }

    // Track view count
    const trackView = async () => {
      try {
        if (type === 'girl') {
          await girlsApi.incrementView(id);
        } else if (type === 'post') {
          await postsApi.incrementView(id);
        }
        
        // Mark as tracked in this session
        sessionStorage.setItem(storageKey, 'true');
      } catch (error) {
        // Silently fail - view tracking should not break the page
        console.error('Failed to track view:', error);
      }
    };

    trackView();
  }, [type, id]);

  // This component doesn't render anything
  return null;
}

