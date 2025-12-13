'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { reviewsApi, type Review as ApiReview, type ReviewComment } from '@/modules/reviews/api/reviews.api';
import ExpandableText from '@/components/common/ExpandableText';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  likes: number;
  liked?: boolean;
  replies?: Reply[];
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  commentsCount?: number;
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  comment: string;
  createdAt: string;
}

interface ReviewsSectionProps {
  girlId: string;
  totalReviews: number;
  averageRating: number;
}

export default function ReviewsSection({ girlId, totalReviews, averageRating }: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingLikes, setLoadingLikes] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Comment states
  const [reviewComments, setReviewComments] = useState<Record<string, ReviewComment[]>>({});
  const [showCommentForms, setShowCommentForms] = useState<Record<string, boolean>>({});
  const [commentContents, setCommentContents] = useState<Record<string, string>>({});
  const [submittingComments, setSubmittingComments] = useState<Set<string>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  const requireAuth = () => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  // Load reviews from API
  useEffect(() => {
    loadReviews();
  }, [girlId]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxImage]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const apiReviews = await reviewsApi.getByGirlId(girlId);
      
      // Transform API reviews to component format
      const transformedReviews: Review[] = await Promise.all(
        apiReviews.map(async (apiReview) => {
          // Get likes count
          let likesCount = 0;
          try {
            likesCount = await reviewsApi.getLikes(apiReview.id);
          } catch (error) {
            console.error('Error loading likes:', error);
          }

          // Get comments count from API if available
          const commentsCount = apiReview._count?.comments || 0;

          return {
            id: apiReview.id,
            userId: apiReview.customer.id,
            userName: apiReview.customer.fullName,
            userAvatar: apiReview.customer.avatarUrl || null,
            rating: apiReview.rating,
            comment: apiReview.content,
            images: apiReview.images || [],
            createdAt: apiReview.createdAt,
            likes: likesCount,
            liked: false, // TODO: Check if current user liked this
            status: apiReview.status,
            replies: [], // Will load separately if needed
            commentsCount, // Store comment count
          };
        })
      );

      setReviews(transformedReviews);
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (reviewId: string) => {
    if (loadingComments.has(reviewId) || reviewComments[reviewId]) {
      return; // Already loading or loaded
    }

    try {
      setLoadingComments((prev) => new Set(prev).add(reviewId));
      const response = await reviewsApi.getComments(reviewId, 1, 50);
      setReviewComments((prev) => ({
        ...prev,
        [reviewId]: response.data || [],
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Không thể tải bình luận');
    } finally {
      setLoadingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleToggleCommentForm = (reviewId: string) => {
    if (!requireAuth()) return;
    
    setShowCommentForms((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));

    // Load comments when opening the form
    if (!showCommentForms[reviewId] && !reviewComments[reviewId]) {
      loadComments(reviewId);
    }
  };

  const handleSubmitComment = async (reviewId: string) => {
    if (!requireAuth()) return;
    
    const content = commentContents[reviewId]?.trim();
    if (!content) {
      toast.error('Vui lòng nhập nội dung bình luận');
      return;
    }

    try {
      setSubmittingComments((prev) => new Set(prev).add(reviewId));
      const newComment = await reviewsApi.addComment(reviewId, { content });
      
      // Add comment to state
      setReviewComments((prev) => ({
        ...prev,
        [reviewId]: [newComment, ...(prev[reviewId] || [])],
      }));

      // Clear comment input and close form
      setCommentContents((prev) => {
        const newContents = { ...prev };
        delete newContents[reviewId];
        return newContents;
      });
      setShowCommentForms((prev) => ({
        ...prev,
        [reviewId]: false,
      }));

      toast.success('Bình luận thành công!');
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi bình luận');
    } finally {
      setSubmittingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/review', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Không thể tải ảnh lên');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    // Validation: Prevent creating reviews with very short text (1-2 words) without images
    // This ensures comments stay as comments, not become reviews
    const trimmedComment = comment.trim();
    const wordCount = trimmedComment.split(/\s+/).filter(word => word.length > 0).length;
    const hasImages = selectedImages.length > 0 || imageFiles.length > 0;
    
    if (wordCount <= 2 && !hasImages) {
      toast.error('Vui lòng nhập nội dung đánh giá đầy đủ hơn hoặc thêm hình ảnh. Bình luận ngắn nên được thêm vào phần bình luận của review, không phải tạo review mới.');
      return;
    }
    
    if (wordCount < 5 && !hasImages) {
      toast.error('Vui lòng nhập nội dung đánh giá chi tiết hơn (ít nhất 5 từ) hoặc thêm hình ảnh.');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images to server
      const imageUrls: string[] = [];
      
      // Upload local files
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const previewUrl = selectedImages[i];
        
        try {
          const uploadedUrl = await uploadImage(file);
          imageUrls.push(uploadedUrl);
          
          // Clean up object URL after successful upload
          if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }
        } catch (error: any) {
          console.error('Error uploading image:', error);
          toast.error(`Không thể upload ảnh: ${file.name}`);
        }
      }
      
      // Add any manually entered URLs from selectedImages (if they're full URLs)
      // Skip blob URLs as they're already being uploaded above
      selectedImages.forEach((url, index) => {
        // Skip if this is a blob URL that corresponds to a file we're uploading
        if (index < imageFiles.length && url.startsWith('blob:')) {
          return;
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
          imageUrls.push(url);
        } else if (url.startsWith('/')) {
          // Already uploaded to server
          imageUrls.push(url);
        }
      });

      // Submit review to API
      const reviewData = {
        girlId,
        title: title.trim() || `Đánh giá ${rating} sao`,
        content: comment.trim(),
        rating,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await reviewsApi.create(reviewData);

      toast.success('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
    
    // Reset form
    setRating(0);
    setComment('');
      setTitle('');
    setSelectedImages([]);
    setImageFiles([]);
    setShowReviewForm(false);
    
      // Reload reviews
      await loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi đánh giá';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!requireAuth()) return;

    try {
      setLoadingLikes((prev) => new Set(prev).add(reviewId));
      const result = await reviewsApi.toggleLike(reviewId);
      
      // Update review in state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                likes: result.likesCount,
                liked: result.liked,
              }
            : review
        )
      );
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Không thể thích đánh giá này');
    } finally {
      setLoadingLikes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - selectedImages.length); // Max 5 images
    const newImageFiles = [...imageFiles, ...newFiles];
    setImageFiles(newImageFiles);

    // Create preview URLs
    const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages([...selectedImages, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to free memory
    if (selectedImages[index]?.startsWith('blob:')) {
    URL.revokeObjectURL(selectedImages[index]);
    }
    
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
      {/* Header */}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-6 border-b border-secondary/30">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4 flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            Đánh giá & Bình luận
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => {
                const isHalf = i < averageRating && i + 1 > averageRating;
                const isFull = i < Math.floor(averageRating);
                return (
                  <div key={i} className="relative">
                    <svg
                      className={`w-8 h-8 sm:w-9 sm:h-9 transition-all ${
                        isFull
                          ? 'text-yellow-400 fill-current'
                          : 'text-secondary/30'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {isHalf && (
                      <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                        <svg
                          className="w-8 h-8 sm:w-9 sm:h-9 text-yellow-400 fill-current"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-text text-xl sm:text-2xl">{averageRating.toFixed(1)}</span>
              <span className="text-text-muted text-base">({totalReviews} đánh giá)</span>
            </div>
          </div>
        </div>
        {!loading && (
              <button
            onClick={() => {
              if (!requireAuth()) return;
              setShowReviewForm(!showReviewForm);
            }}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all font-semibold cursor-pointer flex items-center justify-center gap-2.5 flex-shrink-0 text-base"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Viết đánh giá
              </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-6 bg-background rounded-xl border border-primary/20 animate-fadeIn shadow-lg">
          {!isAuthenticated || !user ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-lg shadow-primary/10">
                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text mb-2">Vui lòng đăng nhập</h3>
              <p className="text-text-muted mb-6">Đăng nhập để viết đánh giá và chia sẻ trải nghiệm của bạn</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmitReview} className="space-y-5">
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Đánh giá của bạn <span className="text-primary">*</span>
              </label>
              <div className="flex items-center gap-2.5">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <svg
                          className={`w-12 h-12 transition-colors ${
                          starValue <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-secondary/30'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  );
                })}
                {rating > 0 && (
                  <span className="ml-3 text-sm text-text-muted font-medium">
                    {rating === 1 && 'Rất tệ'}
                    {rating === 2 && 'Tệ'}
                    {rating === 3 && 'Bình thường'}
                    {rating === 4 && 'Tốt'}
                    {rating === 5 && 'Rất tốt'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-text mb-3">
                Bình luận <span className="text-primary">*</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-background-light border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
              <div className="mt-2 text-xs text-text-muted text-right">
                {comment.length}/500
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-text mb-3">
                Hình ảnh (tùy chọn)
              </label>
              
              {/* Image Preview Grid */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                  {selectedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20 border border-secondary/30">
                        <img
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600 shadow-lg"
                        aria-label="Xóa ảnh"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {selectedImages.length < 5 && (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-light border border-secondary/30 rounded-lg hover:bg-background hover:border-primary/50 transition-all cursor-pointer text-sm font-medium text-text">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Thêm ảnh</span>
                  <input
                      ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={selectedImages.length >= 5}
                  />
                </label>
              )}
              {selectedImages.length >= 5 && (
                <p className="text-xs text-text-muted">Đã đạt giới hạn 5 ảnh</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                  disabled={rating === 0 || !comment.trim() || submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
              >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    'Gửi đánh giá'
                  )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment('');
                    setTitle('');
                  // Clean up object URLs
                    selectedImages.forEach((url) => {
                      if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                      }
                    });
                  setSelectedImages([]);
                  setImageFiles([]);
                }}
                className="px-6 py-2.5 bg-background-light border border-secondary/30 text-text rounded-lg hover:bg-background transition-colors font-medium cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6">
            <span className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin inline-block" />
          </div>
          <p className="text-text-muted text-base font-medium">Đang tải đánh giá...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-lg shadow-primary/10">
            <svg className="w-14 h-14 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Chưa có đánh giá nào</h3>
          <p className="text-text-muted text-base mb-6 max-w-md mx-auto">
            Hãy là người đầu tiên chia sẻ trải nghiệm của bạn về dịch vụ này!
          </p>
          {isAuthenticated && user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all font-semibold cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Viết đánh giá đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 sm:p-5 bg-background rounded-xl border border-secondary/20 hover:border-secondary/40 transition-all"
            >
              {/* Review Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center flex-shrink-0 border-2 border-primary/40 shadow-lg shadow-primary/20">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-base">
                      {review.userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info & Rating */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-text text-sm sm:text-base">{review.userName}</h4>
                    {review.userId === user?.id && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium border border-primary/30">
                        Bạn
                      </span>
                    )}
                    {review.status === 'PENDING' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium border border-yellow-500/30">
                        Chờ duyệt
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => {
                        const isFull = i < Math.floor(review.rating);
                        return (
                            <svg
                            key={i}
                            className={`w-8 h-8 sm:w-9 sm:h-9 transition-all ${
                                isFull
                                  ? 'text-yellow-400 fill-current'
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
                    <span className="text-xs sm:text-sm text-text-muted">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4 pl-0 sm:pl-16">
                <ExpandableText 
                  text={review.comment} 
                  maxLength={200}
                  className="text-text text-sm sm:text-base"
                />
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 pl-0 sm:pl-16">
                  {review.images.map((imageUrl, index) => {
                    // Handle both relative and absolute URLs
                    const displayUrl = imageUrl.startsWith('/') 
                      ? imageUrl 
                      : imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
                      ? imageUrl
                      : `/${imageUrl}`;
                    
                    const fullUrl = imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
                      ? imageUrl
                      : typeof window !== 'undefined' 
                        ? `${window.location.origin}${displayUrl}`
                        : displayUrl;

                    return (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-secondary/20 border border-secondary/30 group cursor-pointer"
                      onClick={() => {
                        setLightboxImages(review.images || []);
                        setLightboxImage(displayUrl);
                      }}
                    >
                      <Image
                          src={displayUrl}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 33vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-secondary/20 pl-0 sm:pl-16">
                <button
                  onClick={() => handleToggleLike(review.id)}
                  disabled={loadingLikes.has(review.id)}
                  className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm cursor-pointer group disabled:opacity-50"
                >
                  {loadingLikes.has(review.id) ? (
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  ) : (
                    <svg
                      className={`w-4 h-4 transition-all ${review.liked ? 'fill-current text-primary' : 'group-hover:fill-current'}`}
                      fill={review.liked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  )}
                  <span>Thích ({review.likes})</span>
                </button>
                <button
                  onClick={() => handleToggleCommentForm(review.id)}
                  className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Phản hồi ({reviewComments[review.id]?.length || review.commentsCount || 0})</span>
                </button>
                {review.userId !== user?.id && (
                  <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm cursor-pointer ml-auto">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    <span>Báo cáo</span>
                  </button>
                )}
              </div>

              {/* Comment Form */}
              {showCommentForms[review.id] && (
                <div className="mt-4 pl-0 sm:pl-16 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <textarea
                        value={commentContents[review.id] || ''}
                        onChange={(e) =>
                          setCommentContents((prev) => ({
                            ...prev,
                            [review.id]: e.target.value,
                          }))
                        }
                        placeholder="Viết bình luận..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-3 py-2 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => {
                            setShowCommentForms((prev) => ({
                              ...prev,
                              [review.id]: false,
                            }));
                            setCommentContents((prev) => {
                              const newContents = { ...prev };
                              delete newContents[review.id];
                              return newContents;
                            });
                          }}
                          className="px-3 py-1.5 text-text-muted hover:text-text rounded-lg transition-colors text-sm"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSubmitComment(review.id)}
                          disabled={submittingComments.has(review.id) || !commentContents[review.id]?.trim()}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium"
                        >
                          {submittingComments.has(review.id) ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Đang gửi...
                            </>
                          ) : (
                            'Gửi'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {reviewComments[review.id] && reviewComments[review.id].length > 0 && (
                <div className="mt-4 pl-0 sm:pl-16 space-y-3">
                  {loadingComments.has(review.id) ? (
                    <div className="text-center py-4">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    reviewComments[review.id].map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          {comment.user?.avatarUrl ? (
                            <img
                              src={comment.user.avatarUrl}
                              alt={comment.user.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-text-muted text-xs font-semibold">
                              {comment.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-background/60 rounded-xl px-3 py-2 inline-block max-w-full">
                            <span className="font-medium text-text text-sm">
                              {comment.user?.fullName || 'Người dùng'}
                            </span>
                            <p className="text-text text-sm whitespace-pre-wrap break-words mt-0.5">
                              {comment.content}
                            </p>
                          </div>
                          <span className="text-xs text-text-muted ml-1 mt-1 block">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Legacy Replies (if any) */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-primary/20 space-y-3">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-text-muted text-xs font-semibold">
                          {reply.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-text text-sm">{reply.userName}</span>
                          <span className="text-xs text-text-muted">{formatDate(reply.createdAt)}</span>
                        </div>
                        <ExpandableText 
                          text={reply.comment} 
                          maxLength={150}
                          className="text-text-muted text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
          {lightboxImages.length > 1 && (() => {
            // Normalize URLs for comparison
            const normalizeUrl = (url: string) => {
              if (url.startsWith('/')) return url;
              if (url.startsWith('http://') || url.startsWith('https://')) return url;
              return `/${url}`;
            };
            
            const normalizedLightboxImage = normalizeUrl(lightboxImage);
            const normalizedImages = lightboxImages.map(normalizeUrl);
            const currentIndex = normalizedImages.findIndex(img => {
              // Compare by removing protocol and domain if present
              const img1 = img.replace(/^https?:\/\/[^/]+/, '');
              const img2 = normalizedLightboxImage.replace(/^https?:\/\/[^/]+/, '');
              return img1 === img2 || img === normalizedLightboxImage;
            });
            
            return (
              <>
                {/* Previous Button */}
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const prevUrl = lightboxImages[currentIndex - 1];
                      const displayUrl = normalizeUrl(prevUrl);
                      setLightboxImage(displayUrl);
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
                {currentIndex < lightboxImages.length - 1 && currentIndex >= 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextUrl = lightboxImages[currentIndex + 1];
                      const displayUrl = normalizeUrl(nextUrl);
                      setLightboxImage(displayUrl);
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
                  {lightboxImages.map((img, i) => {
                    const displayUrl = normalizeUrl(img);
                    const isActive = (() => {
                      const img1 = displayUrl.replace(/^https?:\/\/[^/]+/, '');
                      const img2 = normalizedLightboxImage.replace(/^https?:\/\/[^/]+/, '');
                      return img1 === img2 || displayUrl === normalizedLightboxImage;
                    })();
                    
                    return (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(displayUrl);
                        }}
                        className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                          isActive ? 'border-primary' : 'border-transparent hover:border-white/50'
                        }`}
                      >
                        <Image src={displayUrl} alt="" fill className="object-cover" unoptimized />
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
