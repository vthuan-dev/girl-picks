'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { chatSexApi, ChatSexReview } from '@/modules/chat-sex/api/chat-sex.api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import ReviewImageGallery from './ReviewImageGallery';

interface ReviewSectionProps {
    girlId: string;
    girlName: string;
}

export default function ReviewSection({ girlId, girlName }: ReviewSectionProps) {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    const [reviews, setReviews] = useState<ChatSexReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Review form state
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [girlId, page]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await chatSexApi.getReviews(girlId, page, 10);
            setReviews(data.data);
            setTotal(data.total);
            setTotalPages(data.totalPages || Math.ceil(data.total / 10));
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
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
            await chatSexApi.createReview(girlId, {
                rating,
                comment: comment.trim() || undefined,
                userName: user?.fullName || 'User',
            });

            toast.success('Đánh giá thành công!');
            setShowForm(false);
            setRating(5);
            setComment('');
            setPage(1);
            fetchReviews();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-6 bg-background-light rounded-lg p-6 border border-secondary/30">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">
                    Đánh giá ({total})
                </h3>
                {isAuthenticated ? (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        {showForm ? 'Hủy' : 'Viết đánh giá'}
                    </button>
                ) : (
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                    >
                        Đăng nhập để đánh giá
                    </button>
                )}
            </div>

            {/* Review Form - Only show if authenticated */}
            {showForm && isAuthenticated && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-secondary/10 rounded-lg">
                    {/* Star Rating */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text mb-2">
                            Đánh giá *
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="text-3xl transition-colors"
                                >
                                    <span className={star <= rating ? 'text-yellow-400' : 'text-gray-400'}>
                                        ★
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Show logged in user name */}
                    <div className="mb-4">
                        <p className="text-sm text-text-muted">
                            Đánh giá với tên: <span className="font-semibold text-text">{user?.fullName || 'User'}</span>
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text mb-2">
                            Nhận xét (tùy chọn)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text focus:outline-none focus:border-primary resize-none"
                            rows={4}
                            maxLength={1000}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text mb-2">
                            Ảnh (tùy chọn, tối đa 5 ảnh)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 border border-secondary/30 rounded-lg cursor-pointer transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-text">Thêm ảnh</span>
                        </label>

                        {/* Image Previews */}
                        {images.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-secondary/30 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-secondary/30 rounded w-full mb-1"></div>
                            <div className="h-3 bg-secondary/30 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <p className="text-text-muted text-center py-8">
                    Chưa có đánh giá nào. Hãy là người đầu tiên!
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="pb-4 border-b border-secondary/20 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-text">
                                        {review.user?.fullName || review.userName || 'Anonymous'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    className={star <= review.rating ? 'text-yellow-400' : 'text-gray-400'}
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
                                <p className="text-text-muted text-sm mt-2 whitespace-pre-line">
                                    {review.comment}
                                </p>
                            )}

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <ReviewImageGallery images={review.images} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2 text-text">
                        Trang {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
}
