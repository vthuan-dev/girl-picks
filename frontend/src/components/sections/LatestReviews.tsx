'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from 'react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { reviewsApi } from '@/modules/reviews/api/reviews.api';
import type { Review, ReviewComment } from '@/modules/reviews/api/reviews.api';
import { getFullImageUrl } from '@/lib/utils/image';

interface LatestReviewsProps {
  limit?: number;
}

// Component để hiển thị comment và replies (recursive để hỗ trợ nested replies)
function CommentItem({
  comment,
  isAuthenticated,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onReply,
  submitting,
  formatDate,
  depth = 0, // Độ sâu của nested reply (0 = top-level comment)
  maxDepth = 5, // Giới hạn độ sâu tối đa
}: {
  comment: ReviewComment;
  isAuthenticated: boolean;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: { [key: string]: string };
  setReplyText: (text: { [key: string]: string } | ((prev: { [key: string]: string }) => { [key: string]: string })) => void;
  onReply: (parentId: string) => void | Promise<void>;
  submitting: boolean;
  formatDate: (dateString: string) => string;
  depth?: number;
  maxDepth?: number;
}) {
  const hasReplies = comment.replies && comment.replies.length > 0;
  const isReplying = replyingTo === comment.id;
  const currentReplyText = replyText[comment.id] || '';
  const isNested = depth > 0; // Nếu depth > 0 thì đây là nested reply

  // Tính margin-left dựa trên depth
  const getMarginLeft = () => {
    if (!isNested) return '';
    const marginMap: { [key: number]: string } = {
      1: 'ml-4',
      2: 'ml-8',
      3: 'ml-12',
      4: 'ml-16',
      5: 'ml-20',
    };
    return marginMap[depth] || 'ml-4';
  };

  return (
    <div className={`space-y-2 ${getMarginLeft()}`}>
      {/* Main Comment/Reply */}
      <div className={`flex gap-3 ${isNested ? 'p-2' : 'p-3'} ${isNested ? 'bg-background/50' : 'bg-background'} rounded-lg ${isNested ? '' : 'border border-secondary/20'}`}>
        <div className={`${isNested ? 'w-6 h-6' : 'w-8 h-8'} rounded-full ${isNested ? 'bg-primary/80' : 'bg-primary'} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-white font-bold ${isNested ? 'text-xs' : 'text-xs'}`}>
            {comment.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold text-text ${isNested ? 'text-xs' : 'text-sm'}`}>{comment.user?.fullName || 'Ẩn danh'}</span>
            <span className="text-text-muted text-xs">
              {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className={`text-text ${isNested ? 'text-xs' : 'text-sm'} whitespace-pre-wrap mb-2`}>{comment.content}</p>

          {/* Reply Button - chỉ hiển thị nếu chưa đạt maxDepth */}
          {isAuthenticated && depth < maxDepth && (
            <button
              type="button"
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              className="text-xs text-primary hover:text-primary-hover transition-colors"
            >
              {isReplying ? 'Hủy' : 'Trả lời'}
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && isAuthenticated && depth < maxDepth && (
        <div className={`${isNested ? 'ml-4' : 'ml-11'} flex gap-2`}>
          <input
            type="text"
            value={currentReplyText}
            onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
            placeholder={`Trả lời ${comment.user?.fullName || 'bình luận này'}...`}
            className="flex-1 px-3 py-2 bg-background border border-secondary/30 rounded-lg text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentReplyText.trim()) {
                onReply(comment.id);
              }
            }}
          />
          <button
            type="button"
            onClick={async () => { await onReply(comment.id); }}
            disabled={submitting || !currentReplyText.trim()}
            className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors font-medium"
          >
            {submitting ? '...' : 'Gửi'}
          </button>
        </div>
      )}

      {/* Replies - Recursive rendering */}
      {hasReplies && depth < maxDepth && (
        <div className={`${isNested ? 'ml-4' : 'ml-11'} space-y-2 ${depth === 0 ? 'border-l-2 border-secondary/20 pl-3' : ''}`}>
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isAuthenticated={isAuthenticated}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={onReply}
              submitting={submitting}
              formatDate={formatDate}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
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
      if (!response.ok) throw new Error('Không thể tải đánh giá');
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
          <ReviewCard key={review.id} review={review} />
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

function ReviewCard({ review }: { review: Review }) {
  const { isAuthenticated } = useAuthStore();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(review._count?.likes || 0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(review._count?.comments || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID của comment đang reply
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({}); // Text reply cho mỗi comment

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

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      const result = await reviewsApi.getComments(review.id);
      const commentsData = result.data || [];

      // Backend đã include replies sẵn trong mỗi comment
      // Đảm bảo mỗi comment có replies array (có thể rỗng)
      const organizedComments = commentsData.map((cmt: ReviewComment) => ({
        ...cmt,
        replies: cmt.replies || [],
      }));

      setComments(organizedComments);
      // Cập nhật số lượng comments từ total (bao gồm cả replies)
      setCommentsCount(result.total || commentsData.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải bình luận');
    } finally {
      setLoadingComments(false);
    }
  }, [review.id]);

  // Sync số lượng comments ban đầu từ review
  useEffect(() => {
    if (review._count?.comments !== undefined) {
      setCommentsCount(review._count.comments);
    }
  }, [review._count?.comments]);

  // Fetch comments ngay khi component mount - không cần click
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const loadLikeStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const status = await reviewsApi.getLikeStatus(review.id);
      if (typeof status?.liked === 'boolean') {
        setLiked(status.liked);
      }
      if (typeof status?.likesCount === 'number') {
        setLikesCount(status.likesCount);
      }
    } catch (error) {
      console.error('Error loading like status:', error);
    }
  }, [isAuthenticated, review.id]);

  useEffect(() => {
    loadLikeStatus();
  }, [loadLikeStatus]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích');
      return;
    }
    // Tránh double click - nếu đang xử lý thì không làm gì
    if (liking) {
      return;
    }
    try {
      setLiking(true);
      const result = await reviewsApi.toggleLike(review.id);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      let errorMessage = 'Không thể thích bài viết';

      // Handle specific error cases
      if (error.response?.status === 401) {
        errorMessage = 'Vui lòng đăng nhập để thích bài viết';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền thực hiện hành động này';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLiking(false);
    }
  };

  // Helper function để tìm và cập nhật comment/reply trong nested structure
  const addReplyToComment = (comments: ReviewComment[], parentId: string, newReply: ReviewComment): ReviewComment[] => {
    return comments.map(cmt => {
      // Nếu đây là comment cha
      if (cmt.id === parentId) {
        return {
          ...cmt,
          replies: [...(cmt.replies || []), {
            ...newReply,
            parentId: parentId,
          }],
          _count: {
            ...cmt._count,
            replies: (cmt._count?.replies || 0) + 1,
          },
        };
      }
      // Nếu có replies, tìm trong nested replies
      if (cmt.replies && cmt.replies.length > 0) {
        return {
          ...cmt,
          replies: addReplyToComment(cmt.replies, parentId, newReply),
        };
      }
      return cmt;
    });
  };

  const handleComment = async (parentId?: string) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    const commentText = parentId ? (replyText[parentId] || '').trim() : comment.trim();
    if (!commentText) return;

    try {
      setSubmitting(true);
      const newComment = await reviewsApi.addComment(review.id, {
        content: commentText,
        ...(parentId && { parentId }) // Thêm parentId nếu là reply (có thể là reply của comment hoặc reply của reply)
      });

      // Clear input
      if (parentId) {
        setReplyText(prev => ({ ...prev, [parentId]: '' }));
        setReplyingTo(null);

        // Cập nhật state local - thêm reply vào comment/reply tương ứng (hỗ trợ nested)
        setComments(prevComments => addReplyToComment(prevComments, parentId, newComment));

        // Cập nhật số lượng comments
        setCommentsCount(prev => prev + 1);
      } else {
        setComment('');

        // Cập nhật state local - thêm comment mới vào đầu danh sách
        setComments(prevComments => [newComment, ...prevComments]);

        // Cập nhật số lượng comments
        setCommentsCount(prev => prev + 1);
      }

      toast.success(parentId ? 'Đã gửi phản hồi' : 'Đã gửi bình luận');
      // Không cần gọi onRefetch() vì đã update state local rồi
      // onRefetch() sẽ gây reload toàn bộ reviews, làm mất component
    } catch {
      toast.error('Không thể gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const images = review.images || [];
  const displayImages = images.slice(0, 4); // Chỉ hiển thị 4 ảnh đầu tiên

  return (
    <div className="border border-secondary/20 rounded-xl p-3 md:p-4 bg-background-light/60 md:max-w-4xl md:mx-auto">
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
          <div className="flex items-center gap-1.5 mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 md:w-6 md:h-6 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-secondary/30'}`}
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

      {/* Images grid - Layout 2x2: trên 1-2, dưới 3-4 */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {displayImages.map((img, i) => (
            <div
              key={i}
              className="relative w-full aspect-square rounded-xl overflow-hidden bg-secondary/20 cursor-pointer group"
              onClick={() => setLightboxImage(img)}
            >
              <Image
                src={getFullImageUrl(img)}
                alt={`Review image ${i + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Hiển thị số ảnh còn lại nếu là ảnh thứ 4 và còn nhiều ảnh hơn */}
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">+{images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-5 mt-4 text-base md:text-lg text-text-muted">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleLike();
          }}
          disabled={liking}
          className={`flex items-center gap-1.5 hover:text-primary transition-colors ${liked ? 'text-primary' : ''} ${liking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount}
        </button>
        <div className="flex items-center gap-1.5 text-text-muted">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {commentsCount}
        </div>
      </div>

      {/* Comments Section - Luôn hiển thị, không cần click */}
      <div className="mt-4 space-y-3 border-t border-secondary/20 pt-4">
        {/* Danh sách Comments */}
        {loadingComments ? (
          <div className="text-center py-4 text-text-muted text-sm">Đang tải bình luận...</div>
        ) : comments.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((cmt) => (
              <CommentItem
                key={cmt.id}
                comment={cmt}
                isAuthenticated={isAuthenticated}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                onReply={handleComment}
                submitting={submitting}
                formatDate={formatDate}
                depth={0}
                maxDepth={5}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-text-muted text-sm">Chưa có bình luận nào</div>
        )}

        {/* Comment Input */}
        {isAuthenticated ? (
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 px-3 py-2 bg-background border border-secondary/30 rounded-lg text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <button
              onClick={() => handleComment()}
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors font-medium"
            >
              {submitting ? '...' : 'Gửi'}
            </button>
          </div>
        ) : (
          <div className="pt-2">
            <Link href="/auth/login" className="text-sm text-primary hover:underline">
              Đăng nhập để bình luận
            </Link>
          </div>
        )}
      </div>

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
              src={getFullImageUrl(lightboxImage)}
              alt="Review image"
              fill
              className="object-contain"
              sizes="100vw"
              priority
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
                  className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all ${lightboxImage === img ? 'border-primary' : 'border-transparent hover:border-white/50'
                    }`}
                >
                  <Image src={getFullImageUrl(img)} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
