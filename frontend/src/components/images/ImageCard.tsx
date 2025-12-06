'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ImageCardProps {
  image: {
    id?: string;
    title?: string;
    url: string;
    thumbnail?: string;
    views?: number;
    likes?: number;
    category?: string;
    tags?: string[];
  };
}

export default function ImageCard({ image }: ImageCardProps) {
  const imageUrl = image.url || image.thumbnail || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop';

  return (
    <Link href={`#`} className="block">
      <div className="group relative bg-background-light rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-secondary/30 hover:border-primary/50 transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary/20">
          <Image
            src={imageUrl}
            alt={image.title || 'Image'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            unoptimized
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Top Right Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            {image.views && (
              <div className="bg-background/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-xl">
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-text font-semibold text-xs">{image.views.toLocaleString()}</span>
              </div>
            )}
            {image.likes && (
              <div className="bg-background/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-xl">
                <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="text-text font-semibold text-xs">{image.likes.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Card Footer - Information */}
        <div className="p-3 sm:p-4 bg-background-light">
          {/* Title */}
          {image.title && (
            <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-1 mb-2">
              {image.title}
            </h3>
          )}
          
          {/* Category & Tags */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary/20">
            {image.category && (
              <div className="flex items-center gap-1.5">
                <span className="text-primary text-xs font-medium px-2 py-1 bg-primary/10 rounded-md">
                  {image.category}
                </span>
              </div>
            )}
            
            {image.tags && image.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-text-muted text-xs">{image.tags.length} tags</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

