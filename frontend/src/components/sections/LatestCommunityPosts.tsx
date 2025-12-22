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
      console.log('[LatestCommunityPosts] Data received:', data);
      setPosts((prev) => {
        const newPosts = page === 1 ? data.data : [...prev, ...data.data];
        console.log('[LatestCommunityPosts] Posts set:', newPosts.length);
        return newPosts;
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Bài viết cộng đồng</h2>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Bài viết cộng đồng</h2>
        </div>
        <div className="text-center py-8 text-text-muted">
          <p>Không thể tải bài viết. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  // Show empty state instead of returning null
  if (!isLoading && posts.length === 0) {
    console.log('[LatestCommunityPosts] No posts found');
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text">Bài viết cộng đồng</h2>
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
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="text-lg font-bold text-text whitespace-nowrap">Bài viết cộng đồng</h2>
        <Link
          href="/community-posts"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <span>Xem tất cả</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      {isAuthenticated && user?.role === 'CUSTOMER' && (
        <div className="mb-4">
          <Link
            href="/community-posts/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all duration-200 font-medium cursor-pointer text-sm border border-white/10 shadow-primary/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Đăng bài</span>
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

