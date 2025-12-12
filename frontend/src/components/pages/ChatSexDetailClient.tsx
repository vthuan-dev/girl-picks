'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { chatSexApi, ChatSexGirl } from '@/modules/chat-sex/api/chat-sex.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatSexDetailClientProps {
  id: string;
}

export default function ChatSexDetailClient({ id }: ChatSexDetailClientProps) {
  const router = useRouter();
  const [girl, setGirl] = useState<ChatSexGirl | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGirl();
  }, [id]);

  const fetchGirl = async () => {
    setLoading(true);
    try {
      const data = await chatSexApi.getById(id);
      setGirl(data);
      
      // Increment view count
      await chatSexApi.incrementView(id);
    } catch (error: any) {
      console.error('Failed to fetch chat sex girl:', error);
      toast.error('Không tìm thấy gái chat');
      router.push('/chat-sex');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-secondary/30 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-secondary/30 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-secondary/30 rounded w-3/4"></div>
                <div className="h-4 bg-secondary/30 rounded w-full"></div>
                <div className="h-4 bg-secondary/30 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!girl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-lg">Không tìm thấy gái chat</p>
        </div>
      </div>
    );
  }

  // Parse images
  let images: string[] = [];
  if (girl.images) {
    if (Array.isArray(girl.images)) {
      images = girl.images;
    } else if (typeof girl.images === 'string') {
      try {
        images = JSON.parse(girl.images);
      } catch {
        images = [girl.images];
      }
    }
  }

  const mainImage = girl.coverImage || images[0] || '/images/placeholder.jpg';
  const currentImage = images[currentImageIndex] || mainImage;

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-background-light border-b border-secondary/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-text-muted">
            <button
              onClick={() => router.push('/')}
              className="hover:text-primary transition-colors"
            >
              Trang chủ
            </button>
            <span>/</span>
            <button
              onClick={() => router.push('/chat-sex')}
              className="hover:text-primary transition-colors"
            >
              Chat Sex
            </button>
            <span>/</span>
            <span className="text-text">{girl.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-background-light rounded-xl overflow-hidden border border-secondary/30 shadow-lg">
              <Image
                src={currentImage}
                alt={girl.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg z-10"
                  >
                    <svg
                      className="w-6 h-6 text-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg z-10"
                  >
                    <svg
                      className="w-6 h-6 text-text"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-text shadow-lg z-10">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.slice(0, 8).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-secondary/30 hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${girl.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            {girl.bio && (
              <div className="bg-background-light rounded-xl p-6 border border-secondary/30">
                <h3 className="text-lg font-bold text-text mb-3">Mô tả</h3>
                <p className="text-text-muted leading-relaxed whitespace-pre-line">
                  {girl.bio}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <div className="bg-background-light rounded-xl p-6 border border-secondary/30 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-text pr-4">
                  {girl.name}
                </h1>
                {girl.isVerified && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30 flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Đã xác thực
                  </span>
                )}
              </div>

              {girl.title && girl.title !== girl.name && (
                <p className="text-text-muted text-sm mb-4">{girl.title}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-secondary/30">
                {girl.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-text font-semibold">
                      {girl.rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-text-muted text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>{girl.viewCount.toLocaleString('vi-VN')} lượt xem</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                {girl.phone && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-secondary/30">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-1">Số điện thoại</p>
                      <a
                        href={`tel:${girl.phone}`}
                        className="text-text font-semibold hover:text-primary transition-colors break-all"
                      >
                        {girl.phone}
                      </a>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(girl.phone!);
                        toast.success('Đã copy số điện thoại');
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {girl.zalo && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-secondary/30">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-1">Zalo</p>
                      <p className="text-text font-semibold break-all">
                        {girl.zalo}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(girl.zalo!);
                        toast.success('Đã copy Zalo');
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {girl.telegram && (
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-secondary/30">
                    <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.89 8.908c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.214-.054-.334-.373-.12l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted mb-1">Telegram</p>
                      <p className="text-text font-semibold break-all">
                        {girl.telegram}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(girl.telegram!);
                        toast.success('Đã copy Telegram');
                      }}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Price & Services */}
              {(girl.price || (girl.services && girl.services.length > 0)) && (
                <div className="mt-6 pt-6 border-t border-secondary/30 space-y-4">
                  {girl.price && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Giá</p>
                      <p className="text-xl font-bold text-primary">{girl.price}</p>
                    </div>
                  )}

                  {girl.services && girl.services.length > 0 && (
                    <div>
                      <p className="text-xs text-text-muted mb-2">Dịch vụ</p>
                      <div className="flex flex-wrap gap-2">
                        {girl.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium border border-primary/20"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {girl.workingHours && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Giờ làm việc</p>
                      <p className="text-text font-medium">{girl.workingHours}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              {(girl.location || girl.province) && (
                <div className="mt-6 pt-6 border-t border-secondary/30">
                  <p className="text-xs text-text-muted mb-2">Địa điểm</p>
                  <div className="flex items-center gap-2 text-text">
                    <svg
                      className="w-5 h-5 text-text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{girl.location || girl.province}</span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {girl.tags && girl.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-secondary/30">
                  <p className="text-xs text-text-muted mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {girl.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-background text-text-muted rounded-lg text-xs border border-secondary/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {girl.phone && (
                <a
                  href={`tel:${girl.phone}`}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Gọi ngay
                </a>
              )}
              {girl.zalo && (
                <button
                  onClick={() => {
                    window.open(`https://zalo.me/${girl.zalo}`, '_blank');
                  }}
                  className="w-full px-6 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all border border-blue-500/30"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                  Chat Zalo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

