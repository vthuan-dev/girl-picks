'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';

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
  replies?: Reply[];
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
  const { isAuthenticated } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [reviews, setReviews] = useState<Review[]>([
    // Mock data
    {
      id: '1',
      userId: 'user1',
      userName: 'H hoanggiahann',
      userAvatar: null,
      rating: 5,
      comment: 'Em cũng dễ là một cô gái tuyệt vời trong phân khúc tầm trung với nét xinh đẹp duyên dáng lại còn tình cảm, đôi mắt ướt át giao tiếp nhẹ nhàng',
      images: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      ],
      createdAt: '2025-12-06T10:00:00Z',
      likes: 12,
      replies: [],
    },
  ]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để viết đánh giá');
      return;
    }
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    // TODO: Call API to submit review
    console.log('Submit review:', { girlId, rating, comment });
    
    // TODO: Upload images to Cloudinary/CDN
    // For now, use local URLs (Object URLs)
    const imageUrls = selectedImages;
    
    // Reset form
    setRating(0);
    setComment('');
    setSelectedImages([]);
    setImageFiles([]);
    setShowReviewForm(false);
    
    // Add to reviews (mock)
    const newReview: Review = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Bạn',
      userAvatar: null,
      rating,
      comment,
      images: imageUrls.length > 0 ? imageUrls : undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };
    setReviews([newReview, ...reviews]);
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
    URL.revokeObjectURL(selectedImages[index]);
    
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text mb-2">Đánh giá & Bình luận</h2>
          <div className="flex items-center gap-2.5 text-sm">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => {
                const isHalf = i < averageRating && i + 1 > averageRating;
                const isFull = i < Math.floor(averageRating);
                return (
                  <div key={i} className="relative">
                    <svg
                      className={`w-4 h-4 ${
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
                          className="w-4 h-4 text-yellow-400 fill-current"
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
            <span className="font-bold text-text text-base">{averageRating.toFixed(1)}</span>
            <span className="text-text-muted">({totalReviews} đánh giá)</span>
          </div>
        </div>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all text-sm font-medium cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Viết đánh giá
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-6 p-5 bg-background rounded-xl border border-primary/20 animate-fadeIn">
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
                        className={`w-8 h-8 transition-colors ${
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
                disabled={rating === 0 || !comment.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Gửi đánh giá
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment('');
                  // Clean up object URLs
                  selectedImages.forEach((url) => URL.revokeObjectURL(url));
                  setSelectedImages([]);
                  setImageFiles([]);
                }}
                className="px-6 py-2.5 bg-background-light border border-secondary/30 text-text rounded-lg hover:bg-background transition-colors font-medium cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-text-muted">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
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
                    {review.userId === 'current-user' && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium border border-primary/30">
                        Bạn
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => {
                        const isHalf = i < review.rating && i + 1 > review.rating;
                        const isFull = i < Math.floor(review.rating);
                        return (
                          <div key={i} className="relative">
                            <svg
                              className={`w-4 h-4 ${
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
                                  className="w-4 h-4 text-yellow-400 fill-current"
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
                    <span className="text-xs sm:text-sm text-text-muted">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Comment */}
              <p className="text-text text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-line pl-0 sm:pl-16">
                {review.comment}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 pl-0 sm:pl-16">
                  {review.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-secondary/20 border border-secondary/30 group cursor-pointer"
                      onClick={() => {
                        // TODO: Open image in lightbox/modal
                        window.open(imageUrl, '_blank');
                      }}
                    >
                      <Image
                        src={imageUrl}
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
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 sm:gap-6 pt-4 border-t border-secondary/20 pl-0 sm:pl-16">
                <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm cursor-pointer group">
                  <svg className="w-4 h-4 group-hover:fill-current transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Thích ({review.likes})</span>
                </button>
                <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Phản hồi</span>
                </button>
                {review.userId !== 'current-user' && (
                  <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm cursor-pointer ml-auto">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    <span>Báo cáo</span>
                  </button>
                )}
              </div>

              {/* Replies */}
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
                        <p className="text-text-muted text-sm">{reply.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

