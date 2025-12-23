'use client';

import Image from 'next/image';
import Link from 'next/link';

interface MovieCardProps {
  movie: {
    id?: string;
    title: string;
    thumbnail: string;
    duration?: string;
    views?: number;
    rating?: string;
    detailUrl?: string;
    category?: string;
    poster?: string;
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const thumbnailUrl = movie.thumbnail || movie.poster || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop';

  return (
    <Link href={movie.detailUrl || `#`} className="block">
      <div className="group relative bg-background-light rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-secondary/30 hover:border-primary/50 transform hover:-translate-y-1">
        {/* Thumbnail Container */}
        <div className="relative w-full aspect-video overflow-hidden bg-secondary/20">
          <Image
            src={thumbnailUrl}
            alt={movie.title || 'Phim'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            unoptimized
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Duration Badge - Bottom Left */}
          {movie.duration && (
            <div className="absolute bottom-2 left-2 bg-background/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-xl z-10">
              <svg className="w-3.5 h-3.5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-text font-semibold text-xs">{movie.duration}</span>
            </div>
          )}

          {/* Views Badge - Top Right */}
          {movie.views && (
            <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 shadow-xl z-10">
              <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-text font-semibold text-xs">{movie.views.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Card Footer - Information */}
        <div className="p-3 sm:p-4 bg-background-light">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-2 mb-2 min-h-[3rem]">
            {movie.title}
          </h3>

          {/* Category & Info Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary/20">
            {movie.category && (
              <div className="flex items-center gap-1.5">
                <span className="text-primary text-xs font-medium px-2 py-1 bg-primary/10 rounded-md">
                  {movie.category}
                </span>
              </div>
            )}

            {movie.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-text font-semibold text-xs">{movie.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

