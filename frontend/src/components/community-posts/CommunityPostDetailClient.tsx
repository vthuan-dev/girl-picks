'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SmoothLink from '@/components/common/SmoothLink';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { communityPostsApi, type CommunityPost, type CommunityPostComment } from '@/modules/community-posts/api/community-posts.api';
import { getGirlDetailUrl } from '@/lib/utils/slug';
import { getFullImageUrl } from '@/lib/utils/image';

interface CommunityPostDetailClientProps {
  post: CommunityPost;
}

// Comment component (reuse from CommunityPostCard)
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
  depth = 0,
  maxDepth = 5,
}: {
  comment: CommunityPostComment;
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
  const isNested = depth > 0;

  return (
    <div className={`${isNested ? 'mt-2' : 'mt-0'} w-full`}>
      <div className="flex gap-2">
        <div className="flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {comment.user.fullName?.[0]?.toUpperCase() || 'A'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <p className="text-xs font-semibold text-text">{comment.user.fullName || 'Ẩn danh'}</p>
                <span className="text-xs text-text-muted">•</span>
                <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-text-muted whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
              {isAuthenticated && depth < maxDepth && (
                <button
                  onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                  className="text-xs text-primary hover:text-primary-hover transition-colors mt-1.5"
                >
                  {isReplying ? 'Hủy' : 'Trả lời'}
                </button>
              )}
            </div>
          </div>

          {isReplying && isAuthenticated && (
            <div className="mt-2 space-y-1.5">
              <textarea
                value={currentReplyText}
                onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                placeholder="Viết phản hồi..."
                className="w-full px-2.5 py-1.5 text-sm bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-2.5 py-1 text-xs text-text-muted hover:text-text transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    await onReply(comment.id);
                    setReplyText({ ...replyText, [comment.id]: '' });
                  }}
                  disabled={submitting || !currentReplyText.trim()}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? '...' : 'Gửi'}
                </button>
              </div>
            </div>
          )}

          {hasReplies && depth < maxDepth && (
            <div className={`ml-3 mt-2 space-y-2 border-l-2 border-primary/20 pl-3`}>
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
      </div>
    </div>
  );
}

export default function CommunityPostDetailClient({ post: initialPost }: CommunityPostDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<CommunityPost>(initialPost);
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [submittingReply, setSubmittingReply] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await communityPostsApi.getComments(post.id, 1, 50);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  const checkLikeStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await communityPostsApi.getLikeStatus(post.id);
      setLiked(response.liked || false);
    } catch (error) {
      // Ignore errors
    }
  }, [post.id, isAuthenticated]);

  useEffect(() => {
    fetchComments();
    checkLikeStatus();
  }, [fetchComments, checkLikeStatus]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    try {
      await communityPostsApi.toggleLike(post.id);
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để bình luận');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmittingComment(true);
    try {
      await communityPostsApi.addComment(post.id, { content: commentText });
      setCommentText('');
      toast.success('Bình luận thành công');
      fetchComments();
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (parentId: string) => {
    const text = replyText[parentId];
    if (!text?.trim()) return;

    setSubmittingReply(true);
    try {
      await communityPostsApi.addComment(post.id, { content: text, parentId });
      setReplyText({ ...replyText, [parentId]: '' });
      setReplyingTo(null);
      toast.success('Phản hồi thành công');
      fetchComments();
    } catch (error: any) {
      toast.error(error?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmittingReply(false);
    }
  };

  const images = post.images || [];
  const mainImage = images[currentImageIndex] || images[0];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Post Content */}
      <article className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden mb-4">
        {/* Author Header - Compact */}
        <div className="p-3 sm:p-4 border-b border-secondary/30">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
              {post.author?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-text">{post.author?.fullName || 'Ẩn danh'}</p>
                <span className="text-xs text-text-muted">•</span>
                <p className="text-xs text-text-muted">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            {post.girl && (
              <SmoothLink
                href={getGirlDetailUrl(post.girl.id, post.girl.name || '')}
                className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="line-clamp-1 max-w-[120px]">{post.girl.name || 'Xem gái'}</span>
              </SmoothLink>
            )}
          </div>

          {post.title && (
            <h1 className="text-base sm:text-lg font-bold text-text mb-2 line-clamp-2">{post.title}</h1>
          )}

          <div className="text-sm text-text whitespace-pre-wrap break-words leading-relaxed">{post.content}</div>
        </div>

        {/* Images - Compact */}
        {images.length > 0 && (
          <div className="relative">
            <div className="relative w-full aspect-video bg-secondary/20">
              <Image
                src={getFullImageUrl(mainImage)}
                alt={post.title || 'Bài viết'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 700px"
                priority
              />
            </div>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/90 backdrop-blur-md rounded-full hover:bg-background transition-all"
                >
                  <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-background/90 backdrop-blur-md rounded-full hover:bg-background transition-all"
                >
                  <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-md rounded text-xs text-text">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions - Compact */}
        <div className="p-3 border-t border-secondary/30 flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1.5 rounded-md transition-all text-sm ${liked
              ? 'bg-primary/20 text-primary'
              : 'bg-background border border-secondary/30 text-text-muted hover:text-text'
              }`}
          >
            <svg className={`w-5 h-5 sm:w-4 sm:h-4 ${liked ? 'fill-current' : ''}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs sm:text-xs font-medium">{likeCount}</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-1.5 text-text-muted text-sm">
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs sm:text-xs font-medium">{post._count?.comments || 0}</span>
          </div>
        </div>
      </article>

      {/* Comments Section - Compact */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-3 sm:p-4">
        <h2 className="text-base font-bold text-text mb-3">Bình luận ({post._count?.comments || 0})</h2>

        {/* Comment Form */}
        {isAuthenticated ? (
          <div className="mb-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              className="w-full px-3 py-2 text-sm bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50 mb-2"
              rows={2}
            />
            <button
              onClick={handleComment}
              disabled={submittingComment || !commentText.trim()}
              className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {submittingComment ? 'Đang gửi...' : 'Gửi'}
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-background border border-secondary/30 rounded-lg text-center">
            <p className="text-xs text-text-muted mb-2">Vui lòng đăng nhập để bình luận</p>
            <SmoothLink
              href="/auth/login"
              className="inline-block px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-all font-medium"
            >
              Đăng nhập
            </SmoothLink>
          </div>
        )}

        {/* Comments List */}
        {loadingComments ? (
          <div className="text-center py-6 text-sm text-text-muted">Đang tải bình luận...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-sm text-text-muted">Chưa có bình luận nào</div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isAuthenticated={isAuthenticated}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyText={replyText}
                setReplyText={setReplyText}
                onReply={handleReply}
                submitting={submittingReply}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

