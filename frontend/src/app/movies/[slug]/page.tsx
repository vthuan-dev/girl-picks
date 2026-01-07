import type { Metadata } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { moviesApi } from '@/modules/movies/api/movies.api';
import VideoPlayer from '@/components/posts/VideoPlayer';
import MovieReviewSection from '@/components/movies/MovieReviewSection';
import MovieViewTracker from '@/components/movies/MovieViewTracker';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const movie = await moviesApi.getBySlug(slug);
    return {
      title: movie.title || 'Phim sex',
      description: movie.description || 'Xem phim sex chất lượng cao',
    };
  } catch {
    return {
      title: 'Phim không tìm thấy',
    };
  }
}

export default async function MovieDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let movie = null;
  try {
    movie = await moviesApi.getBySlug(slug);
  } catch (error) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <p className="text-text-muted">Không tìm thấy phim.</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <p className="text-text-muted">Không tìm thấy phim.</p>
      </div>
    );
  }

  const createdAt = movie.createdAt ? new Date(movie.createdAt) : null;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-16 sm:pt-18 lg:pt-20 pb-8 sm:pb-10 space-y-6">
      {/* Increment view count on mount */}
      <MovieViewTracker movieId={movie.id} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-text-muted">
        <Link
          href="/phim-sex"
          className="hover:text-primary transition-colors"
        >
          Phim sex
        </Link>
        <span className="text-secondary/60">/</span>
        <span className="line-clamp-1 text-text">{movie.title}</span>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text leading-tight">
          {movie.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-text-muted">
          {movie.category?.name && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
              {movie.category.name}
            </span>
          )}
          {movie.duration && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background-light border border-secondary/40">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {movie.duration}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-background-light border border-secondary/40">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {movie.viewCount?.toLocaleString('vi-VN') || 0} lượt xem
          </span>
          {createdAt && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 19h14M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4" />
              </svg>
              {format(createdAt, 'dd/MM/yyyy HH:mm', { locale: vi })}
            </span>
          )}
        </div>
      </div>

      {/* Video + Info layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-5 items-start">
        <div className="bg-background-light rounded-3xl border border-secondary/40 shadow-2xl shadow-black/30 p-3 sm:p-4">
          <div className="rounded-2xl overflow-hidden bg-black">
            <VideoPlayer
              videoUrl={movie.videoUrl}
              poster={movie.poster || movie.thumbnail || undefined}
              videoSources={[]}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-5 shadow-sm shadow-black/10 space-y-3 text-sm">
            <h3 className="text-sm font-semibold text-text mb-1">Thông tin phim</h3>
            {movie.duration && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Thời lượng</span>
                <span className="font-medium text-text">{movie.duration}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Lượt xem</span>
              <span className="font-medium text-text">{movie.viewCount?.toLocaleString('vi-VN') || 0}</span>
            </div>
            {movie.category?.name && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Danh mục</span>
                <span className="font-medium text-text">{movie.category.name}</span>
              </div>
            )}
            {createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Ngày đăng</span>
                <span className="font-medium text-text">
                  {format(createdAt, 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {movie.description && (
        <div className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-5 shadow-sm shadow-black/10">
          <h2 className="text-base sm:text-lg font-semibold text-text mb-2">Mô tả</h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed whitespace-pre-line">
            {movie.description}
          </p>
        </div>
      )}

      {/* Reviews */}
      <MovieReviewSection movieId={movie.id} movieTitle={movie.title} />
    </div>
  );
}



