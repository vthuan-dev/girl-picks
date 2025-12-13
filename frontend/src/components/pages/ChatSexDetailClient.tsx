'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { chatSexApi, ChatSexGirl } from '@/modules/chat-sex/api/chat-sex.api';
import toast from 'react-hot-toast';
import ReviewSection from '@/components/chat/ReviewSection';

interface ChatSexDetailClientProps {
  id: string;
}

export default function ChatSexDetailClient({ id }: ChatSexDetailClientProps) {
  const router = useRouter();
  const [girl, setGirl] = useState<ChatSexGirl | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

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

  // Parse videos
  let videos: any[] = [];
  if (girl.videos) {
    if (Array.isArray(girl.videos)) {
      videos = girl.videos;
    } else if (typeof girl.videos === 'string') {
      try {
        videos = JSON.parse(girl.videos);
      } catch {
        videos = [];
      }
    }
  }

  // Parse tags/services
  let tags: string[] = [];
  if (girl.tags) {
    if (Array.isArray(girl.tags)) {
      tags = girl.tags;
    } else if (typeof girl.tags === 'string') {
      try {
        tags = JSON.parse(girl.tags);
      } catch {
        tags = [];
      }
    }
  }

  let services: string[] = [];
  if (girl.services) {
    if (Array.isArray(girl.services)) {
      services = girl.services;
    } else if (typeof girl.services === 'string') {
      try {
        services = JSON.parse(girl.services);
      } catch {
        services = [];
      }
    }
  }

  const mainImage = girl.coverImage || images[0] || '/images/placeholder.jpg';
  const currentImage = images[currentImageIndex] || mainImage;

  // Clean title by removing promotional text
  const cleanTitle = (title: string) => {
    if (!title) return title;

    // Remove common promotional patterns
    return title
      .replace(/\s*-\s*vào\s+gaigu\.link\s+khi\s+bị\s+chặn/gi, '')
      .replace(/\s*-\s*v[aà]o\s+[^\s]+\.link\s+khi\s+b[ịi]\s+ch[ặa]n/gi, '')
      .replace(/\s*vào\s+gaigu\.link\s+khi\s+bị\s+chặn\s*-?\s*/gi, '')
      .trim();
  };

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
        <div className="row main-content-escort">
          <div className="content-left mt-2 mb-3 pd-0">
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                {girl.name}
              </h1>
              {girl.title && (
                <p className="text-text-muted text-sm">{cleanTitle(girl.title)}</p>
              )}
            </div>

            {/* Video/Image Section */}
            <div className="col-md-12 pd-0 desk-photo mb-3">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowVideo(false)}
                  className={`px-4 py-2 rounded ${!showVideo
                    ? 'bg-primary text-white'
                    : 'bg-background-light text-text-muted hover:bg-secondary/30'
                    } transition-colors`}
                >
                  Click xem ảnh
                </button>
                {videos.length > 0 && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`px-4 py-2 rounded ${showVideo
                      ? 'bg-primary text-white'
                      : 'bg-background-light text-text-muted hover:bg-secondary/30'
                      } transition-colors`}
                  >
                    Click xem video
                  </button>
                )}
              </div>

              {/* Main Display Area */}
              <div className="col-md-12 pd-0 desk-video pl-vid">
                <div className="video-container relative aspect-video bg-background-light rounded-lg overflow-hidden border border-secondary/30">
                  {showVideo && videos.length > 0 ? (
                    <video
                      controls
                      className="w-full h-full object-cover"
                      poster={currentImage}
                    >
                      {videos.map((video: any, idx: number) => {
                        const src = typeof video === 'string' ? video : video.src;
                        return (
                          <source
                            key={idx}
                            src={src}
                            type="video/mp4"
                          />
                        );
                      })}
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="relative w-full h-full">
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
                  )}
                </div>
              </div>

              {/* Thumbnail Grid */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentImageIndex(idx);
                        setShowVideo(false);
                      }}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx && !showVideo
                        ? 'border-primary shadow-lg'
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
            </div>

            {/* Thông tin cơ bản */}
            <div className="col-md-12 attributes mt-4">
              <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden">
                <div className="bg-primary/10 px-4 py-3 border-b border-secondary/30">
                  <h2 className="text-lg font-bold text-text">Thông tin cơ bản</h2>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-4 py-2 border-b border-secondary/30">
                  <p className="text-sm">
                    Gái tráo hàng hay quỵt tiền báo telegram{' '}
                    {girl.telegram && (
                      <a
                        href={`https://t.me/${girl.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="nofollow"
                        className="text-blue-500 hover:underline"
                      >
                        {girl.telegram}
                      </a>
                    )}
                  </p>
                </div>

                <div className="p-4 space-y-3">
                  {/* Giá 15 phút */}
                  {girl.price15min && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Giá 15 phút</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-semibold">{girl.price15min}</p>
                      </div>
                    </div>
                  )}

                  {/* Thể loại */}
                  {tags.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Thể loại</p>
                      </div>
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium border border-primary/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Thanh toán */}
                  {girl.paymentInfo && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Thanh toán</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-medium">{girl.paymentInfo}</p>
                      </div>
                    </div>
                  )}

                  {/* Zalo */}
                  {girl.zalo && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Zalo</p>
                      </div>
                      <div className="col-span-3">
                        <a
                          href={`tel:${girl.zalo}`}
                          className="text-primary hover:underline flex items-center gap-2"
                        >
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {girl.zalo}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Năm sinh */}
                  {girl.birthYear && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Năm sinh</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-medium">{girl.birthYear}</p>
                      </div>
                    </div>
                  )}

                  {/* Chiều cao */}
                  {girl.height && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Chiều cao</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-medium">{girl.height}</p>
                      </div>
                    </div>
                  )}

                  {/* Cân nặng */}
                  {girl.weight && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Cân nặng</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-medium">{girl.weight}</p>
                      </div>
                    </div>
                  )}

                  {/* Làm việc */}
                  {girl.workingHours && (
                    <div className="grid grid-cols-4 gap-4 py-2 border-b border-secondary/20">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Làm việc</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-medium">{girl.workingHours}</p>
                      </div>
                    </div>
                  )}

                  {/* Hướng dẫn */}
                  {girl.instruction && (
                    <div className="grid grid-cols-4 gap-4 py-2">
                      <div className="col-span-1">
                        <p className="text-text-muted text-sm">Hướng dẫn</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-text font-medium">{girl.instruction}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {girl.bio && (
              <div className="mt-4 bg-background-light rounded-lg p-6 border border-secondary/30">
                <h3 className="text-lg font-bold text-text mb-3">Mô tả</h3>
                <p className="text-text-muted leading-relaxed whitespace-pre-line">
                  {girl.bio}
                </p>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewSection girlId={id} girlName={girl.name} />
          </div>

          {/* Right Column - Contact & Actions */}
          <div className="mt-6 lg:mt-0 lg:col-span-1 space-y-4">
            {/* Contact Card */}
            <div className="bg-background-light rounded-xl p-6 border border-secondary/30 shadow-lg">
              <h3 className="text-lg font-bold text-text mb-4">Liên hệ</h3>

              {/* Phone */}
              {girl.phone && (
                <div className="mb-4">
                  <a
                    href={`tel:${girl.phone}`}
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all mb-3"
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
                  <p className="text-sm text-text-muted text-center">
                    {girl.phone}
                  </p>
                </div>
              )}

              {/* Zalo */}
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

              {/* Telegram */}
              {girl.telegram && (
                <button
                  onClick={() => {
                    const telegramId = girl.telegram?.replace('@', '') || '';
                    window.open(`https://t.me/${telegramId}`, '_blank');
                  }}
                  className="w-full px-6 py-3 bg-blue-400/10 text-blue-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-400/20 transition-all border border-blue-400/30 mt-3"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.89 8.908c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.214-.054-.334-.373-.12l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                  Telegram
                </button>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-secondary/30 space-y-3">
                {girl.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Đánh giá</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-lg">★</span>
                      <span className="text-text font-semibold">
                        {girl.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Lượt xem</span>
                  <span className="text-text font-semibold">
                    {girl.viewCount.toLocaleString('vi-VN')}
                  </span>
                </div>
                {girl.isVerified && (
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/30">
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
                    <span className="text-sm font-semibold">Đã xác thực</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
