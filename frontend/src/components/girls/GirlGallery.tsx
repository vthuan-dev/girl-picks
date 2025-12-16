'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface GirlGalleryProps {
  images: string[];
  name: string;
}

export default function GirlGallery({ images, name }: GirlGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const mainImage = images[selectedIndex] || images[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    
    if (e.key === 'Escape') {
      setLightboxOpen(false);
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    }
  }, [lightboxOpen, images.length]);

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
        >
          <Image
            src={mainImage}
            alt={`${name} - Ảnh ${selectedIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
            priority
            unoptimized
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
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
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
                  setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
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
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-background/90 backdrop-blur-md rounded-lg text-sm text-text font-medium shadow-xl">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-4 bg-background-light border-t border-secondary/30">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  onDoubleClick={() => openLightbox(index)}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedIndex === index
                      ? 'border-primary shadow-lg shadow-primary/30 scale-105'
                      : 'border-secondary/30 hover:border-primary/50'
                  }`}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${name} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
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
              {selectedIndex + 1} / {images.length}
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
              src={images[selectedIndex]}
              alt={`${name} - Ảnh ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
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
                  setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
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
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                    selectedIndex === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
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
