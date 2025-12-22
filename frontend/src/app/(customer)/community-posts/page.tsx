'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { communityPostsApi, type CommunityPost } from '@/modules/community-posts/api/community-posts.api';
import CommunityPostCard from '@/components/community-posts/CommunityPostCard';
import toast from 'react-hot-toast';

export default function CommunityPostsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const response = await communityPostsApi.getAll({
        status: 'APPROVED',
        page,
        limit: 10,
      });
      setPosts((prev) => (page === 1 ? response.data : [...prev, ...response.data]));
      setHasMore(response.data.length === 10);
    } catch (error: any) {
      toast.error('Không thể tải danh sách bài viết');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-text">Bài viết Cộng đồng</h1>
            <p className="text-sm text-text-muted">Chia sẻ và khám phá những bài viết từ cộng đồng</p>
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

      {/* Posts List */}
      {isLoading && page === 1 ? (
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
          <h3 className="text-lg font-semibold text-text mb-2">Chưa có bài viết nào</h3>
          <p className="text-text-muted mb-6 text-sm">Hãy là người đầu tiên chia sẻ với cộng đồng</p>
          {isAuthenticated && (
            <Link
              href="/community-posts/create"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium shadow-md hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Đăng bài đầu tiên</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {posts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
                className="px-6 py-3 bg-background-light border border-secondary/30 text-text rounded-lg hover:border-primary/50 hover:bg-background transition-all font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Đang tải...
                  </span>
                ) : (
                  'Tải thêm bài viết'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

