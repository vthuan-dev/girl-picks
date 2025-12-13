'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import Image from 'next/image';
import Link from 'next/link';
import type { Review } from '@/modules/reviews/api/reviews.api';
import { getGirlDetailUrl, generateSlug } from '@/lib/utils/slug';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function ReviewsPageClient() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxImage]);

  const { data, isLoading, error, refetch } = useQuery(
    ['reviews', 'all', page],
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reviews?page=${page}&limit=${limit}&status=APPROVED`
      );
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      return {
        reviews: result.data?.data || result.data || [],
        total: result.data?.meta?.total || result.meta?.total || 0,
        totalPages: result.data?.meta?.totalPages || result.meta?.totalPages || 1,
      };
    },
    {
      staleTime: 2 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">Đánh giá gái gọi</h1>
        <p className="text-sm text-text-muted">
          {data?.total ? (
            <>Tổng cộng <span className="text-primary font-semibold">{data.total}</span> đánh giá</>
          ) : (
            'Đang tải...'
          )}
        </p>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-background-light rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/30"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary/30 rounded w-1/3"></div>
                  <div className="h-20 bg-secondary/30 rounded w-full mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-text-muted">Không thể tải đánh giá. Vui lòng thử lại.</p>
        </div>
      ) : data?.reviews?.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Chưa có đánh giá nào</h3>
          <p className="text-text-muted mb-4">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.reviews?.map((review: Review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              formatDate={formatDate}
              onImageClick={(images, currentImage) => {
                setLightboxImages(images);
                setLightboxImage(currentImage);
              }}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => {
            setLightboxImage(null);
            setLightboxImages([]);
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setLightboxImage(null);
              setLightboxImages([]);
            }}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-50"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div 
            className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="Review image"
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
          </div>

          {/* Navigation & Thumbnails */}
          {lightboxImages.length > 1 && (
            <>
              {/* Previous Button */}
              {lightboxImages.indexOf(lightboxImage) > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = lightboxImages.indexOf(lightboxImage);
                    setLightboxImage(lightboxImages[currentIndex - 1]);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-50"
                  aria-label="Ảnh trước"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Next Button */}
              {lightboxImages.indexOf(lightboxImage) < lightboxImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = lightboxImages.indexOf(lightboxImage);
                    setLightboxImage(lightboxImages[currentIndex + 1]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-50"
                  aria-label="Ảnh sau"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto">
                {lightboxImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(img);
                    }}
                    className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                      lightboxImage === img ? 'border-primary' : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-background-light border border-secondary/30 rounded-lg text-text disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-text-muted">
            Trang {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-4 py-2 bg-background-light border border-secondary/30 rounded-lg text-text disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}


function ReviewCard({ 
  review, 
  formatDate,
  onImageClick 
}: { 
  review: Review; 
  formatDate: (date: string) => string;
  onImageClick: (images: string[], currentImage: string) => void;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const requireAuth = () => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      return false;
    }
    return true;
  };

  const girlId = (review as any)?.girlId || review.girl?.id;
  const girlName = review.girl?.name || 'Xem bài gốc';
  const girlSlug = (review as any)?.girl?.slug as string | undefined;
  const girlUrl = girlId
    ? girlSlug
      ? `/girls/${girlId}/${girlSlug}`
      : getGirlDetailUrl(girlId, girlName || generateSlug(String(girlId)))
    : '#';

  return (
    <div className="bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all overflow-hidden">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center flex-shrink-0 border border-primary/30">
            {review.customer?.avatarUrl ? (
              <Image
                src={review.customer.avatarUrl}
                alt={review.customer.fullName}
                width={48}
                height={48}
                className="w-full h-full rounded-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-white font-bold">
                {review.customer?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-text">{review.customer?.fullName || 'Ẩn danh'}</span>
                <span className="text-text-muted text-sm">• {formatDate(review.createdAt)}</span>
              </div>
              {girlId && (
                <Link
                  href={girlUrl}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-full text-xs sm:text-sm hover:bg-primary-hover transition-colors"
                >
                  Xem gái
                </Link>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-secondary/30'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-text whitespace-pre-wrap">{review.content}</p>
          
          {/* Girl Tag */}
          {girlId && (
            <Link 
              href={girlUrl}
              className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
            >
              @{girlName}
            </Link>
          )}
        </div>
      </div>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="px-4 pb-4">
          <div className={`grid gap-3 ${review.images.length === 1 ? 'grid-cols-1' : review.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
            {review.images.slice(0, 6).map((imageUrl, index) => (
              <div 
                key={index} 
                className="relative overflow-hidden rounded-xl bg-secondary/20 group cursor-pointer"
                style={{ aspectRatio: '4 / 5' }}
                onClick={() => {
                  onImageClick(review.images || [], imageUrl);
                }}
              >
                <Image
                  src={imageUrl}
                  alt={`Review image ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-secondary/20 flex items-center gap-4">
        <button
          onClick={() => {
            if (!requireAuth()) return;
            toast('Tính năng thích sẽ sớm được cập nhật.');
          }}
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">{review._count?.likes || 0} thích</span>
        </button>
        <button
          onClick={() => {
            if (!requireAuth()) return;
            toast('Tính năng bình luận sẽ sớm được cập nhật.');
          }}
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{review._count?.comments || 0} bình luận</span>
        </button>
        <button
          onClick={() => {
            if (!requireAuth()) return;
            toast('Tính năng chia sẻ sẽ sớm được cập nhật.');
          }}
          className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer ml-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm">Chia sẻ</span>
        </button>
      </div>
    </div>
  );
}
