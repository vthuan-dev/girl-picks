'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { communityPostsAdminApi } from '@/modules/admin/api/community-posts.api';
import { CommunityPost } from '@/modules/community-posts/api/community-posts.api';
import { adminApi } from '@/modules/admin/api/admin.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import { getGirlDetailUrl } from '@/lib/utils/slug';

export default function AdminCommunityPostsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
  });
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<{ id: string; title: string; content: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const statuses = ['PENDING', 'APPROVED', 'REJECTED'];

  useEffect(() => {
    loadPosts();
  }, [statusFilter, page]);

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

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await communityPostsAdminApi.getAll({
        status: statusFilter === 'Tất cả' ? undefined : statusFilter as any,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      const postsData = response.data || [];
      setPosts(postsData);
      setTotalPages(response.totalPages || 1);

      // Update stats based on loaded posts
      const pendingCount = postsData.filter((p: CommunityPost) => p.status === 'PENDING').length;
      const approvedCount = postsData.filter((p: CommunityPost) => p.status === 'APPROVED').length;
      setStats({
        total: postsData.length,
        pending: pendingCount,
        approved: approvedCount,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách bài viết');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const dashboardStats = await adminApi.getDashboardStats();
      // Count community posts from current list
      const pendingCount = posts.filter(p => p.status === 'PENDING').length;
      const approvedCount = posts.filter(p => p.status === 'APPROVED').length;

      setStats({
        total: posts.length,
        pending: pendingCount,
        approved: approvedCount,
      });
    } catch (error) {
      // Silent fail
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await communityPostsAdminApi.approve(id);
      toast.success('✅ Duyệt bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt bài viết');
    }
  };

  const handleRejectClick = (id: string) => {
    setRejectingPostId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim() || !rejectingPostId) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await communityPostsAdminApi.reject(rejectingPostId, rejectReason);
      toast.success('❌ Từ chối bài viết thành công');
      setIsRejectModalOpen(false);
      setRejectReason('');
      setRejectingPostId(null);
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối bài viết');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await communityPostsAdminApi.delete(id);
      toast.success('🗑️ Xóa bài viết thành công');
      loadPosts();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa bài viết');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const post = await communityPostsAdminApi.getDetails(id);
      setSelectedPost(post);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết bài viết');
    }
  };

  const handleEditClick = (post: CommunityPost) => {
    setEditingPost({
      id: post.id,
      title: post.title || '',
      content: post.content || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    if (!editingPost.content.trim()) {
      toast.error('Nội dung không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      await communityPostsAdminApi.update(editingPost.id, {
        title: editingPost.title,
        content: editingPost.content,
      });
      toast.success('📝 Cập nhật bài viết thành công');
      setIsEditModalOpen(false);
      setEditingPost(null);
      loadPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật bài viết');
    } finally {
      setIsSaving(false);
    }
  };

  const openLightbox = (images: string[], currentImage: string) => {
    setLightboxImages(images);
    setLightboxIndex(images.indexOf(currentImage));
    setLightboxImage(currentImage);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setLightboxImages([]);
    setLightboxIndex(0);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxImages.length === 0) return;
    let newIndex = lightboxIndex;
    if (direction === 'next') {
      newIndex = (lightboxIndex + 1) % lightboxImages.length;
    } else {
      newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    }
    setLightboxIndex(newIndex);
    setLightboxImage(lightboxImages[newIndex]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30';
      case 'PENDING':
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30';
      case 'REJECTED':
        return 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
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

  const filteredPosts = Array.isArray(posts) ? posts.filter(post => {
    const authorName = post.author?.fullName || '';
    const content = post.content || post.title || '';
    const matchesSearch = authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header với gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent mb-2">
                Quản lý Bài viết Cộng đồng
              </h1>
              <p className="text-text-muted text-sm sm:text-base">Duyệt và quản lý bài viết cộng đồng do khách tạo</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -z-0"></div>
      </div>

      {/* Stats Cards với animations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="group relative bg-gradient-to-br from-background-light to-background rounded-xl border border-secondary/30 p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-muted">Tổng bài viết</p>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text">{stats.total.toLocaleString('vi-VN')}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-background-light to-background rounded-xl border border-secondary/30 p-6 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-muted">Chờ duyệt</p>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text">{stats.pending.toLocaleString('vi-VN')}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-br from-background-light to-background rounded-xl border border-secondary/30 p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-muted">Đã duyệt</p>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-text">{stats.approved.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>

      {/* Filters với improved design */}
      <div className="bg-gradient-to-br from-background-light to-background rounded-xl border border-secondary/30 p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none group-focus-within:text-primary transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tác giả, nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background border-2 border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
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
                  px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                  ${statusFilter === status
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-background border-2 border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50 hover:scale-105'
                  }
                `}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bảng danh sách bài viết */}
      <div className="bg-gradient-to-br from-background-light to-background rounded-xl border border-secondary/30 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background border-b border-secondary/30">
              <tr className="text-left text-text-muted uppercase text-xs">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tiêu đề / Nội dung</th>
                <th className="px-4 py-3">Tác giả</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 whitespace-nowrap">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/20">
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-3 w-16 bg-secondary/30 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-40 bg-secondary/30 rounded mb-2" />
                      <div className="h-3 w-24 bg-secondary/30 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-28 bg-secondary/30 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-16 bg-secondary/30 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-3 w-24 bg-secondary/30 rounded" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-3 w-20 bg-secondary/30 rounded ml-auto" />
                    </td>
                  </tr>
                ))}

              {!isLoading && filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-text-muted">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-text font-semibold">Không có bài viết nào</p>
                        <p className="text-sm text-text-muted">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredPosts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-4 py-4 align-top text-xs text-text-muted">
                      <div className="font-semibold text-text">{index + 1 + (page - 1) * 20}</div>
                      <div className="truncate max-w-[140px]">{post.id}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.title && <p className="text-text font-semibold line-clamp-1">{post.title}</p>}
                          {post.girl && (
                            <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 text-xs font-semibold rounded-full border border-pink-500/30 flex items-center gap-1 flex-shrink-0">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Tag gái
                            </span>
                          )}
                        </div>
                        <p className="text-text-muted text-sm line-clamp-2">{post.content}</p>
                        {post.images && post.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {post.images.slice(0, 3).map((image, idx) => (
                              <button
                                key={idx}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-secondary/30 hover:border-primary/50 transition-colors"
                                onClick={() => openLightbox(post.images || [], image)}
                              >
                                <img src={image} alt={`img-${idx}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                            {post.images.length > 3 && (
                              <div className="w-10 h-10 rounded-lg border border-secondary/30 bg-background flex items-center justify-center text-xs text-text-muted">
                                +{post.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="text-text font-semibold line-clamp-1">
                        {post.author?.fullName || 'Người dùng'}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(post.status)} whitespace-nowrap inline-block`}>
                        {getStatusText(post.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top whitespace-nowrap text-sm text-text-muted">
                      {format(new Date(post.createdAt), 'HH:mm • dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        <IconButton variant="default" title="Xem chi tiết" onClick={() => handleViewDetails(post.id)}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </IconButton>
                        <IconButton
                          variant="default"
                          title="Chỉnh sửa content"
                          onClick={() => handleEditClick(post)}
                          className="!text-blue-400 hover:!bg-blue-500/20"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </IconButton>
                        {post.status === 'PENDING' ? (
                          <>
                            <Button variant="success" size="sm" onClick={() => handleApprove(post.id)}>
                              Duyệt
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleRejectClick(post.id)}>
                              Từ chối
                            </Button>
                          </>
                        ) : (
                          <IconButton variant="danger" title="Xóa" onClick={() => handleDelete(post.id)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination với improved design */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-background-light to-background border-2 border-secondary/50 rounded-xl text-text hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Trước
          </button>
          <div className="px-6 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
            <span className="text-sm font-semibold text-text">
              Trang <span className="text-primary">{page}</span> / {totalPages}
            </span>
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="px-5 py-2.5 bg-gradient-to-r from-background-light to-background border-2 border-secondary/50 rounded-xl text-text hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
          >
            Sau
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            if (!isSaving) {
              setIsEditModalOpen(false);
              setEditingPost(null);
            }
          }}
        >
          <div
            className="bg-gradient-to-br from-background-light to-background rounded-2xl border-2 border-primary/30 shadow-2xl max-w-2xl w-full p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text">Chỉnh sửa bài viết</h2>
                <p className="text-text-muted text-sm">Cập nhật tiêu đề và nội dung bài viết</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Tiêu đề (không bắt buộc)</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder="Nhập tiêu đề..."
                  className="w-full px-4 py-3 bg-background border-2 border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Nội dung</label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="Nhập nội dung bài viết..."
                  className="w-full h-48 px-4 py-3 bg-background border-2 border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPost(null);
                }}
                className="flex-1"
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdatePost}
                className="flex-1"
                disabled={isSaving || !editingPost.content.trim()}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </div>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setIsRejectModalOpen(false);
            setRejectReason('');
            setRejectingPostId(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-background-light to-background rounded-2xl border-2 border-red-500/30 shadow-2xl max-w-md w-full p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-text">Từ chối bài viết</h2>
            </div>
            <p className="text-text-muted mb-4">Vui lòng nhập lý do từ chối bài viết này:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="w-full h-32 px-4 py-3 bg-background border-2 border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
              autoFocus
            />
            <div className="flex items-center gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason('');
                  setRejectingPostId(null);
                }}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectConfirm}
                className="flex-1"
                disabled={!rejectReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal với improved design */}
      {isDetailModalOpen && selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto"
          onClick={() => {
            setIsDetailModalOpen(false);
            setSelectedPost(null);
          }}
        >
          <div
            className="bg-gradient-to-br from-background-light via-background-light to-background rounded-3xl border-2 border-primary/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-hover rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="p-3 hover:bg-background/50 rounded-xl transition-all group"
                >
                  <svg className="w-6 h-6 text-text group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Author */}
              <div className="bg-gradient-to-r from-background to-background-light rounded-xl p-5 border border-secondary/20">
                <div className="flex items-center gap-4">
                  {selectedPost.author?.avatarUrl ? (
                    <img
                      src={selectedPost.author.avatarUrl}
                      alt={selectedPost.author.fullName}
                      className="w-16 h-16 rounded-full border-2 border-primary/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-2xl">
                        {selectedPost.author?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-text-muted uppercase mb-1 block">Tác giả</label>
                    <p className="text-lg font-bold text-text">{selectedPost.author?.fullName}</p>
                    <p className="text-sm text-text-muted">{selectedPost.author?.role}</p>
                  </div>
                </div>
              </div>

              {/* Tagged Girl */}
              {selectedPost.girl && (
                <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl p-5 border border-pink-500/20">
                  <label className="text-xs text-text-muted uppercase mb-3 block">Gái được tag</label>
                  <div className="flex items-center gap-4">
                    {selectedPost.girl.user?.avatarUrl ? (
                      <img
                        src={selectedPost.girl.user.avatarUrl}
                        alt={selectedPost.girl.name || 'Gái gọi'}
                        className="w-16 h-16 rounded-full border-2 border-pink-500/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-500/30 flex items-center justify-center">
                        <span className="text-pink-400 font-bold text-2xl">
                          {(selectedPost.girl.name || selectedPost.girl.user?.fullName || 'G')?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-lg font-bold text-text">
                        {selectedPost.girl.name || selectedPost.girl.user?.fullName || 'Gái gọi'}
                      </p>
                      <a
                        href={getGirlDetailUrl(
                          selectedPost.girl.id,
                          selectedPost.girl.name || selectedPost.girl.user?.fullName || selectedPost.girl.id
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 mt-1"
                      >
                        <span>Xem hồ sơ</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              {selectedPost.title && (
                <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-5 border border-primary/10">
                  <label className="text-xs text-text-muted uppercase mb-2 block">Tiêu đề</label>
                  <h3 className="text-2xl font-bold text-text">{selectedPost.title}</h3>
                </div>
              )}

              {/* Content */}
              <div className="bg-background-light rounded-xl p-5 border border-secondary/20">
                <label className="text-xs text-text-muted uppercase mb-3 block">Nội dung</label>
                <p className="text-text whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
              </div>

              {/* Images Gallery */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="bg-background-light rounded-xl p-5 border border-secondary/20">
                  <label className="text-xs text-text-muted uppercase mb-4 block">
                    Hình ảnh ({selectedPost.images.length})
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedPost.images.map((image, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-secondary/30 cursor-pointer hover:border-primary/50 transition-all group"
                        onClick={() => openLightbox(selectedPost.images || [], image)}
                      >
                        <img
                          src={image}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m4-6v6m-6 4h.01M19 10h.01" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {selectedPost._count && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6zM14 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6z" />
                      </svg>
                      <span className="text-xs text-text-muted uppercase">Lượt thích</span>
                    </div>
                    <p className="text-2xl font-bold text-text">{selectedPost._count.likes || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-xs text-text-muted uppercase">Bình luận</span>
                    </div>
                    <p className="text-2xl font-bold text-text">{selectedPost._count.comments || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-primary/20 bg-gradient-to-r from-background-light/50 to-transparent">
              <div className="text-sm text-text-muted">
                {selectedPost && `ID: ${selectedPost.id.slice(0, 8)}...`}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedPost(null);
                  }}
                >
                  Đóng
                </Button>
                {selectedPost.status === 'PENDING' && (
                  <>
                    <Button
                      variant="success"
                      onClick={() => {
                        handleApprove(selectedPost.id);
                        setIsDetailModalOpen(false);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Duyệt
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleRejectClick(selectedPost.id);
                      }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Từ chối
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            <img
              src={lightboxImage}
              alt="Lightbox"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-lg text-white text-sm">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
