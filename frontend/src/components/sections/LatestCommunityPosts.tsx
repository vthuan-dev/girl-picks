'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { communityPostsApi, type CommunityPost } from '@/modules/community-posts/api/community-posts.api';
import CommunityPostCard from '@/components/community-posts/CommunityPostCard';

interface LatestCommunityPostsProps {
  limit?: number;
}

export default function LatestCommunityPosts({ limit = 6 }: LatestCommunityPostsProps) {
  const { isAuthenticated, user } = useAuthStore();
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ['community-posts', 'latest', page],
    async () => {
      const response = await communityPostsApi.getAll({
        status: 'APPROVED',
        page,
        limit: pageSize,
      });
      return response;
    },
    {
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (data) {
      setPosts((prev) => {
        const combined = page === 1 ? data.data : [...prev, ...data.data];
        // Sắp xếp theo thời gian tạo: bài tạo mới nhất nằm trên (mới nhất ở trên cùng)
        const sorted = [...combined].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return sorted;
      });
      setHasMore(data.data.length === pageSize);
    }
  }, [data, page, pageSize]);

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  const handleRefetch = () => {
    setPage(1);
    setPosts([]);
    refetch();
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-secondary/30 animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-32 bg-secondary/30 rounded animate-pulse" />
              <div className="h-3 w-40 bg-secondary/20 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/30"></div>
                <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error message instead of returning null
  if (error) {
    console.error('[LatestCommunityPosts] Error:', error);
    return (
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-text">Bài viết cộng đồng</h2>
              <p className="text-xs text-text-muted mt-0.5">Không thể tải dữ liệu</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8 text-text-muted">
          <p>Không thể tải bài viết. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  // Show empty state instead of returning null
  if (!isLoading && posts.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-text">
                Bài viết cộng đồng
              </h2>
              <p className="text-xs text-text-muted mt-0.5">Chia sẻ và kết nối với cộng đồng</p>
            </div>
          </div>
        </div>
        <div className="text-center py-8 text-text-muted">
          <p>Chưa có bài viết nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Simple icon */}
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
            </div>

            {/* Title */}
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-bold text-text">
                Bài viết cộng đồng
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Chia sẻ và kết nối với cộng đồng
              </p>
            </div>
          </div>

          {/* Badge showing post count */}
          {posts.length > 0 && (
            <div className="flex-shrink-0 hidden sm:flex items-center px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
              <span className="text-xs font-medium text-primary">
                {posts.length}
              </span>
            </div>
          )}
        </div>
      </div>
      {isAuthenticated && user?.role === 'CUSTOMER' && (
        <div className="mb-4">
          <Link
            href="/community-posts/create"
            className="relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-transparent text-primary text-sm font-semibold border border-primary/50 hover:bg-primary/10 hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group cursor-pointer"
          >
            {/* Glow ring */}
            <span className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
            <span className="relative flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 border border-primary/40 group-hover:bg-white/20 group-hover:border-white/40 transition-colors">
                <svg
                  className="w-3.5 h-3.5 text-primary group-hover:text-white group-hover:rotate-90 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span>Đăng bài cộng đồng</span>
            </span>
          </Link>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {posts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="px-4 py-2 text-sm rounded-lg border border-primary text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors"
          >
            {isFetching ? 'Đang tải...' : 'Xem thêm'}
          </button>
        </div>
      )}
    </div>
  );
}

