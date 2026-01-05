'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { postsApi, PostComment } from '@/modules/posts/api/posts.api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface PostCommentsProps {
  postId: string;
  initialCount?: number;
}

export default function PostComments({ postId, initialCount = 0 }: PostCommentsProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCount);

  const loadComments = useCallback(async (pageNum: number, append = false) => {
    try {
      setIsLoading(true);
      const response = await postsApi.getComments(postId, pageNum, 10);
      const newComments = response.data || [];

      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }

      setTotalCount(response.totalAll || response.total || newComments.length);
      setHasMore(pageNum < (response.totalPages || 1));
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Vui lòng đăng nhập để bình luận'); return; }
    if (!newComment.trim()) { toast.error('Vui lòng nhập nội dung'); return; }

    setIsSubmitting(true);
    try {
      const response = await postsApi.addComment(postId, newComment.trim());
      const addedComment: PostComment = {
        ...response,
        user: { id: user?.id || '', fullName: user?.fullName || 'Người dùng', avatarUrl: user?.avatarUrl },
        replies: [],
        _count: { replies: 0 },
      };
      setComments(prev => [addedComment, ...prev]);
      setTotalCount(prev => prev + 1);
      setNewComment('');
      toast.success('Bình luận thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi bình luận');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReply = (parentId: string, reply: PostComment) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
          _count: { replies: (comment._count?.replies || 0) + 1 },
        };
      }
      return comment;
    }));
    setTotalCount(prev => prev + 1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage, true);
  };

  return (
    <div className="bg-background-light/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-secondary/20 shadow-lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl font-bold text-text">Bình luận</h2>
        </div>
        <span className="text-text-muted text-sm font-medium">{totalCount} bình luận</span>
      </div>

      <CommentForm
        isAuthenticated={isAuthenticated}
        user={user}
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        placeholder="Viết bình luận của bạn..."
      />

      {isLoading && comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-text-muted text-sm">Đang tải bình luận...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      ) : (
        <div className="space-y-1 mt-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              isAuthenticated={isAuthenticated}
              user={user}
              onReplyAdded={handleAddReply}
            />
          ))}
          {hasMore && (
            <div className="text-center pt-4">
              <button onClick={loadMore} disabled={isLoading} className="px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors text-sm font-medium disabled:opacity-50">
                {isLoading ? 'Đang tải...' : 'Xem thêm bình luận'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CommentFormProps {
  isAuthenticated: boolean;
  user: any;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  compact?: boolean;
  onCancel?: () => void;
}

function CommentForm({ isAuthenticated, user, value, onChange, onSubmit, isSubmitting, placeholder, autoFocus, compact, onCancel }: CommentFormProps) {
  if (!isAuthenticated) {
    return (
      <div className="pt-2">
        <Link
          href="/auth/login"
          className="flex items-center gap-3 w-full px-4 py-2.5 bg-background border border-secondary/30 rounded-lg text-sm text-text-muted/60 hover:text-text-muted hover:border-primary/40 transition-all duration-300 group cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <svg
              className="w-7 h-7 sm:w-4 sm:h-4 text-text-muted/40 group-hover:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="flex-1">Đăng nhập để bình luận...</span>
          <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
            Đăng nhập
          </div>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? '' : 'mb-4'}>
      <div className="flex gap-2">
        <div className="flex-shrink-0">
          <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center`}>
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.fullName || ''} width={compact ? 32 : 40} height={compact ? 32 : 40} className="object-cover w-full h-full" unoptimized />
            ) : (
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-primary`}>{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Viết bình luận...'}
            rows={compact ? 2 : 3}
            autoFocus={autoFocus}
            className={`w-full px-3 py-2 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all ${compact ? 'text-sm' : ''}`}
          />
          <div className="flex justify-end gap-2 mt-2">
            {onCancel && (
              <button type="button" onClick={onCancel} className="px-3 py-1.5 text-text-muted hover:text-text rounded-lg transition-colors text-sm">Hủy</button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !value.trim()}
              className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
            >
              {isSubmitting ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Đang gửi...</> : 'Gửi'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}


interface CommentItemProps {
  comment: PostComment;
  postId: string;
  isAuthenticated: boolean;
  user: any;
  onReplyAdded: (parentId: string, reply: PostComment) => void;
  isReply?: boolean;
}

function CommentItem({ comment, postId, isAuthenticated, user, onReplyAdded, isReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút`;
    if (hours < 24) return `${hours} giờ`;
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await postsApi.addComment(postId, replyContent.trim(), comment.id);
      const newReply: PostComment = {
        ...response,
        user: { id: user?.id || '', fullName: user?.fullName || 'Người dùng', avatarUrl: user?.avatarUrl },
      };
      onReplyAdded(comment.id, newReply);
      setReplyContent('');
      setShowReplyForm(false);
      setShowReplies(true);
      toast.success('Trả lời thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi trả lời');
    } finally {
      setIsSubmitting(false);
    }
  };

  const repliesCount = comment._count?.replies || comment.replies?.length || 0;

  return (
    <div className={`${isReply ? 'mt-2' : 'mt-0'}`}>
      {/* Main Comment/Reply Card - Facebook Style */}
      <div className={`flex gap-3 ${isReply ? 'pl-4' : 'pl-0'} transition-all duration-200 hover:bg-background-light/30 rounded-lg ${isReply ? 'py-2' : 'p-4'} ${!isReply ? 'border border-secondary/20 hover:border-secondary/40' : ''}`}>
        {/* Avatar */}
        <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden bg-primary flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:ring-2 hover:ring-primary/50`}>
          {comment.user?.avatarUrl ? (
            <Image src={comment.user.avatarUrl} alt={comment.user.fullName || ''} width={isReply ? 32 : 40} height={isReply ? 32 : 40} className="object-cover w-full h-full" unoptimized />
          ) : (
            <span className={`text-white font-bold ${isReply ? 'text-xs' : 'text-sm'}`}>
              {comment.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Username and Timestamp */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`font-semibold text-text ${isReply ? 'text-sm' : 'text-base'} hover:text-primary transition-colors cursor-pointer`}>
              {comment.user?.fullName || 'Người dùng'}
            </span>
            <span className="text-text-muted text-xs">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Comment Content */}
          <p className={`text-text ${isReply ? 'text-sm' : 'text-base'} whitespace-pre-wrap mb-2 leading-relaxed break-words`}>
            {comment.content}
          </p>

          {/* Reply Button */}
          {!isReply && isAuthenticated && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-200 hover:underline"
            >
              {showReplyForm ? 'Hủy' : 'Trả lời'}
            </button>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                isAuthenticated={isAuthenticated}
                user={user}
                value={replyContent}
                onChange={setReplyContent}
                onSubmit={handleReply}
                isSubmitting={isSubmitting}
                placeholder={`Trả lời ${comment.user?.fullName || 'Người dùng'}...`}
                autoFocus
                compact
                onCancel={() => { setShowReplyForm(false); setReplyContent(''); }}
              />
            </div>
          )}

          {/* View Replies Button */}
          {!isReply && repliesCount > 0 && !showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="flex items-center gap-1.5 mt-2 text-primary text-sm font-medium hover:text-primary-hover transition-colors duration-200 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Xem {repliesCount} phản hồi
            </button>
          )}

          {/* Replies Container - Facebook Style */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className={`mt-2 space-y-1 ${!isReply ? 'border-l-2 border-primary/20 pl-4' : 'border-l-2 border-primary/10 pl-4'}`}>
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} postId={postId} isAuthenticated={isAuthenticated} user={user} onReplyAdded={onReplyAdded} isReply />
              ))}
              <button
                onClick={() => setShowReplies(false)}
                className="text-text-muted text-xs hover:text-text ml-1 mt-2 transition-colors"
              >
                Ẩn phản hồi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}