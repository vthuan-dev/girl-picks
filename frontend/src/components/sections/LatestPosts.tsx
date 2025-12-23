'use client';

import { useQuery } from 'react-query';
import Image from 'next/image';
import Link from 'next/link';
import { postsApi } from '@/modules/posts/api/posts.api';

interface Post {
  id: string;
  title: string;
  content: string;
  images?: string[];
  author?: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    role: string;
  };
  girl?: {
    id: string;
    name: string;
    slug?: string;
    images?: string[];
  };
  viewCount?: number;
  likeCount?: number;
  _count?: {
    likes: number;
    comments: number;
  };
  createdAt: string;
}

export default function LatestPosts() {
  const { data, isLoading, error } = useQuery(
    ['posts', 'latest'],
    async () => {
      const response = await postsApi.getAll({ limit: 6, status: 'APPROVED' });
      return response;
    },
    {
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold text-text">Bài viết mới nhất</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-background-light rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-video bg-secondary/30"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
                <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.data?.length) {
    return null;
  }

  const posts = data.data as Post[];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold text-text">Bài viết mới nhất</h2>
        </div>
        <Link
          href="/posts"
          className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          Xem tất cả
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

// Helper to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function PostCard({ post }: { post: Post }) {
  const imageUrl = post.images?.[0] || post.girl?.images?.[0] || '/placeholder-post.jpg';
  const girlUrl = post.girl?.slug
    ? `/girls/${post.girl.id}/${post.girl.slug}`
    : `/girls/${post.girl?.id}`;

  // Create SEO-friendly URL
  const postSlug = createSlug(post.title);
  const postUrl = `/posts/${post.id}/${postSlug}`;

  return (
    <div className="group bg-background-light rounded-lg overflow-hidden border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
      {/* Image */}
      <Link href={postUrl} className="block relative aspect-video overflow-hidden">
        <Image
          src={imageUrl}
          alt={post.title || 'Bài viết'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={postUrl}>
          <h3 className="font-semibold text-text group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {post.title}
          </h3>
        </Link>

        {/* Author/Girl Info */}
        <div className="flex items-center gap-2 mb-3">
          {post.author ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.fullName || 'Tác giả'}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {post.author.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-text font-medium line-clamp-1">
                  {post.author.fullName}
                </span>
                {post.author.role && (
                  <span className="text-xs text-text-muted">
                    {post.author.role === 'GIRL' ? 'Gái gọi' : post.author.role === 'STAFF_UPLOAD' ? 'Staff' : 'Thành viên'}
                  </span>
                )}
              </div>
            </div>
          ) : post.girl ? (
            <Link href={girlUrl} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary/30">
                {post.girl.images?.[0] && (
                  <Image
                    src={post.girl.images[0]}
                    alt={post.girl.name || 'Gái gọi'}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                )}
              </div>
              <span className="text-sm text-text-muted hover:text-primary transition-colors">
                {post.girl.name}
              </span>
            </Link>
          ) : null}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          {(post.viewCount !== undefined || post.viewCount === 0) && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {(post.viewCount || 0).toLocaleString('vi-VN')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {(post._count?.likes || post.likeCount || 0).toLocaleString('vi-VN')}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {(post._count?.comments || 0).toLocaleString('vi-VN')}
          </span>
          <span className="ml-auto">
            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>
    </div>
  );
}