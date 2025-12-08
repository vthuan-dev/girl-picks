'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { postsApi, Post } from '@/modules/admin/api/posts.api';
import { adminApi } from '@/modules/admin/api/admin.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import VideoPlayer from '@/components/posts/VideoPlayer';

export default function AdminPostsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [pageInput, setPageInput] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const statuses = ['Tất cả', 'PENDING', 'APPROVED', 'REJECTED'];

  useEffect(() => {
    loadPosts();
    loadStats();
  }, [statusFilter, page]);

  // Update pageInput when page changes
  useEffect(() => {
    setPageInput('');
  }, [page]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      // For "Tất cả", pass undefined to get all posts (admin can see all statuses)
      const status = statusFilter === 'Tất cả' ? undefined : statusFilter;
      const response = await postsApi.getAllAdmin({
        status,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      setPosts(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  // Reload when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadPosts();
      } else {
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadStats = async () => {
    try {
      const dashboardStats = await adminApi.getDashboardStats();
      setStats({
        total: dashboardStats.overview.totalPosts || 0,
        pending: dashboardStats.pending.posts || 0,
        approved: 0, // TODO: Calculate
        rejected: 0, // TODO: Calculate
      });
    } catch (error) {
      // Silent fail for stats
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await postsApi.approve(id);
      toast.success('Duyệt bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt bài viết');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (!reason) {
      reason = prompt('Nhập lý do từ chối:') || 'Không phù hợp';
    }
    try {
      await postsApi.reject(id, reason);
      toast.success('Từ chối bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối bài viết');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await postsApi.delete(id);
      toast.success('Xóa bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa bài viết');
    }
  };

  const handleViewDetails = async (id: string) => {
    setIsLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const post = await postsApi.getDetailsAdmin(id);
      setSelectedPost(post);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết bài viết');
      setIsDetailModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
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

  // No need to filter on client side, backend handles it
  const filteredPosts = Array.isArray(posts) ? posts : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Bài viết</h1>
          <p className="text-text-muted">Duyệt và quản lý bài viết trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng bài viết</p>
            <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
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
          <p className="text-2xl font-bold text-text">{stats.pending}</p>
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
          <p className="text-2xl font-bold text-text">{stats.approved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
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
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
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
                {status === 'Tất cả' ? status : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-background-light rounded-xl border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Tương tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/30">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                    Không có bài viết nào
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-background/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <p className="font-medium text-text">{post.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-text">{post.author?.fullName || post.girl?.user?.fullName || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6zM14 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6z" />
                          </svg>
                          {post._count?.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post._count?.comments || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(post.status)}`}>
                        {getStatusText(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <IconButton variant="default" title="Xem chi tiết" onClick={() => handleViewDetails(post.id)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </IconButton>
                        {post.status === 'PENDING' && (
                          <>
                            <Button variant="success" size="sm" onClick={() => handleApprove(post.id)}>
                              Duyệt
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleReject(post.id, '')}>
                              Từ chối
                            </Button>
                          </>
                        )}
                        {post.status !== 'PENDING' && (
                          <IconButton variant="danger" title="Xóa" onClick={() => handleDelete(post.id)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-secondary/30 bg-background">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-text-muted">
                Trang {page} / {totalPages} (Tổng: {stats.total} bài viết)
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                  className="px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium cursor-pointer"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        disabled={isLoading}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          page === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                  className="px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium cursor-pointer"
                >
                  Sau
                </button>
                {/* Page Input */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">Đến trang:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (Number(value) >= 1 && Number(value) <= totalPages)) {
                        setPageInput(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && pageInput) {
                        const targetPage = parseInt(pageInput);
                        if (targetPage >= 1 && targetPage <= totalPages) {
                          setPage(targetPage);
                          setPageInput('');
                        }
                      }
                    }}
                    placeholder={page.toString()}
                    className="w-16 px-2 py-2 bg-background border border-secondary/50 rounded-lg text-text text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-text"
                  />
                  <button
                    onClick={() => {
                      if (pageInput) {
                        const targetPage = parseInt(pageInput);
                        if (targetPage >= 1 && targetPage <= totalPages) {
                          setPage(targetPage);
                          setPageInput('');
                        }
                      }
                    }}
                    disabled={!pageInput || isLoading}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium cursor-pointer"
                  >
                    Đi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {isDetailModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailModalOpen(false);
              setSelectedPost(null);
            }
          }}
        >
          <div className="bg-gradient-to-br from-background-light via-background-light to-background rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text">Chi tiết bài viết</h2>
                    <p className="text-sm text-text-muted">Thông tin đầy đủ về bài viết</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPost(null);
                  }}
                  className="p-2 hover:bg-background/50 rounded-xl transition-all cursor-pointer group"
                >
                  <svg className="w-6 h-6 text-text group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-text-muted">Đang tải thông tin...</p>
                </div>
              ) : selectedPost ? (
                <div className="space-y-6">
                  {/* Title Section */}
                  <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-6 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 block">
                          Tiêu đề
                        </label>
                        <h3 className="text-2xl font-bold text-text leading-tight">{selectedPost.title || 'Không có tiêu đề'}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  {selectedPost.content && (
                    <div className="bg-background-light rounded-2xl p-6 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </div>
                        <label className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                          Nội dung
                        </label>
                      </div>
                      <div className="bg-background rounded-xl p-5 text-text whitespace-pre-wrap leading-relaxed border border-secondary/20">
                        {selectedPost.content}
                      </div>
                    </div>
                  )}

                  {/* Video Section */}
                  {(selectedPost.videoUrl || selectedPost.videoSources) && (
                    <div className="bg-background-light rounded-2xl p-6 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <label className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                          Video
                        </label>
                        {selectedPost.duration && (
                          <span className="ml-auto text-xs text-text-muted bg-background px-3 py-1 rounded-full border border-secondary/30">
                            ⏱️ {selectedPost.duration}
                          </span>
                        )}
                      </div>
                      
                      {/* Video Player */}
                      {selectedPost.videoUrl && (
                        <div className="mb-6">
                          <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-secondary/30 shadow-xl">
                            <VideoPlayer
                              videoUrl={selectedPost.videoUrl}
                              videoSources={selectedPost.videoSources || []}
                              poster={selectedPost.poster || selectedPost.thumbnail}
                            />
                          </div>
                        </div>
                      )}

                      {/* Video Info */}
                      <div className="space-y-4">
                        {selectedPost.videoUrl && (
                          <div className="bg-background rounded-xl p-4 border border-secondary/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-text flex items-center gap-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Video URL
                              </span>
                            </div>
                            <a
                              href={selectedPost.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-hover text-sm break-all flex items-center gap-2"
                            >
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              {selectedPost.videoUrl}
                            </a>
                          </div>
                        )}
                        
                        {selectedPost.videoSources && Array.isArray(selectedPost.videoSources) && selectedPost.videoSources.length > 0 && (
                          <div className="bg-background rounded-xl p-4 border border-secondary/20">
                            <div className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                              </svg>
                              Các nguồn video ({selectedPost.videoSources.length})
                            </div>
                            <div className="space-y-2">
                              {selectedPost.videoSources.map((source, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-background-light rounded-lg border border-secondary/20 hover:border-primary/30 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {source.label && (
                                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                          {source.label}
                                        </span>
                                      )}
                                      {source.resolution && (
                                        <span className="text-xs text-text-muted">{source.resolution}</span>
                                      )}
                                      {source.type && (
                                        <span className="text-xs text-text-muted">({source.type})</span>
                                      )}
                                    </div>
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:text-primary-hover text-sm break-all flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      {source.url}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {(selectedPost.poster || selectedPost.thumbnail) && (
                          <div className="grid grid-cols-2 gap-4">
                            {selectedPost.poster && (
                              <div>
                                <label className="text-xs text-text-muted mb-2 block">Poster</label>
                                <img
                                  src={selectedPost.poster}
                                  alt="Poster"
                                  className="w-full rounded-lg border border-secondary/30 hover:border-primary/50 transition-colors cursor-pointer"
                                  onClick={() => window.open(selectedPost.poster, '_blank')}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            {selectedPost.thumbnail && (
                              <div>
                                <label className="text-xs text-text-muted mb-2 block">Thumbnail</label>
                                <img
                                  src={selectedPost.thumbnail}
                                  alt="Thumbnail"
                                  className="w-full rounded-lg border border-secondary/30 hover:border-primary/50 transition-colors cursor-pointer"
                                  onClick={() => window.open(selectedPost.thumbnail, '_blank')}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedPost.images && Array.isArray(selectedPost.images) && selectedPost.images.length > 0 && (
                    <div className="bg-background-light rounded-2xl p-6 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <label className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                          Hình ảnh ({selectedPost.images.length})
                        </label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPost.images.map((image, index) => (
                          <div key={index} className="group relative aspect-video bg-background rounded-xl overflow-hidden border-2 border-secondary/30 hover:border-primary/50 transition-all cursor-pointer">
                            <img
                              src={image}
                              alt={`${selectedPost.title} - ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Author */}
                    <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Tác giả
                        </label>
                      </div>
                      <p className="text-text font-medium text-lg">
                        {selectedPost.author?.fullName || selectedPost.girl?.user?.fullName || 'N/A'}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Trạng thái
                        </label>
                      </div>
                      <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(selectedPost.status)}`}>
                        {getStatusText(selectedPost.status)}
                      </span>
                    </div>

                    {/* Created At */}
                    <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Ngày tạo
                        </label>
                      </div>
                      <p className="text-text font-medium">
                        {selectedPost.createdAt 
                          ? (() => {
                              const date = new Date(selectedPost.createdAt);
                              return isNaN(date.getTime()) 
                                ? 'N/A' 
                                : format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
                            })()
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Updated At */}
                    <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Ngày cập nhật
                        </label>
                      </div>
                      <p className="text-text font-medium">
                        {selectedPost.updatedAt 
                          ? (() => {
                              const date = new Date(selectedPost.updatedAt);
                              return isNaN(date.getTime()) 
                                ? 'N/A' 
                                : format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
                            })()
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Category & Tags */}
                    {(selectedPost.category || (selectedPost.tags && Array.isArray(selectedPost.tags) && selectedPost.tags.length > 0)) && (
                      <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                            Phân loại
                          </label>
                        </div>
                        <div className="space-y-3">
                          {selectedPost.category && (
                            <div>
                              <span className="text-xs text-text-muted mb-1 block">Thể loại</span>
                              <span className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                                {selectedPost.category}
                              </span>
                            </div>
                          )}
                          {selectedPost.tags && Array.isArray(selectedPost.tags) && selectedPost.tags.length > 0 && (
                            <div>
                              <span className="text-xs text-text-muted mb-2 block">Tags ({selectedPost.tags.length})</span>
                              <div className="flex flex-wrap gap-2">
                                {selectedPost.tags.map((tag, index) => (
                                  <span key={index} className="px-2.5 py-1 bg-background border border-secondary/30 text-text rounded-lg text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Interactions & Stats */}
                    <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                          Tương tác & Thống kê
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border border-secondary/20">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6zM14 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6z" />
                          </svg>
                          <div>
                            <div className="font-bold text-text">{selectedPost._count?.likes || 0}</div>
                            <div className="text-xs text-text-muted">Lượt thích</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border border-secondary/20">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <div>
                            <div className="font-bold text-text">{selectedPost._count?.comments || 0}</div>
                            <div className="text-xs text-text-muted">Bình luận</div>
                          </div>
                        </div>
                        {selectedPost.viewCount !== undefined && (
                          <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border border-secondary/20">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <div>
                              <div className="font-bold text-text">{selectedPost.viewCount.toLocaleString('vi-VN')}</div>
                              <div className="text-xs text-text-muted">Lượt xem</div>
                            </div>
                          </div>
                        )}
                        {selectedPost.rating !== undefined && selectedPost.rating !== null && (
                          <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border border-secondary/20">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <div>
                              <div className="font-bold text-text">{selectedPost.rating.toFixed(1)}</div>
                              <div className="text-xs text-text-muted">Đánh giá</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Approved By */}
                    {selectedPost.approvedBy && (
                      <div className="bg-background-light rounded-xl p-5 border border-secondary/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                            Duyệt bởi
                          </label>
                        </div>
                        <p className="text-text font-medium">{selectedPost.approvedBy.fullName}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  Không tìm thấy thông tin bài viết
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-primary/20 bg-gradient-to-r from-background-light/50 to-transparent">
              <div className="text-sm text-text-muted">
                {selectedPost && `ID: ${selectedPost.id.slice(0, 8)}...`}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPost(null);
                  }}
                  className="px-6 py-2.5 bg-background-light border border-secondary/50 rounded-xl text-text hover:bg-primary/10 hover:border-primary transition-all text-sm font-medium cursor-pointer"
                >
                  Đóng
                </button>
                {selectedPost && (
                  <a
                    href={`/posts/${selectedPost.id}/${selectedPost.title?.toLowerCase().replace(/\s+/g, '-') || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Xem trên trang chủ
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

