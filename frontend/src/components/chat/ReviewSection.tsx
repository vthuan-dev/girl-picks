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
    const [images, setImages] = useState<string[]>([]);
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        if (images.length + files.length > 4) {
            toast.error('Tối đa 4 ảnh');
            return;
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
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
                images: images.length > 0 ? images : undefined,
                userName: user?.fullName || 'User',
            });

            toast.success('Đánh giá thành công!');
            setShowForm(false);
            setRating(5);
            setComment('');
            setImages([]);
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
                            Ảnh (tùy chọn, tối đa 4 ảnh)
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
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-background rounded-xl p-6 border border-secondary/20">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-secondary/30 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-secondary/30 rounded w-1/4 mb-2"></div>
                                    <div className="h-3 bg-secondary/30 rounded w-full mb-1"></div>
                                    <div className="h-3 bg-secondary/30 rounded w-3/4"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <p className="text-text-muted text-lg">
                        Chưa có đánh giá nào
                    </p>
                    <p className="text-text-muted/60 text-sm mt-1">
                        Hãy là người đầu tiên đánh giá!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-background rounded-xl p-6 border border-secondary/20 hover:border-secondary/40 transition-all duration-200 hover:shadow-lg"
                        >
                            {/* Header with Avatar and User Info */}
                            <div className="flex items-start gap-4 mb-4">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {(review.user?.fullName || review.userName || 'A')[0].toUpperCase()}
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="font-bold text-text text-lg truncate">
                                            {review.user?.fullName || review.userName || 'Anonymous'}
                                        </h4>
                                        <span className="text-xs text-text-muted whitespace-nowrap">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <p className="text-text text-base leading-relaxed mb-4 whitespace-pre-line">
                                    {review.comment}
                                </p>
                            )}

                            {/* Review Images */}
                            {review.images && review.images.length > 0 && (
                                <ReviewImageGallery images={review.images} />
                            )}

                            {/* Footer Actions */}
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-secondary/20">
                                <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                    <span>Hữu ích</span>
                                </button>
                                <button className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>Bình luận</span>
                                </button>
                            </div>
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
