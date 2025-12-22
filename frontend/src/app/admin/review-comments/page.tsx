'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import { reviewsApi, ReviewComment } from '@/modules/reviews/api/reviews.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminReviewCommentsPage() {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});
  const [showRejectInput, setShowRejectInput] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadComments();
  }, [page]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const response = await reviewsApi.getPendingComments(page, 20);
      
      const commentsData = Array.isArray(response.data) ? response.data : [];
      setComments(commentsData);
      setTotal(response.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error: any) {
      console.error('Error loading comments:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách bình luận');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    if (approvingId) return;
    
    try {
      setApprovingId(commentId);
      await reviewsApi.approveComment(commentId);
      toast.success('Đã duyệt bình luận');
      // Remove from list
      setComments(prev => prev.filter(c => c.id !== commentId));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error approving comment:', error);
      toast.error(error.response?.data?.message || 'Không thể duyệt bình luận');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (commentId: string) => {
    if (rejectingId) return;
    
    const reason = rejectReason[commentId]?.trim();
    
    try {
      setRejectingId(commentId);
      await reviewsApi.rejectComment(commentId, reason);
      toast.success('Đã từ chối bình luận');
      // Remove from list
      setComments(prev => prev.filter(c => c.id !== commentId));
      setTotal(prev => Math.max(0, prev - 1));
      setRejectReason(prev => {
        const newReason = { ...prev };
        delete newReason[commentId];
        return newReason;
      });
      setShowRejectInput(prev => {
        const newShow = { ...prev };
        delete newShow[commentId];
        return newShow;
      });
    } catch (error: any) {
      console.error('Error rejecting comment:', error);
      toast.error(error.response?.data?.message || 'Không thể từ chối bình luận');
    } finally {
      setRejectingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Bình luận đánh giá chờ duyệt</h1>
          <p className="text-text-muted mt-1">
            Tổng cộng <span className="font-semibold text-primary">{total}</span> bình luận chờ duyệt
          </p>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-background-light rounded-lg p-4 animate-pulse border border-secondary/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/30"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary/30 rounded w-1/3"></div>
                  <div className="h-16 bg-secondary/30 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-background-light rounded-lg p-12 text-center border border-secondary/30">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Không có bình luận chờ duyệt</h3>
          <p className="text-text-muted">Tất cả bình luận đã được xử lý</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-background-light rounded-lg p-5 border border-secondary/30 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0">
                  {comment.user?.avatarUrl ? (
                    <img
                      src={comment.user.avatarUrl}
                      alt={comment.user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {comment.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-text">{comment.user?.fullName || 'Ẩn danh'}</span>
                    <span className="text-text-muted text-sm">• {formatDate(comment.createdAt)}</span>
                  </div>

                  <p className="text-text mb-3 whitespace-pre-wrap">{comment.content}</p>

                  {/* Review Info */}
                  {comment.review && (
                    <div className="mb-3 p-3 bg-background rounded-lg border border-secondary/20">
                      <div className="text-sm">
                        <span className="text-text-muted">Đánh giá: </span>
                        <span className="font-medium text-text">
                          {comment.review.title || comment.review.content?.substring(0, 50) || 'Không có tiêu đề'}
                        </span>
                        {comment.review.customer && (
                          <>
                            <span className="text-text-muted mx-2">•</span>
                            <span className="text-text-muted">Bởi: </span>
                            <span className="text-text">{comment.review.customer.fullName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button
                      onClick={() => handleApprove(comment.id)}
                      disabled={approvingId === comment.id || rejectingId === comment.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {approvingId === comment.id ? 'Đang duyệt...' : 'Duyệt'}
                    </Button>

                    {!showRejectInput[comment.id] ? (
                      <Button
                        onClick={() => setShowRejectInput(prev => ({ ...prev, [comment.id]: true }))}
                        disabled={approvingId === comment.id || rejectingId === comment.id}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Từ chối
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="text"
                          value={rejectReason[comment.id] || ''}
                          onChange={(e) =>
                            setRejectReason(prev => ({ ...prev, [comment.id]: e.target.value }))
                          }
                          placeholder="Lý do từ chối (tùy chọn)"
                          className="flex-1 px-3 py-2 bg-background border border-secondary/30 rounded-lg text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:border-red-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReject(comment.id);
                            }
                          }}
                        />
                        <Button
                          onClick={() => handleReject(comment.id)}
                          disabled={rejectingId === comment.id || approvingId === comment.id}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {rejectingId === comment.id ? 'Đang từ chối...' : 'Xác nhận'}
                        </Button>
                        <Button
                          onClick={() => {
                            setShowRejectInput(prev => {
                              const newShow = { ...prev };
                              delete newShow[comment.id];
                              return newShow;
                            });
                            setRejectReason(prev => {
                              const newReason = { ...prev };
                              delete newReason[comment.id];
                              return newReason;
                            });
                          }}
                          className="bg-secondary/30 hover:bg-secondary/50 text-text"
                        >
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-background-light border border-secondary/30 text-text disabled:opacity-50"
          >
            Trước
          </Button>
          <span className="px-4 py-2 text-text-muted">
            Trang {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-background-light border border-secondary/30 text-text disabled:opacity-50"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}

