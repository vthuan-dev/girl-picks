'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { reviewsApi, Review } from '@/modules/admin/api/reviews.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });

  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  useEffect(() => {
    loadReviews();
  }, [statusFilter, page]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter;
      const response = await reviewsApi.getAll(status, undefined, page, 20);
      
      const reviewsData = Array.isArray(response.data) ? response.data : [];
      setReviews(reviewsData);
      setTotalPages(response.totalPages || 1);

      // Calculate stats
      const total = reviewsData.length;
      const pending = reviewsData.filter(r => r.status === 'PENDING').length;
      const approved = reviewsData.filter(r => r.status === 'APPROVED').length;
      setStats({ total, pending, approved });
    } catch (error: any) {
      console.error('Error loading reviews:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đánh giá');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await reviewsApi.approve(id);
      toast.success('Duyệt đánh giá thành công');
      loadReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt đánh giá');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason || !reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await reviewsApi.reject(id, reason);
      toast.success('Từ chối đánh giá thành công');
      loadReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối đánh giá');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    
    try {
      await reviewsApi.delete(id);
      toast.success('Xóa đánh giá thành công');
      loadReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-500/20 text-green-500';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'REJECTED':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'PENDING':
        return 'Chờ duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
    const customerName = review.customer?.fullName || '';
    const girlName = review.girl?.name || review.girl?.user?.fullName || '';
    const content = review.content || review.title || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         girlName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Đánh giá</h1>
          <p className="text-text-muted">Duyệt và quản lý đánh giá trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng đánh giá</p>
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Chờ duyệt</p>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.pending}</p>
        </div>
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã duyệt</p>
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.approved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo khách hàng, gái gọi, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    statusFilter === status
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-background-light rounded-xl border border-secondary/30 p-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-text-muted">Đang tải...</span>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-background-light rounded-xl border border-secondary/30 p-12 text-center">
            <p className="text-text-muted">Không có đánh giá nào</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-background-light rounded-xl border border-secondary/30 p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-text">{review.customer?.fullName || 'Khách hàng'}</p>
                      <p className="text-sm text-text-muted">
                        Đánh giá cho {review.girl?.name || review.girl?.user?.fullName || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                  </div>
                  <p className="text-text mb-3">{review.content || review.title || 'Không có nội dung'}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {review.images.slice(0, 3).map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Review image ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-secondary/30"
                        />
                      ))}
                      {review.images.length > 3 && (
                        <div className="w-20 h-20 bg-background border border-secondary/30 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-text-muted">+{review.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <span>
                      {format(new Date(review.createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
                    </span>
                    {review._count && (
                      <>
                        {review._count.likes > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {review._count.likes}
                          </span>
                        )}
                        {review._count.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {review._count.comments}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {review.status === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(review.id)}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                  <IconButton
                    variant="danger"
                    title="Xóa"
                    onClick={() => handleDelete(review.id)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </IconButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span className="text-text-muted text-sm">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
