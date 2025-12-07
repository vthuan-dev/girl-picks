'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GirlGalleryProps {
  images: string[];
  name: string;
}

export default function GirlGallery({ images, name }: GirlGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mainImage = images[selectedIndex] || images[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';

  return (
    <div className="bg-background-light rounded-2xl overflow-hidden border border-secondary/30 shadow-lg">
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] bg-secondary/20 overflow-hidden group">
        <Image
          src={mainImage}
          alt={`${name} - Ảnh ${selectedIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
          priority
          unoptimized
        />
        
        {/* Image Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 backdrop-blur-md rounded-full hover:bg-background transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10 shadow-xl"
              aria-label="Ảnh trước"
            >
              <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
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
  );
}

