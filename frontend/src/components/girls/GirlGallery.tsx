'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getFullImageUrl } from '@/lib/utils/image';

interface GirlGalleryProps {
  id: string;
  images: string[];
  name: string;
}

export default function GirlGallery({ id, images, name }: GirlGalleryProps) {
  // Filter out invalid images
  const validImages = (images || []).filter((img): img is string =>
    typeof img === 'string' && img.trim().length > 0
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Ensure selectedIndex is within bounds
  const safeSelectedIndex = Math.max(0, Math.min(selectedIndex, validImages.length - 1));
  const mainImage = validImages[safeSelectedIndex] || validImages[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';


  const handleImageError = (index: number, imageUrl?: string | null) => {
    try {
      // Check if this error was already handled
      if (imageErrors.has(index)) {
        return; // Already handled, skip
      }

      const safeImageUrl = imageUrl || '';
      const originalImage = validImages?.[index] || safeImageUrl || 'unknown';
      const safeOriginalImage = typeof originalImage === 'string' ? originalImage : 'unknown';

      // Only log warning (not error) for failed images - this is expected behavior
      // Use console.warn instead of console.error to reduce noise
      if (process.env.NODE_ENV === 'development') {
        console.warn('[GirlGallery] Image failed to load, using fallback:', {
          index,
          imageUrl: safeOriginalImage,
          totalImages: validImages.length,
        });
      }

      setImageErrors(prev => new Set(prev).add(index));
    } catch (error) {
      // Only log actual errors in error handling
      console.error('[GirlGallery] Error in handleImageError:', error, {
        index,
        imageUrl,
        validImagesLength: validImages.length,
      });
      setImageErrors(prev => new Set(prev).add(index));
    }
  };

  const getImageUrl = (image: string | undefined | null, index: number) => {
    try {
      if (!image || typeof image !== 'string' || image.trim().length === 0) {
        return '/images/logo/logo.png';
      }

      if (imageErrors.has(index)) {
        return '/images/logo/logo.png';
      }

      const processedUrl = getFullImageUrl(image);
      return processedUrl;
    } catch (error) {
      console.error('[GirlGallery] Error in getImageUrl:', error, { image, index });
      return '/images/logo/logo.png';
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;

    if (e.key === 'Escape') {
      setLightboxOpen(false);
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxOpen, validImages.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-background-light rounded-2xl overflow-hidden border border-secondary/30 shadow-lg">
        {/* Main Image */}
        <div
          className="relative w-full aspect-[3/4] max-h-[55vh] bg-secondary/20 overflow-hidden group cursor-pointer"
          onClick={() => openLightbox(selectedIndex)}
          style={{ viewTransitionName: `girl-image-${id}` }}
        >
          <Image
            src={getImageUrl(mainImage, safeSelectedIndex)}
            alt={`${name} - Ảnh ${selectedIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
            priority
            fetchPriority="high"
            // Bypass Next image optimization on VPS để không phải chờ proxy tải ảnh CDN
            unoptimized={true}
            decoding="async"
            onError={() => handleImageError(safeSelectedIndex, mainImage || '')}
          />

          {/* Zoom hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>

          {/* Image Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 backdrop-blur-md rounded-full hover:bg-background transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-xl"
                aria-label="Ảnh trước"
              >
                <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 backdrop-blur-md rounded-full hover:bg-background transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-xl"
                aria-label="Ảnh tiếp theo"
              >
                <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-lg text-sm text-text font-medium shadow-xl">
              {selectedIndex + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {validImages.length > 1 && (
          <div className="p-4 bg-background-light border-t border-secondary/30">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {validImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  onDoubleClick={() => openLightbox(index)}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedIndex === index
                    ? 'border-primary shadow-lg shadow-primary/30 scale-105'
                    : 'border-secondary/30 hover:border-primary/50'
                    }`}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <Image
                    src={getImageUrl(image, index)}
                    alt={`${name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    // Bypass Next image optimization trên VPS
                    unoptimized={true}
                    decoding="async"
                    onError={() => handleImageError(index, image)}
                  />
                  {selectedIndex === index && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar - Mobile friendly */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 to-transparent z-50">
            {/* Image Counter */}
            <div className="px-3 py-1.5 bg-black/50 rounded-lg text-white text-sm font-medium">
              {selectedIndex + 1} / {validImages.length}
            </div>

            {/* Close Button - Always visible on mobile */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              aria-label="Đóng"
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Image */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(validImages[selectedIndex], selectedIndex)}
              alt={`${name} - Ảnh ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized={validImages[selectedIndex]?.startsWith('http')}
              onError={() => handleImageError(selectedIndex, validImages[selectedIndex] || '')}
            />
          </div>

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Ảnh trước"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Ảnh tiếp theo"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnails Strip */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
              {validImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${selectedIndex === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-white/50'
                    }`}
                >
                  <Image
                    src={getImageUrl(image, index)}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={image?.startsWith('http')}
                    onError={() => handleImageError(index, image)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
