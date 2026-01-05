'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import SmoothLink from '@/components/common/SmoothLink';
import Image from 'next/image';
import { communityPostsApi, type CommunityPost } from '@/modules/community-posts/api/community-posts.api';
import { getFullImageUrl } from '@/lib/utils/image';

interface GirlCommunityPostsProps {
  girlId: string;
  limit?: number;
}

export default function GirlCommunityPosts({ girlId, limit = 6 }: GirlCommunityPostsProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  const { data, isLoading, error } = useQuery(
    ['community-posts', 'girl', girlId],
    async () => {
      console.log('[GirlCommunityPosts] Fetching posts for girlId:', girlId);
      const response = await communityPostsApi.getAll({
        girlId,
        status: 'APPROVED',
        page: 1,
        limit,
      });
      console.log('[GirlCommunityPosts] API response:', response);
      console.log('[GirlCommunityPosts] Posts found:', response?.data?.length || 0);
      return response;
    },
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
      enabled: !!girlId,
    }
  );

  useEffect(() => {
    if (data?.data) {
      console.log('[GirlCommunityPosts] Setting posts:', data.data.length);
      setPosts(data.data);
    } else {
      console.log('[GirlCommunityPosts] No posts data, data:', data);
      setPosts([]);
    }
  }, [data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="mt-4 sm:mt-6">
        <h2 className="text-lg sm:text-xl font-bold text-text mb-3">Bài viết cộng đồng</h2>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-background-light border border-secondary/30 rounded-lg p-2 sm:p-3 animate-pulse">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-secondary/30 flex-shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-secondary/30 rounded w-2/3"></div>
                  <div className="h-3 bg-secondary/30 rounded w-full"></div>
                  <div className="h-2.5 bg-secondary/30 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Hiển thị section ngay cả khi không có bài viết (để debug)
  if (error) {
    console.error('[GirlCommunityPosts] Error:', error);
  }

  // Nếu không có bài viết, vẫn hiển thị section với empty state
  if (!isLoading && (!posts || posts.length === 0)) {
    return (
      <div className="mt-4 sm:mt-6">
        <h2 className="text-lg sm:text-xl font-bold text-text mb-3">Bài viết cộng đồng</h2>
        <div className="bg-background-light border border-secondary/30 rounded-lg p-4 text-center">
          <p className="text-text-muted text-sm">Chưa có bài viết cộng đồng nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-text">Bài viết cộng đồng</h2>
        {posts.length >= limit && (
          <SmoothLink
            href={`/community-posts?girlId=${girlId}`}
            className="text-xs sm:text-sm text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Xem thêm →
          </SmoothLink>
        )}
      </div>

      <div className="space-y-2">
        {posts.map((post) => {
          const firstImage = post.images && post.images.length > 0 ? post.images[0] : null;
          const postUrl = `/community-posts/${post.id}`;

          return (
            <SmoothLink
              key={post.id}
              href={postUrl}
              className="block group"
            >
              <div className="bg-background-light border border-secondary/30 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200">
                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3">
                  {/* Image - Compact */}
                  {firstImage ? (
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                      <Image
                        src={getFullImageUrl(firstImage)}
                        alt="Bài viết"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="80px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/logo/logo.png';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-secondary/20 flex-shrink-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Content - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-text line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
                      {truncateText(post.content, 80)}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-text-muted">
                      <span>{post.author?.fullName || 'Ẩn danh'}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      {(post._count?.likes || 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            {post._count?.likes || 0}
                          </span>
                        </>
                      )}
                      {(post._count?.comments || 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {post._count?.comments || 0}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SmoothLink>
          );
        })}
      </div>
    </div>
  );
}

