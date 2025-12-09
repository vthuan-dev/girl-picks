'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { reviewsApi } from '@/modules/reviews/api/reviews.api';
import type { Review } from '@/modules/reviews/api/reviews.api';

interface LatestReviewsProps {
  limit?: number;
}

export default function LatestReviews({ limit = 6 }: LatestReviewsProps) {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ['reviews', 'latest', page],
    async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/reviews?limit=${pageSize}&page=${page}&status=APPROVED`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const result = await response.json();
      return result.data?.data || result.data || [];
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (data) {
      setReviews((prev) => (page === 1 ? (data as Review[]) : [...prev, ...(data as Review[])]));
      setHasMore((data as Review[]).length === pageSize);
    }
  }, [data, page]);

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  const handleRefetch = () => {
    setPage(1);
    setReviews([]);
    refetch();
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Đánh giá gái gọi</h2>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/30"></div>
                <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text">Đánh giá gái gọi</h2>
        <Link 
          href="/reviews" 
          className="text-sm text-primary hover:text-primary-hover transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onRefetch={handleRefetch} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="px-4 py-2 text-sm rounded-lg border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            {isFetching ? 'Đang tải...' : 'Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, onRefetch }: { review: Review; onRefetch: () => void }) {
  const { isAuthenticated } = useAuthStore();
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review._count?.likes || 0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const girlUrl =
    review.girl && (review.girl as any).slug
      ? `/girls/${review.girl.id}/${(review.girl as any).slug}`
      : review.girl
        ? `/girls/${review.girl.id}`
        : '#';
  
  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxImage]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích');
      return;
    }
    try {
      setLiking(true);
      const result = await reviewsApi.toggleLike(review.id);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch {
      toast.error('Không thể thích bài viết');
    } finally {
      setLiking(false);
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!comment.trim()) return;
    
    try {
      setSubmitting(true);
      await reviewsApi.addComment(review.id, { content: comment.trim() });
      setComment('');
      toast.success('Đã gửi bình luận');
      onRefetch();
    } catch {
      toast.error('Không thể gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const images = review.images || [];
  const mainImg = images[0];
  const sideImgs = images.slice(1, 4);

  return (
    <div className="border border-secondary/20 rounded-xl p-3 md:p-4 bg-background-light/60">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {review.customer?.fullName?.charAt(0)?.toUpperCase() || 'N'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text text-sm md:text-base truncate">
              {review.customer?.fullName || 'Ẩn danh'}
            </span>
            <span className="text-text-muted text-xs md:text-sm">• {formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 md:w-5 md:h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-secondary/30'}`}
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
      <p className="text-text text-sm md:text-base mb-2 leading-relaxed">{review.content}</p>

      {/* Girl Tag */}
      {review.girl && (
        <Link 
          href={girlUrl}
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover mb-3"
        >
          @{review.girl.name}
          <span className="text-text-muted">#{review.girl.id?.slice(-6)}</span>
        </Link>
      )}

      {/* Images collage */}
      {mainImg && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="grid gap-2 md:grid-cols-3">
            <div className={sideImgs.length > 0 ? 'md:col-span-2' : 'md:col-span-3'}>
              <div 
                className="relative w-full aspect-[4/3] md:aspect-video rounded-xl overflow-hidden bg-secondary/20 cursor-pointer group"
                onClick={() => setLightboxImage(mainImg)}
              >
                <Image
                  src={mainImg}
                  alt="Review"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
            </div>
            {sideImgs.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                {sideImgs.map((img, i) => (
                  <div 
                    key={i}
                    className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-secondary/20 cursor-pointer group"
                    onClick={() => setLightboxImage(img)}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                    {i === sideImgs.length - 1 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">+{images.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 text-sm text-text-muted">
        <button 
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          disabled={liking}
          className={`flex items-center gap-1.5 hover:text-primary transition-colors ${liked ? 'text-primary' : ''}`}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount}
        </button>
        <span className="flex items-center gap-1.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {review._count?.comments || 0}
        </span>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="mt-4 ml-9 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Full Content */}
          <p className="text-text text-sm">{review.content}</p>
          
          {/* Images Grid - Below content */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((img, i) => (
                <div 
                  key={i} 
                  className="relative w-24 h-24 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setLightboxImage(img)}
                >
                  <Image 
                    src={img} 
                    alt="" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-300" 
                    unoptimized 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input */}
          {isAuthenticated ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="flex-1 px-3 py-2 bg-background border border-secondary/30 rounded-lg text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={submitting || !comment.trim()}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors font-medium"
              >
                {submitting ? '...' : 'Gửi'}
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="text-sm text-primary hover:underline">
              Đăng nhập để bình luận
            </Link>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxImage(null)}
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

          {/* Thumbnails */}
          {review.images && review.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg">
              {review.images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage(img);
                  }}
                  className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all ${
                    lightboxImage === img ? 'border-primary' : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
