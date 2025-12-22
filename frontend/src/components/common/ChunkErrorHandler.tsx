'use client';

import { useEffect } from 'react';

export function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check if it's a chunk load error
      if (
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.name === 'ChunkLoadError'
      ) {
        console.warn('Chunk load error detected, reloading page...', error);
        
        // Clear cache and reload
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        
        // Reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    // Listen for unhandled errors
    window.addEventListener('error', handleChunkError);

    // Also listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.name === 'ChunkLoadError'
      ) {
        console.warn('Chunk load error in promise, reloading page...', error);
        event.preventDefault();
        
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              caches.delete(name);
            });
          });
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

