'use client';

import { useState, useEffect } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { Girl } from '@/types/girl';
import SmoothLink from '@/components/common/SmoothLink';
import Image from 'next/image';

interface RelatedGirlsProps {
  currentGirlId: string;
  districtId?: string;
}

export default function RelatedGirls({ currentGirlId, districtId }: RelatedGirlsProps) {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedGirls = async () => {
      try {
        setLoading(true);
        console.log('[RelatedGirls] Fetching with districtId:', districtId, 'currentGirlId:', currentGirlId);

        const response = await girlsApi.getGirls({
          limit: 10,
          ...(districtId && { districtId }),
        });

        console.log('[RelatedGirls] Full response:', response);

        // API returns PaginatedResponse<Girl> = { data: Girl[], meta: {...} }
        const girlsList: Girl[] = response?.data || [];

        console.log('[RelatedGirls] Extracted girls list:', girlsList.length, 'girls');

        // Filter out current girl
        const relatedGirls = girlsList.filter((girl: Girl) => girl && girl.id && girl.id !== currentGirlId);
        console.log('[RelatedGirls] Filtered related girls:', relatedGirls.length);

        setGirls(relatedGirls.slice(0, 8)); // Show max 8
      } catch (error) {
        console.error('Failed to fetch related girls:', error);
        // Use mock data on error
        const mockGirls: Girl[] = [
          {
            id: '31881',
            email: 'phuongbaby@example.com',
            username: 'phuongbaby',
            fullName: 'PHƯƠNG BABY GÁI DÂM-SKILL SEX',
            role: 'GIRL' as any,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
            phone: '0901234567',
            isActive: true,
            createdAt: '2024-02-28T00:00:00Z',
            updatedAt: new Date().toISOString(),
            bio: 'Gái dâm, skill sex tốt',
            verified: true,
            rating: 4.5,
            totalReviews: 2,
            totalBookings: 237,
            isAvailable: true,
            districtId: '1',
            district: { id: '1', name: 'Thuận An', code: 'THUAN_AN' },
            images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'],
          },
          {
            id: '31882',
            email: 'thuylinh@example.com',
            username: 'thuylinh',
            fullName: 'Thuỳ Linh Baby KuTe Dễ Thương',
            role: 'GIRL' as any,
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
            phone: '0901234568',
            isActive: true,
            createdAt: '2022-08-22T00:00:00Z',
            updatedAt: new Date().toISOString(),
            bio: 'Dễ thương, chiều khách',
            verified: true,
            rating: 5.0,
            totalReviews: 34,
            totalBookings: 495,
            isAvailable: true,
            districtId: '1',
            district: { id: '1', name: 'Thuận An', code: 'THUAN_AN' },
            images: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop'],
          },
          {
            id: '31883',
            email: 'buoi@example.com',
            username: 'buoi',
            fullName: 'Bưởi Khổng Lồ Siêu Bím Rậ',
            role: 'GIRL' as any,
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
            phone: '0901234569',
            isActive: true,
            createdAt: '2023-01-26T00:00:00Z',
            updatedAt: new Date().toISOString(),
            bio: 'Siêu vú to, 1m70',
            verified: false,
            rating: 0,
            totalReviews: 0,
            totalBookings: 133,
            isAvailable: true,
            districtId: '1',
            district: { id: '1', name: 'Thuận An', code: 'THUAN_AN' },
            images: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop'],
          },
          {
            id: '31884',
            email: 'vananh@example.com',
            username: 'vananh',
            fullName: 'Vân Anh - Em Gái Xinh đẹp, Dễ Thương',
            role: 'GIRL' as any,
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
            phone: '0901234570',
            isActive: true,
            createdAt: '2020-09-30T00:00:00Z',
            updatedAt: new Date().toISOString(),
            bio: 'Xinh đẹp, dễ thương',
            verified: true,
            rating: 5.0,
            totalReviews: 2,
            totalBookings: 293,
            isAvailable: true,
            districtId: '1',
            district: { id: '1', name: 'Thuận An', code: 'THUAN_AN' },
            images: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop'],
          },
        ];
        const filtered = mockGirls.filter((g) => g.id !== currentGirlId);
        setGirls(filtered.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedGirls();
  }, [currentGirlId, districtId]);

  if (loading) {
    return (
      <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
        <h2 className="text-xl font-bold text-text mb-4">Gái gọi liên quan</h2>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-secondary/20 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary/20 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (girls.length === 0) {
    return (
      <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
        <h2 className="text-xl font-bold text-text mb-4">Gái gọi liên quan</h2>
        <p className="text-text-muted text-sm">Chưa có gái gọi liên quan</p>
      </div>
    );
  }

  return (
    <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
      <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Gái gọi liên quan
      </h2>

      {/* Grid layout: gái liên quan sắp xếp từ trái sang phải */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {girls.map((girl) => {
          // Resolve image: prefer avatar, else first image (handle JSON string), else fallback
          const resolvedImage = (() => {
            if (girl.avatar) return girl.avatar;
            if (girl.images) {
              if (Array.isArray(girl.images) && girl.images.length > 0) return girl.images[0] as string;
              if (typeof girl.images === 'string') {
                try {
                  const parsed = JSON.parse(girl.images);
                  if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
                } catch {
                  // ignore parse errors
                }
              }
            }
            return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';
          })();

          return (
            <SmoothLink
              key={girl.id}
              href={`/girls/${girl.slug || encodeURIComponent(girl.fullName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-'))}`}
              className="flex flex-col rounded-xl hover:bg-background border border-secondary/20 hover:border-primary/30 transition-all group cursor-pointer overflow-hidden text-xs sm:text-sm"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-40 sm:h-44 rounded-t-xl overflow-hidden bg-secondary/20">
                <Image
                  src={resolvedImage}
                  alt={girl.fullName || 'Gái gọi'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="96px"
                  unoptimized
                />
                {girl.verified && (
                  <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-1 shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 p-2 sm:p-3">
                <h3 className="font-semibold text-text group-hover:text-primary transition-colors line-clamp-2 mb-1 text-xs leading-tight sm:text-sm">
                  {girl.fullName}
                </h3>

                {/* Location */}
                {girl.district && (
                  <div className="flex items-center gap-1 text-xs text-text-muted mb-2">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{girl.district.name}</span>
                  </div>
                )}

                {/* Price */}
                <div className="text-primary font-bold text-sm mb-2">
                  350K
                </div>

                {/* Views, Rating, Date */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{((girl.totalBookings || 0) * 1000 + Math.floor(Math.random() * 100000)).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const rating = girl.rating || 0;
                        const filled = i < Math.floor(rating);
                        const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;
                        return (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${filled
                                ? 'text-yellow-400 fill-current'
                                : halfFilled
                                  ? 'text-yellow-400 fill-current opacity-50'
                                  : 'text-secondary/30'
                              }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                    </div>
                    <span className="text-xs text-text font-medium">
                      {(girl.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-xs text-text-muted">
                      ({girl.totalReviews || 0})
                    </span>
                  </div>

                  <div className="text-xs text-text-muted">
                    {new Date(girl.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </SmoothLink>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-secondary/30 flex justify-center">
        <SmoothLink
          href="/girls"
          className="inline-flex items-center justify-center mx-auto px-5 py-2.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/40 hover:bg-primary hover:text-white hover:border-primary shadow-sm hover:shadow-primary/30 transition-all cursor-pointer"
        >
          <span>Xem tất cả gái gọi</span>
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </SmoothLink>
      </div>
    </div>
  );
}

