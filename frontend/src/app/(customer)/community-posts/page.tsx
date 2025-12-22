'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { communityPostsApi, type CommunityPost } from '@/modules/community-posts/api/community-posts.api';
import CommunityPostCard from '@/components/community-posts/CommunityPostCard';
import toast from 'react-hot-toast';

const STATUS_TABS: Array<{ key: 'PENDING' | 'APPROVED' | 'REJECTED'; label: string }> = [
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Bị từ chối' },
];

export default function CommunityPostsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('APPROVED');

  const loadPosts = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await communityPostsApi.getMyPosts(statusFilter);
      // Phòng trường hợp API trả thêm bài khác, lọc lại theo author id
      const mineOnly = Array.isArray(response)
        ? response.filter((p) => p.author?.id === user.id)
        : [];
      setPosts(mineOnly);
    } catch (error: any) {
      toast.error('Không thể tải danh sách bài viết của bạn');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, user?.id]);

  const emptyCopy = (() => {
    switch (statusFilter) {
      case 'PENDING':
        return 'Chưa có bài chờ duyệt';
      case 'REJECTED':
        return 'Chưa có bài bị từ chối';
      default:
        return 'Chưa có bài viết nào';
    }
  })();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-text">Bài viết Cộng đồng</h1>
            <p className="text-sm text-text-muted">Bài của bạn với trạng thái chờ duyệt / đã duyệt / từ chối</p>
          </div>
          {isAuthenticated && (
            <Link
              href="/community-posts/create"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-md hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Đăng bài mới</span>
            </Link>
          )}
        </div>
      </div>

      {/* Status filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === tab.key
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-background border border-secondary/40 text-text hover:border-primary/50 hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-text-muted">Đang tải bài viết...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center border-2 border-primary/20">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text mb-2">{emptyCopy}</h3>
          <p className="text-text-muted mb-6 text-sm">Chưa có bài ở trạng thái này</p>
          {isAuthenticated && (
            <Link
              href="/community-posts/create"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-md hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Đăng bài</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

