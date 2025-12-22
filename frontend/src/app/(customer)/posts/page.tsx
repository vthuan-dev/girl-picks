'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { postsApi } from '@/modules/posts/api/posts.api';
import { Post } from '@/types/post';
import { useAuthStore } from '@/store/auth.store';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CustomerPostsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadPosts = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const response = await postsApi.getMyPosts(status);
      if (Array.isArray(response)) {
        setPosts(response);
      } else if (response?.data) {
        setPosts(Array.isArray(response.data) ? response.data : []);
      } else {
        setPosts([]);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách bài đăng');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }
    loadPosts();
  }, [loadPosts, isAuthenticated, user, router]);

  const handleDelete = useCallback(async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await postsApi.delete(postId);
      toast.success('Xóa bài viết thành công');
      loadPosts();
    } catch (error: any) {
      toast.error('Không thể xóa bài viết');
    }
  }, [loadPosts]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Từ chối' },
    };
    const badge = badges[status];
    if (!badge) return null;
    return (
      <span className={`px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Bài đăng của tôi</h1>
          <p className="text-text-muted mt-1">Quản lý các bài viết bạn đã đăng</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/community-posts/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all duration-200 font-medium cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span>Đăng bài cộng đồng</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === filter
                ? 'bg-primary text-white shadow-md'
                : 'bg-background-light border border-secondary/30 text-text hover:border-primary/50'
            }`}
          >
            {filter === 'all' ? 'Tất cả' : filter === 'PENDING' ? 'Chờ duyệt' : filter === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-12 text-center">
          <div className="flex items-center justify-center gap-2 text-text-muted">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tải...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-12 text-center">
          <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-text-muted mb-4">Bạn chưa có bài đăng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-background-light rounded-xl border border-secondary/30 p-4 sm:p-5 hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                {post.images?.[0] && (
                  <img src={post.images[0]} alt={post.title} className="w-full sm:w-28 h-28 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text line-clamp-1">{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p className="text-text-muted text-sm mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                    {post._count && (
                      <>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {post._count.likes || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {post._count.comments || 0}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {post.status === 'PENDING' && (
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="self-start px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}