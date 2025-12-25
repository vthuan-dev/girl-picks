'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { girlsApi } from '../api/girls.api';
import { Girl, GirlListParams } from '@/types/girl';
import GirlCard from './GirlCard';
import { PaginatedResponse } from '@/lib/api/types';

// Mock images - diverse and high quality
const mockImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&q=80',
];

const districts = ['Sài Gòn', 'Hà Nội', 'Đà Nẵng'];

interface GirlListProps {
  filters?: {
    verified?: boolean;
    price?: string;
    age?: string;
    height?: string;
    weight?: string;
    origin?: string;
    location?: string;
  };
  selectedProvince?: string | null;
  searchQuery?: string;
  selectedTag?: string | null;
  onTotalChange?: (total: number, isLoading: boolean) => void;
  onPageInfoChange?: (info: { total: number; page: number; limit: number }) => void;
}

export default function GirlList({ filters = {}, selectedProvince = null, searchQuery, selectedTag, onTotalChange, onPageInfoChange }: GirlListProps) {
  const [params, setParams] = useState<GirlListParams>({
    page: 1,
    limit: 20, // Match backend default
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setParams(prev => ({ ...prev, page: 1 }));
  }, [filters.verified, filters.price, filters.age, filters.height, filters.weight, filters.origin, filters.location, selectedProvince, selectedTag]);

  // Scroll to top when page changes
  useEffect(() => {
    if (params.page && params.page > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [params.page]);

  // Build query key for React Query caching
  const queryKey = useMemo(() => [
    'girls',
    'list',
    params.page,
    params.limit,
    filters.verified,
    filters.price,
    filters.age,
    filters.height,
    filters.weight,
    filters.origin,
    filters.location,
    selectedProvince,
    searchQuery,
    selectedTag,
  ], [params.page, params.limit, filters.verified, filters.price, filters.age, filters.height, filters.weight, filters.origin, filters.location, selectedProvince, searchQuery, selectedTag]);

  // Build filter params
  const filterParams: GirlListParams = useMemo(() => ({
    page: params.page || 1,
    limit: params.limit || 20,
    verified: filters.verified ? true : undefined,
    priceFilter: filters.price || undefined,
    ageFilter: filters.age || undefined,
    heightFilter: filters.height || undefined,
    weightFilter: filters.weight || undefined,
    originFilter: filters.origin || undefined,
    locationFilter: filters.location || undefined,
    province: selectedProvince || undefined,
    search: searchQuery || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
  }), [params.page, params.limit, filters.verified, filters.price, filters.age, filters.height, filters.weight, filters.origin, filters.location, selectedProvince, searchQuery, selectedTag]);

  // Use React Query to fetch and cache data
  const { data, isLoading, error, isFetching } = useQuery(
    queryKey,
    () => girlsApi.getGirls(filterParams),
    {
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
      cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      keepPreviousData: true, // Keep previous data while fetching new data
      refetchOnWindowFocus: false, // Don't refetch on window focus
    }
  );

  // Notify parent component about total count changes
  useEffect(() => {
    if (onTotalChange) {
      const total = data?.total || 0;
      onTotalChange(total, isLoading);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.total, isLoading]);

  // Notify parent about pagination info
  useEffect(() => {
    if (onPageInfoChange) {
      onPageInfoChange({
        total: (data as any)?.total || 0,
        page: params.page || 1,
        limit: params.limit || 20,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.total, params.page, params.limit]);

  // Map API response to Girl type
  const girls = useMemo(() => {
    if (!data?.data) return [];

    return (data.data || []).map((girl: any, index: number) => {
      // Handle images - can be JSON string or array
      let images: string[] = [];
      if (girl.images) {
        if (typeof girl.images === 'string') {
          try {
            images = JSON.parse(girl.images);
          } catch {
            images = [girl.images];
          }
        } else if (Array.isArray(girl.images)) {
          images = girl.images;
        }
      }

      // Sanitize image URLs; keep http(s) URLs and relative paths (starting with /)
      // Filter out blob:, file:, data: and other invalid protocols
      images = images.filter((url) => {
        if (typeof url !== 'string') return false;
        // Accept absolute URLs (http/https)
        if (/^https?:\/\//i.test(url)) return true;
        // Accept relative paths (starting with /)
        if (url.startsWith('/')) return true;
        // Reject everything else (blob:, file:, data:, etc.)
        return false;
      });

      // Use first image as avatar if available
      const avatar = images[0] || girl.avatarUrl || mockImages[index % mockImages.length];

      return {
        id: girl.id,
        email: girl.user?.email || girl.email || '',
        username: girl.name || '',
        fullName: girl.name || girl.user?.fullName || 'N/A',
        role: 'GIRL' as any,
        avatar,
        images: images.length > 0 ? images : [avatar],
        isActive: girl.isActive !== false,
        createdAt: girl.createdAt || new Date().toISOString(),
        updatedAt: girl.updatedAt || new Date().toISOString(),
        bio: girl.bio || '',
        verified: girl.verificationStatus === 'VERIFIED',
        rating: girl.ratingAverage || 0,
        totalReviews: girl.totalReviews || 0,
        totalBookings: girl._count?.bookings || 0,
        isAvailable: girl.isAvailable !== false,
        districtId: girl.districtId,
        district: girl.district,
        province: girl.province || (girl.location ? String(girl.location).split('/')[0] : undefined),
        location: girl.location,
        tags: Array.isArray(girl.tags) ? girl.tags : (typeof girl.tags === 'string' ? JSON.parse(girl.tags || '[]') : []),
        slug: girl.slug || null,
        price: girl.price || null,
        viewCount: girl.viewCount || 0,
        age: girl.age || null,
        height: girl.height || null,
        weight: girl.weight || null,
        origin: girl.origin || null,
      } as Girl & { age?: number | null; height?: string | null; weight?: string | null; origin?: string | null };
    });
  }, [data]);

  // Calculate pagination
  const pagination = useMemo(() => {
    const total = data?.total || 0;
    const limit = data?.limit || params.limit || 20;
    const page = data?.page || params.page || 1;
    const totalPages = data?.totalPages || (total > 0 ? Math.ceil(total / limit) : 0);
    const hasNextByCount = (data?.data?.length || 0) === limit;

    return {
      total,
      totalPages,
      page,
      hasNext: totalPages > 0 ? page < totalPages : hasNextByCount,
      hasPrev: page > 1,
      hasNextByCount,
    };
  }, [data, params.limit, params.page]);

  const loading = isLoading || isFetching;

  // Show loading overlay when fetching new page
  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-background-light border border-secondary/30 rounded-lg overflow-hidden animate-pulse">
            <div className="w-full aspect-[3/4] bg-secondary/30"></div>
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
              <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
              <div className="h-3 bg-secondary/30 rounded w-2/3 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (girls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-text-muted mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-text-muted text-base sm:text-lg">Không tìm thấy kết quả</p>
        <p className="text-text-muted text-xs sm:text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading overlay when fetching new page */}
      {isFetching && data && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="bg-background-light px-6 py-4 rounded-lg shadow-xl border border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-text font-medium">Đang tải...</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {girls.map((girl, index) => (
          <GirlCard key={girl.id} girl={girl} index={index} />
        ))}
      </div>

      {/* PornHub Style Pagination */}
      {(pagination.totalPages > 1 || pagination.hasPrev || pagination.hasNextByCount) && (
        <div className="flex justify-center items-center mt-10 sm:mt-14">
          <div className="inline-flex items-center bg-[#1a1a1a] rounded-md overflow-hidden shadow-lg border border-[#2a2a2a]">
            {/* Previous Button */}
            <button
              onClick={() => {
                const newPage = (params.page || 1) - 1;
                console.log('[GirlList] Previous page clicked, going to page:', newPage);
                setParams({ ...params, page: newPage });
              }}
              disabled={pagination.page === 1 || isFetching}
              className="px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-all border-r border-[#2a2a2a]"
            >
              Prev
            </button>

            {/* Page Numbers */}
            <div className="flex items-center">
              {/* First page if not visible */}
              {pagination.page > 3 && pagination.totalPages > 1 && (
                <>
                  <button
                    onClick={() => {
                      console.log('[GirlList] Page 1 clicked');
                      setParams({ ...params, page: 1 });
                    }}
                    disabled={isFetching}
                    className="px-3.5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-[#2a2a2a] transition-all border-r border-[#2a2a2a] disabled:opacity-50"
                  >
                    1
                  </button>
                  <span className="px-2 text-white/40 text-sm">...</span>
                </>
              )}

              {/* Visible page range */}
              {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                // Show 3 pages before and after current page
                const startPage = Math.max(1, Math.min(pagination.page - 3, pagination.totalPages - 6));
                const page = startPage + i;

                if (page > pagination.totalPages) return null;

                const isActive = pagination.page === page;

                return (
                  <button
                    key={page}
                    onClick={() => {
                      console.log('[GirlList] Page clicked:', page);
                      setParams({ ...params, page });
                    }}
                    disabled={isFetching || isActive}
                    className={`px-3.5 py-2.5 text-sm font-bold transition-all border-r border-[#2a2a2a] min-w-[44px] ${isActive
                        ? 'bg-primary text-white cursor-default'
                        : 'text-white/70 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Last page if not visible */}
              {pagination.page < pagination.totalPages - 3 && pagination.totalPages > 7 && (
                <>
                  <span className="px-2 text-white/40 text-sm">...</span>
                  <button
                    onClick={() => {
                      console.log('[GirlList] Last page clicked:', pagination.totalPages);
                      setParams({ ...params, page: pagination.totalPages });
                    }}
                    disabled={isFetching}
                    className="px-3.5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-[#2a2a2a] transition-all border-r border-[#2a2a2a] disabled:opacity-50"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                const newPage = (params.page || 1) + 1;
                console.log('[GirlList] Next page clicked, going to page:', newPage);
                setParams({ ...params, page: newPage });
              }}
              disabled={!pagination.hasNext || isFetching}
              className="px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
