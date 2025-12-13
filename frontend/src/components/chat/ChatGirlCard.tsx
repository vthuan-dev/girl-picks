'use client';

import { useState } from 'react';
import Link from 'next/link';
import { chatSexApi } from '@/modules/chat-sex/api/chat-sex.api';

interface ChatGirlCardProps {
  girl: {
    id?: string;
    title: string;
    thumbnail: string;
    images?: string[]; // All available images for fallback
    year?: number;
    rating?: number;
    reviews?: number;
    views?: number;
    views2?: number;
    detailUrl?: string;
  };
}

export default function ChatGirlCard({ girl }: ChatGirlCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fallbackImages = girl.images || [];

  // Get current image URL with fallback logic
  const getCurrentImageUrl = () => {
    // Build array of all available images (thumbnail + images array)
    const allImages: string[] = [];

    // Filter function to exclude sprite images (they're broken/black)
    const isValidImage = (url: string) => {
      return url && !url.toLowerCase().includes('sprite');
    };

    // Add thumbnail if exists, different from first image, and not a sprite
    if (girl.thumbnail && isValidImage(girl.thumbnail) && girl.thumbnail !== fallbackImages[0]) {
      allImages.push(girl.thumbnail);
    }

    // Add all valid images from array (exclude sprites)
    const validImages = fallbackImages.filter(isValidImage);
    allImages.push(...validImages);

    // Get current image or fallback to placeholder
    if (currentImageIndex < allImages.length && allImages[currentImageIndex]) {
      return allImages[currentImageIndex];
    }

    // Final fallback
    return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop';
  };

  const handleImageError = () => {
    // Try next image
    setCurrentImageIndex(prev => prev + 1);
  };

  const thumbnailUrl = getCurrentImageUrl();

  const handleClick = async (e: React.MouseEvent) => {
    // Increment view count when card is clicked
    if (girl.id) {
      try {
        await chatSexApi.incrementView(girl.id);
      } catch (error) {
        console.error('Failed to increment view:', error);
      }
    }
  };

  return (
    <Link href={girl.detailUrl || `#`} className="block" onClick={handleClick}>
      <div className="group relative bg-background-light rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-secondary/30 hover:border-primary/50 transform hover:-translate-y-1">
        {/* Thumbnail Container */}
        <div className="relative w-full aspect-video overflow-hidden bg-secondary/20">
          {/* Using regular img instead of Next.js Image for better error handling */}
          <img
            src={thumbnailUrl}
            alt={girl.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Play Button Overlay - Removed for chat sex (profiles, not videos) */}

          {/* Duration Badge - Removed for chat sex (profiles, not videos) */}

          {/* Views Badge - Top Right */}
          {girl.views && (
            <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-xl z-10">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-text font-semibold text-xs">{girl.views >= 100000 ? '100K' : girl.views.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Card Footer - Information */}
        <div className="p-3 sm:p-4 bg-background-light">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-2 mb-2 min-h-[3rem]">
            {girl.title}
          </h3>

          {/* Year, Rating & Views Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary/20">
            <div className="flex items-center gap-2">
              {girl.year && (
                <span className="text-text-muted text-xs font-medium">{girl.year}</span>
              )}
              {girl.rating && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-text font-semibold text-xs">{girl.rating.toFixed(1)}</span>
                  {girl.reviews && girl.reviews > 0 && (
                    <span className="text-text-muted text-xs">({girl.reviews})</span>
                  )}
                </div>
              )}
            </div>

            {girl.views2 && girl.views2 > 0 && (
              <div className="flex items-center gap-1 text-text-muted text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{girl.views2 >= 1000 ? `${(girl.views2 / 1000).toFixed(1)}K` : girl.views2.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

