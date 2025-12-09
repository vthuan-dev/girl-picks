'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Post, VideoSource } from '@/types/post';
import VideoPlayer from './VideoPlayer';
import PostComments from './PostComments';

interface PostDetailClientProps {
  post: Post;
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const [selectedVideoSource, setSelectedVideoSource] = useState<VideoSource | null>(null);

  // Parse video sources
  const videoSources: VideoSource[] = useMemo(() => {
    if (!post.videoSources) return [];
    try {
      const parsed = typeof post.videoSources === 'string' 
        ? JSON.parse(post.videoSources) 
        : post.videoSources;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [post.videoSources]);

  // Parse images
  const images: string[] = useMemo(() => {
    if (!post.images) return [];
    try {
      const parsed = typeof post.images === 'string' 
        ? JSON.parse(post.images) 
        : post.images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [post.images]);

  // Parse tags
  const tags: string[] = useMemo(() => {
    if (!post.tags) return [];
    try {
      const parsed = typeof post.tags === 'string' 
        ? JSON.parse(post.tags) 
        : post.tags;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [post.tags]);

  // Get main video URL
  const mainVideoUrl = selectedVideoSource?.url || post.videoUrl || videoSources[0]?.url || '';

  // Get poster/thumbnail
  const posterUrl = post.poster || post.thumbnail || images[0] || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=630&fit=crop';

  // Handle video source change
  const handleSourceChange = (source: VideoSource | null) => {
    setSelectedVideoSource(source);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6">
      {/* Left Column - Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Video Player Section - Centered & Compact */}
        {mainVideoUrl && (
          <div className="flex flex-col items-center">
            {/* Title - Above Video */}
            <div className="w-full max-w-3xl mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-text text-center leading-tight">
                {post.title}
              </h1>
            </div>

            {/* Video Player Container */}
            <div className="w-full max-w-3xl bg-background-light/50 backdrop-blur-sm rounded-xl overflow-hidden border border-secondary/20 shadow-2xl">
              <VideoPlayer
                videoUrl={mainVideoUrl}
                videoSources={videoSources}
                poster={posterUrl}
                onSourceChange={handleSourceChange}
              />
            </div>

            {/* Meta Info Bar - Below Video */}
            <div className="w-full max-w-3xl mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              {post.category && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 text-primary rounded-lg text-xs font-semibold border border-primary/20 transition-colors duration-200 hover:bg-primary/20 cursor-default">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{typeof post.category === 'string' ? post.category : post.category?.name}</span>
                </div>
              )}
              
              {post.duration && (
                <div className="flex items-center gap-2 text-text-muted">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{post.duration}</span>
                </div>
              )}
              
              {post.viewCount !== undefined && (
                <div className="flex items-center gap-2 text-text-muted">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm">{post.viewCount.toLocaleString('vi-VN')} lượt xem</span>
                </div>
              )}
              
              {post.rating && (
                <div className="flex items-center gap-1.5 text-text-muted">
                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-text">{post.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Tags - Below Meta Info */}
            {tags.length > 0 && (
              <div className="w-full max-w-3xl mt-3 flex flex-wrap gap-2 justify-center">
                {tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/phim-sex?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1.5 bg-background-light/60 hover:bg-primary/15 text-text-muted hover:text-primary rounded-lg text-xs font-medium border border-secondary/30 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description Section */}
        {post.content && (
          <div className="bg-background-light/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-secondary/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <h2 className="text-xl font-bold text-text">Mô tả</h2>
            </div>
            <div className="prose prose-invert max-w-none">
              <p className="text-text-muted leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {post.content}
              </p>
            </div>
          </div>
        )}

        {/* Images Gallery */}
        {images.length > 0 && (
          <div className="bg-background-light/50 backdrop-blur-sm rounded-xl p-5 sm:p-6 border border-secondary/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-bold text-text">Hình ảnh</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className="relative aspect-video rounded-lg overflow-hidden border border-secondary/20 hover:border-primary/40 transition-all duration-200 cursor-pointer group"
                >
                  <Image
                    src={image}
                    alt={`${post.title} - Hình ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <PostComments postId={post.id} initialCount={post._count?.comments || 0} />
      </div>

      {/* Right Column - Sidebar */}
      <div className="lg:w-80 flex-shrink-0 space-y-6">
        {/* Author/Girl Info Card */}
        {(post.author || post.girl) && (
          <div className="bg-background-light/50 backdrop-blur-sm rounded-xl p-5 border border-secondary/20 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-text">Thông tin</h3>
            </div>
            
            {post.girl?.user && (
              <div className="mb-4 pb-4 border-b border-secondary/20">
                <p className="text-xs text-text-muted mb-2 uppercase tracking-wide font-semibold">Gái gọi</p>
                <Link 
                  href={`/girls/${post.girl.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-light transition-colors duration-200 cursor-pointer group"
                >
                  {post.girl.user.avatarUrl && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary/30 group-hover:border-primary/50 transition-colors duration-200 flex-shrink-0">
                      <Image
                        src={post.girl.user.avatarUrl}
                        alt={post.girl.user.fullName || 'Avatar'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="font-semibold text-text group-hover:text-primary transition-colors duration-200">
                    {post.girl.user.fullName}
                  </span>
                </Link>
              </div>
            )}
            
            {post.author && (
              <div>
                <p className="text-xs text-text-muted mb-2 uppercase tracking-wide font-semibold">Người đăng</p>
                <div className="flex items-center gap-3 p-2 rounded-lg">
                  {post.author.avatarUrl && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-secondary/30 flex-shrink-0">
                      <Image
                        src={post.author.avatarUrl}
                        alt={post.author.fullName || 'Avatar'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <span className="font-semibold text-text">{post.author.fullName}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Card */}
        <div className="bg-background-light/50 backdrop-blur-sm rounded-xl p-5 border border-secondary/20 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-bold text-text">Thống kê</h3>
          </div>
          <div className="space-y-3">
            {post.viewCount !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-background-light/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Lượt xem</span>
                </div>
                <span className="font-semibold text-text">{post.viewCount.toLocaleString('vi-VN')}</span>
              </div>
            )}
            {post._count?.likes !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-background-light/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Lượt thích</span>
                </div>
                <span className="font-semibold text-text">{post._count.likes.toLocaleString('vi-VN')}</span>
              </div>
            )}
            {post._count?.comments !== undefined && (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-background-light/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Bình luận</span>
                </div>
                <span className="font-semibold text-text">{post._count.comments.toLocaleString('vi-VN')}</span>
              </div>
            )}
            {post.createdAt && (
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-background-light/50 transition-colors duration-200">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Ngày đăng</span>
                </div>
                <span className="font-semibold text-text text-sm">
                  {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
