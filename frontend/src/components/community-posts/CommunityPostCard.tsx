'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { communityPostsApi, type CommunityPost, type CommunityPostComment } from '@/modules/community-posts/api/community-posts.api';
import { getGirlDetailUrl, generateSlug } from '@/lib/utils/slug';

interface CommunityPostCardProps {
  post: CommunityPost;
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
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className={`text-text ${isNested ? 'text-xs' : 'text-sm'} whitespace-pre-wrap mb-2`}>{comment.content}</p>
          
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

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post._count?.comments || 0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  const girlUrl = post.girl
    ? getGirlDetailUrl(post.girl.id, post.girl.name || generateSlug(post.girl.id))
    : '#';
  
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
      const result = await communityPostsApi.getComments(post.id);
      const commentsData = result.data || [];
      
      const organizedComments = commentsData.map((cmt: CommunityPostComment) => ({
        ...cmt,
        replies: cmt.replies || [],
      }));
      
      setComments(organizedComments);
      setCommentsCount(result.total || commentsData.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Không thể tải bình luận');
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (post._count?.comments !== undefined) {
      setCommentsCount(post._count.comments);
    }
  }, [post._count?.comments]);

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

  // Load like status when component mounts
  const loadLikeStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const status = await communityPostsApi.getLikeStatus(post.id);
      if (typeof status?.liked === 'boolean') {
        setLiked(status.liked);
      }
      if (typeof status?.likesCount === 'number') {
        setLikesCount(status.likesCount);
      }
    } catch (error) {
      console.error('Error loading like status:', error);
      // If error, use initial count from post
      setLikesCount(post._count?.likes || 0);
    }
  }, [isAuthenticated, post.id, post._count?.likes]);

  useEffect(() => {
    loadLikeStatus();
  }, [loadLikeStatus]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích');
      return;
    }
    if (liking) {
      return;
    }
    try {
      setLiking(true);
      const result = await communityPostsApi.toggleLike(post.id);
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error: any) {
      console.error('Error toggling like:', error);
      let errorMessage = 'Không thể thích bài viết';
      
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

  const addReplyToComment = (comments: CommunityPostComment[], parentId: string, newReply: CommunityPostComment): CommunityPostComment[] => {
    return comments.map(cmt => {
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
      if (cmt.replies && cmt.replies.length > 0) {
        return {
          ...cmt,
          replies: addReplyToComment(cmt.replies, parentId, newReply),
        };
      }
      return cmt;
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community-posts/${post.id}`;
    const shareData = {
      title: post.title || 'Bài viết cộng đồng',
      text: post.content.substring(0, 100) + '...',
      url: url,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Đã chia sẻ');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Đã sao chép link vào clipboard');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // User cancelled or error occurred
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Đã sao chép link vào clipboard');
        } catch (clipboardError) {
          toast.error('Không thể chia sẻ');
        }
      }
    }
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
      const newComment = await communityPostsApi.addComment(post.id, { 
        content: commentText,
        ...(parentId && { parentId })
      });
      
      if (parentId) {
        setReplyText(prev => ({ ...prev, [parentId]: '' }));
        setReplyingTo(null);
        setComments(prevComments => addReplyToComment(prevComments, parentId, newComment));
        setCommentsCount(prev => prev + 1);
      } else {
        setComment('');
        setComments(prevComments => [newComment, ...prevComments]);
        setCommentsCount(prev => prev + 1);
      }
      
      toast.success(parentId ? 'Đã gửi phản hồi' : 'Đã gửi bình luận');
    } catch {
      toast.error('Không thể gửi bình luận');
    } finally {
      setSubmitting(false);
    }
  };

  const images = post.images || [];
  const displayImages = images.slice(0, 4);

  return (
    <div className="border border-secondary/20 rounded-xl p-3 md:p-4 bg-background-light/60 md:max-w-4xl md:mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {post.author?.fullName?.charAt(0)?.toUpperCase() || 'N'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text text-sm md:text-base truncate">
              {post.author?.fullName || 'Ẩn danh'}
            </span>
            <span className="text-text-muted text-xs md:text-sm">• {formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Title (if exists) */}
      {post.title && (
        <h3 className="text-text font-semibold text-base md:text-lg mb-2">{post.title}</h3>
      )}

      {/* Content */}
      <p className="text-text text-sm md:text-base mb-2 leading-relaxed">{post.content}</p>

      {/* Girl Tag */}
      {post.girl && (
        <Link 
          href={girlUrl}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 mb-3 group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            {post.girl.user?.avatarUrl ? (
              <img 
                src={post.girl.user.avatarUrl} 
                alt={post.girl.name || 'Gái'} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-xs font-bold">
                {(post.girl.name || post.girl.user?.fullName || 'G')?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-primary group-hover:text-primary-hover">
            {post.girl.name || post.girl.user?.fullName || 'Gái gọi'}
          </span>
          <svg className="w-4 h-4 text-primary/60 group-hover:text-primary transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Images grid */}
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {displayImages.map((img, i) => (
            <div 
              key={i}
              className="relative w-full aspect-square rounded-xl overflow-hidden bg-secondary/20 cursor-pointer group"
              onClick={() => setLightboxImage(img)}
            >
              <Image
                src={img}
                alt={`Post image ${i + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleShare();
          }}
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
          title="Chia sẻ"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-4 space-y-3 border-t border-secondary/20 pt-4">
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
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-50"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div 
            className="relative w-full h-full max-w-4xl max-h-[90vh] mx-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="Post image"
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
          </div>

          {post.images && post.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg">
              {post.images.map((img, i) => (
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

