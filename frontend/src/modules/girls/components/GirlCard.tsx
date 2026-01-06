'use client';

import Image from 'next/image';
import SmoothLink from '@/components/common/SmoothLink';
import { useState } from 'react';
import { Girl } from '@/types/girl';
import { girlsApi } from '../api/girls.api';
import { getFullImageUrl } from '@/lib/utils/image';

interface GirlCardProps {
  girl: Girl;
}

interface GirlCardInternalProps extends GirlCardProps {
  index?: number;
}

export default function GirlCard({ girl, index = 0 }: GirlCardInternalProps) {
  const imageUrl = girl.avatar || girl.images?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';

  // Use slug as the primary identifier for canonical URLs
  // This avoids the /girls/:id/:slug redirect loop in middleware
  const girlUrl = `/girls/${girl.slug || girl.id}`;

  // First 6 images should have priority for LCP optimization
  const isPriority = index < 6;

  return (
    <SmoothLink href={girlUrl} className="block">
      <div className="group relative bg-background-light rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer border border-secondary/30 hover:border-primary/50 transform hover:-translate-y-1 active:scale-95">
        {/* Image Container - Top Section */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary/20" style={{ viewTransitionName: `girl-image-${girl.id}` }}>
          <Image
            src={getFullImageUrl(imageUrl)}
            alt={girl.fullName || 'Profile image'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
            priority={isPriority}
            loading={isPriority ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAgEDBAMAAAAAAAAAAAAAAQIDAAQRBRIhMQYTQf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQADAAMAAAAAAAAAAAAAAAAAAQIDEyH/2gAMAwEAAhEDEEAAAADVtT1aK2sZpQEJVCQMdmooeylG0f/Z"
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
            <div className="flex items-center gap-0.5">
              {(() => {
                const rating = girl.rating ?? girl.ratingAverage ?? 0;
                const isRated = rating > 0;
                return (
                  <svg
                    className={`w-3 h-3 ${isRated ? 'text-yellow-400 fill-current' : 'text-secondary/30'}`}
                    fill={isRated ? 'currentColor' : 'none'}
                    stroke={isRated ? 'none' : 'currentColor'}
                    strokeWidth={isRated ? 0 : 2}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })()}
            </div>
            <span className="text-text font-bold text-sm">
              {(girl.rating ?? girl.ratingAverage ?? 0).toFixed(1)}
            </span>
            <span className="text-text-muted text-xs hidden sm:inline">
              ({girl.totalReviews ?? 0})
            </span>
          </div>
        </div>

        {/* Card Footer - Information Section - Bottom */}
        <div className="p-3 sm:p-4 bg-background-light">
          {/* Name */}
          <h3 className="text-sm sm:text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-1 mb-2">
            {girl.fullName}
          </h3>

          {/* Location (district + province) */}
          {(girl.district?.name || (girl as any).province || (girl as any).location) && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted mb-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">
                {(() => {
                  const districtName = girl.district?.name || '';
                  const provinceName = (girl as any).province || '';
                  const location = (girl as any).location || '';
                  if (districtName && provinceName) return `${districtName}, ${provinceName}`;
                  if (location) return location;
                  return districtName || provinceName;
                })()}
              </span>
            </div>
          )}

          {/* Rating Stars (1-5) */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-0.5">
              {(() => {
                const rating = girl.rating ?? girl.ratingAverage ?? 0;
                const isRated = rating > 0;
                return (
                  <svg
                    className={`w-3.5 h-3.5 ${isRated ? 'text-yellow-400 fill-current' : 'text-secondary/30'}`}
                    fill={isRated ? 'currentColor' : 'none'}
                    stroke={isRated ? 'none' : 'currentColor'}
                    strokeWidth={isRated ? 0 : 2}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })()}
            </div>
            <span className="text-text font-semibold text-xs">
              {(girl.rating ?? girl.ratingAverage ?? 0).toFixed(1)}
            </span>
            <span className="text-text-muted text-xs">
              ({girl.totalReviews ?? 0})
            </span>
          </div>

          {/* Price and View Count Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-secondary/20">
            {/* Price */}
            {girl.price && (
              <div className="flex items-center gap-1.5 text-primary font-bold text-sm sm:text-base">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{girl.price}</span>
              </div>
            )}

            {/* View Count */}
            {(girl.viewCount || 0) > 0 && (
              <div className="flex items-center gap-1 text-text-muted text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{(girl.viewCount || 0).toLocaleString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SmoothLink>
  );
}
