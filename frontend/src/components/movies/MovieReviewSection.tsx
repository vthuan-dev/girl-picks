'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import {
  moviesReviewsApi,
  type MovieReview,
  type MovieReviewComment,
} from '@/modules/movies/api/movies-reviews.api';

interface MovieReviewSectionProps {
  movieId: string;
  movieTitle: string;
}

export default function MovieReviewSection({ movieId, movieTitle }: MovieReviewSectionProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [reviews, setReviews] = useState<MovieReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply states
  const [showReplyForms, setShowReplyForms] = useState<Record<string, boolean>>({});
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [submittingReplies, setSubmittingReplies] = useState<Record<string, boolean>>({});
  const [reviewComments, setReviewComments] = useState<Record<string, MovieReviewComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadReviews();
  }, [movieId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await moviesReviewsApi.getReviews(movieId, page, 10);
      setReviews(data.data || []);
      setAverageRating(data.averageRating || 0);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || Math.ceil((data.total || 0) / (data.limit || 10)));
    } catch (error) {
      console.error('Failed to load movie reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = useCallback(async (reviewId: string) => {
    if (loadingComments[reviewId]) return;
    try {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: true }));
      const data = await moviesReviewsApi.getComments(reviewId);
      setReviewComments((prev) => ({ ...prev, [reviewId]: data.data || [] }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [reviewId]: false }));
    }
  }, [loadingComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      router.push('/auth/login');
      return;
    }

    if (!rating) {
      toast.error('Vui lòng chọn số sao');
      return;
    }

    try {
      setSubmitting(true);
      await moviesReviewsApi.createReview(movieId, {
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Đã gửi đánh giá của bạn!');
      setShowForm(false);
      setRating(5);
      setComment('');
      setPage(1);
      loadReviews();
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReplyForm = (commentKey: string, reviewId: string) => {
    // Load comments if not loaded yet
    if (!reviewComments[reviewId] && !loadingComments[reviewId]) {
      loadComments(reviewId);
    }
    setShowReplyForms((prev) => ({
      ...prev,
      [commentKey]: !prev[commentKey],
    }));
  };

  const handleSubmitReply = async (reviewId: string, parentId?: string) => {
    const commentKey = parentId || reviewId;
    const content = replyContents[commentKey]?.trim();

    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để bình luận');
      router.push('/auth/login');
      return;
    }

    if (!content) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingReplies((prev) => ({ ...prev, [commentKey]: true }));
      const newComment = await moviesReviewsApi.createComment(reviewId, {
        content,
        parentId: parentId || undefined,
      });

      // Add new comment to the list
      setReviewComments((prev) => {
        const currentComments = prev[reviewId] || [];
        if (parentId) {
          // Add as nested reply
          const addReplyToComments = (comments: MovieReviewComment[]): MovieReviewComment[] => {
            return comments.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment],
                };
              }
              if (c.replies && c.replies.length > 0) {
                return {
                  ...c,
                  replies: addReplyToComments(c.replies),
                };
              }
              return c;
            });
          };
          return { ...prev, [reviewId]: addReplyToComments(currentComments) };
        }
        // Add as top-level comment
        return { ...prev, [reviewId]: [...currentComments, newComment] };
      });

      setReplyContents((prev) => ({ ...prev, [commentKey]: '' }));
      setShowReplyForms((prev) => ({ ...prev, [commentKey]: false }));
      toast.success('Đã gửi bình luận!');
    } catch (error: any) {
      console.error('Failed to submit reply:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi bình luận');
    } finally {
      setSubmittingReplies((prev) => ({ ...prev, [commentKey]: false }));
    }
  };

  const roundedAverage = Math.round(averageRating * 10) / 10;

  // Helper to render nested comments
  const renderComments = (comments: MovieReviewComment[], reviewId: string, depth = 0) => {
    return comments.map((cmt) => {
      const commentKey = cmt.id;
      const isReplying = showReplyForms[commentKey];
      const replyContent = replyContents[commentKey] || '';
      const isSubmitting = submittingReplies[commentKey];

      return (
        <div key={cmt.id} className={depth > 0 ? 'ml-6 pl-3 border-l-2 border-secondary/30' : ''}>
          <div className="flex items-start gap-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary/40 to-secondary/20 flex items-center justify-center flex-shrink-0">
              {cmt.user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cmt.user.avatarUrl}
                  alt={cmt.user.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-text-muted">
                  {cmt.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">
                  {cmt.user?.fullName || 'Người dùng'}
                </span>
                <span className="text-[10px] text-text-muted">
                  {new Date(cmt.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="mt-1 bg-secondary/10 rounded-xl px-3 py-2 inline-block">
                <p className="text-sm text-text whitespace-pre-line">{cmt.content}</p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => handleToggleReplyForm(commentKey, reviewId)}
                  className="mt-1 text-xs text-primary hover:underline"
                >
                  Trả lời
                </button>
              )}

              {/* Reply form */}
              {isReplying && (
                <div className="mt-2 flex items-start gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) =>
                      setReplyContents((prev) => ({ ...prev, [commentKey]: e.target.value }))
                    }
                    placeholder="Viết trả lời..."
                    className="flex-1 px-3 py-2 bg-background border border-secondary/40 rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitReply(reviewId, cmt.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSubmitReply(reviewId, cmt.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '...' : 'Gửi'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Nested replies */}
          {cmt.replies && cmt.replies.length > 0 && (
            <div className="mt-1">{renderComments(cmt.replies, reviewId, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="mt-10 sm:mt-12 bg-background-light rounded-2xl border border-secondary/30 shadow-sm shadow-black/10 p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-text">Đánh giá phim</h2>
            <p className="text-xs sm:text-sm text-text-muted">
              {total > 0 ? (
                <>
                  {roundedAverage.toFixed(1)} / 5 · {total.toLocaleString('vi-VN')} đánh giá
                </>
              ) : (
                'Chưa có đánh giá nào, hãy là người đầu tiên!'
              )}
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Đóng form' : 'Viết đánh giá'}
          </button>
        ) : (
          <button
            onClick={() => router.push('/auth/login')}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Đăng nhập để đánh giá
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && isAuthenticated && (
        <form
          onSubmit={handleSubmit}
          className="bg-background rounded-2xl border border-secondary/30 p-4 sm:p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-text mb-2">Đánh giá của bạn *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="text-2xl sm:text-3xl">
                  <span className={star <= rating ? 'text-yellow-400' : 'text-secondary/50'}>★</span>
                </button>
              ))}
              <span className="text-sm text-text-muted">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Nhận xét (tùy chọn)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Chia sẻ cảm nhận của bạn về "${movieTitle}"...`}
              rows={4}
              maxLength={800}
              className="w-full px-3 sm:px-4 py-2.5 bg-background border border-secondary/40 rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-secondary/30 rounded w-1/3 mb-2" />
                <div className="h-3 bg-secondary/30 rounded w-full mb-1" />
                <div className="h-3 bg-secondary/20 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">
            Chưa có đánh giá nào cho phim này.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewKey = review.id;
              const isReplying = showReplyForms[reviewKey];
              const replyContent = replyContents[reviewKey] || '';
              const isSubmitting = submittingReplies[reviewKey];
              const comments = reviewComments[review.id] || [];
              const isLoadingComments = loadingComments[review.id];

              return (
                <div
                  key={review.id}
                  className="bg-background rounded-2xl border border-secondary/20 p-4 sm:p-5 shadow-sm shadow-black/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      {review.user?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={review.user.avatarUrl}
                          alt={review.user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {review.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-text">
                            {review.user?.fullName || 'Người dùng'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex text-xs">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={star <= review.rating ? 'text-yellow-400' : 'text-secondary/50'}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-text-muted">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <div className="mt-2 inline-block bg-background-light rounded-2xl px-3 py-2">
                          <p className="text-sm text-text whitespace-pre-line">{review.comment}</p>
                        </div>
                      )}

                      {/* Reply button for review */}
                      <div className="mt-2 flex items-center gap-3">
                        {isAuthenticated && (
                          <button
                            onClick={() => handleToggleReplyForm(reviewKey, review.id)}
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                              />
                            </svg>
                            Trả lời
                          </button>
                        )}
                        {comments.length > 0 && (
                          <span className="text-xs text-text-muted">
                            {comments.length} bình luận
                          </span>
                        )}
                      </div>

                      {/* Reply form for review */}
                      {isReplying && (
                        <div className="mt-3 flex items-start gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) =>
                              setReplyContents((prev) => ({ ...prev, [reviewKey]: e.target.value }))
                            }
                            placeholder="Viết bình luận..."
                            className="flex-1 px-3 py-2 bg-background-light border border-secondary/40 rounded-lg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitReply(review.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSubmitReply(review.id)}
                            disabled={isSubmitting || !replyContent.trim()}
                            className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? '...' : 'Gửi'}
                          </button>
                        </div>
                      )}

                      {/* Comments */}
                      {isLoadingComments && (
                        <div className="mt-3 text-xs text-text-muted">Đang tải bình luận...</div>
                      )}
                      {comments.length > 0 && (
                        <div className="mt-3 border-t border-secondary/20 pt-3">
                          {renderComments(comments, review.id)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-background border border-secondary/40 text-sm text-text hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <span className="px-3 py-2 text-xs text-text-muted">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg bg-background border border-secondary/40 text-sm text-text hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
