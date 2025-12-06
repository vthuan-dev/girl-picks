'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Girl } from '@/types/girl';

interface GirlCardProps {
  girl: Girl;
}

export default function GirlCard({ girl }: GirlCardProps) {
  const imageUrl = girl.avatar || girl.images?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';

  return (
    <Link href={`/girls/${girl.id}`} className="block">
      <div className="group relative bg-background-light rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-secondary/30 hover:border-primary/50 transform hover:-translate-y-1">
        {/* Image Container - Top Section */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary/20">
          <Image
            src={imageUrl}
            alt={girl.fullName || 'Profile image'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
            unoptimized
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Top Left Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
            {girl.verified && (
              <div className="bg-primary text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Verified</span>
                <span className="sm:hidden">✓</span>
              </div>
            )}
            {girl.isAvailable && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">Online</span>
                <span className="sm:hidden">●</span>
              </div>
            )}
          </div>

          {/* Rating Badge - Top Right */}
          <div className="absolute top-2 right-2 bg-background/95 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl z-10">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-text font-bold text-sm">{girl.rating.toFixed(1)}</span>
            <span className="text-text-muted text-xs hidden sm:inline">({girl.totalReviews})</span>
          </div>
        </div>
        
        {/* Card Footer - Information Section - Bottom */}
        <div className="p-3 sm:p-4 bg-background-light">
          {/* Name */}
          <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {girl.fullName}
          </h3>
          
          {/* Location */}
          {girl.district && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted mb-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{girl.district.name}</span>
            </div>
          )}
          
          {/* Additional Info Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary/20">
            {/* Rating Display */}
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-text font-semibold text-xs">{girl.rating.toFixed(1)}</span>
            </div>
            
            {/* Bookings Count */}
            <div className="flex items-center gap-1 text-text-muted text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{girl.totalBookings || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
