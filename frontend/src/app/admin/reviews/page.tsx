'use client';

import { useState } from 'react';

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const reviews = [
    {
      id: '1',
      customerName: 'Nguyễn Văn A',
      girlName: 'Trần Thị B',
      rating: 5,
      comment: 'Dịch vụ rất tốt, rất hài lòng!',
      status: 'approved',
      createdAt: '2024-12-06T10:00:00',
    },
    {
      id: '2',
      customerName: 'Lê Văn C',
      girlName: 'Nguyễn Thị D',
      rating: 4,
      comment: 'Tốt nhưng cần cải thiện thêm',
      status: 'pending',
      createdAt: '2024-12-06T14:30:00',
    },
    {
      id: '3',
      customerName: 'Phạm Văn E',
      girlName: 'Hoàng Thị F',
      rating: 3,
      comment: 'Bình thường',
      status: 'rejected',
      createdAt: '2024-12-05T09:15:00',
    },
  ];

  const statuses = ['Tất cả', 'pending', 'approved', 'rejected'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.girlName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Tất cả' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng đánh giá</p>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{reviews.length}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Chờ duyệt</p>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{reviews.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã duyệt</p>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{reviews.filter(r => r.status === 'approved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted"
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
              className="w-full pl-10 pr-4 py-2 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-text"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {status === 'Tất cả' ? status : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-background-light rounded-lg border border-secondary/30 p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <p className="font-medium text-text">{review.customerName}</p>
                    <p className="text-sm text-text-muted">Đánh giá cho {review.girlName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(review.status)}`}>
                    {getStatusText(review.status)}
                  </span>
                </div>
                <p className="text-text mb-3">{review.comment}</p>
                <p className="text-xs text-text-muted">
                  {new Date(review.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              {review.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm cursor-pointer">
                    Duyệt
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer">
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

