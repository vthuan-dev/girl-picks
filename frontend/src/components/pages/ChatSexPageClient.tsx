'use client';

import { useState, useEffect } from 'react';
import ChatGirlCard from '@/components/chat/ChatGirlCard';
import Pagination from '@/components/common/Pagination';
import { postsApi } from '@/modules/posts/api/posts.api';
import { Post } from '@/types/post';

const hashtags = [
  'Tất cả',
  'Thủ dâm',
  'Dâm thuỷ',
  'Khẩu dâm',
  'Mông to',
  'Vú to',
  'Lồn non',
  'Sex toy',
  'Gái teen',
  'Mình dây',
  'Nhiều lông',
  'Cosplay',
  'Mũm mĩm',
  'Lỗ nhị',
  'Giao hợp',
  'Cạo lông',
  'Máy bay',
  'Cặp đôi',
  'Chơi some',
];

interface ChatPost {
  id: string;
  title: string;
  thumbnail: string;
  year: number;
  rating: number;
  reviews: number;
  views: number;
  views2: number;
  detailUrl: string;
}

export default function ChatSexPageClient() {
  const [selectedHashtag, setSelectedHashtag] = useState('Tất cả');
  const [posts, setPosts] = useState<ChatPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedHashtag]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postsApi.getAll({
        status: 'APPROVED', // Only show approved posts
        page: currentPage,
        limit: itemsPerPage,
      });

      // Map posts to chat girl format
      const mappedPosts = (data.data || []).map((post: Post) => {
        // Handle images - can be JSON string or array
        let images: string[] = [];
        if (post.images) {
          if (typeof post.images === 'string') {
            try {
              images = JSON.parse(post.images);
            } catch {
              images = [post.images];
            }
          } else if (Array.isArray(post.images)) {
            images = post.images;
          }
        }

        const thumbnail = images[0] || post.girl?.user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop';
        
        // Extract year from title or use default
        const yearMatch = post.title.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : 2003 + (Math.floor(Math.random() * 3));

        // Generate URL with slug if available
        const detailUrl = post.slug 
          ? `/posts/${post.id}/${post.slug}`
          : `/posts/${post.id}`;

        return {
          id: post.id,
          title: post.title,
          thumbnail,
          year,
          rating: 4.5 + Math.random() * 0.5, // Mock rating for now
          reviews: post._count?.comments || Math.floor(Math.random() * 50) + 5,
          views: post._count?.likes || Math.floor(Math.random() * 100000) + 20000,
          views2: post._count?.likes || Math.floor(Math.random() * 1000000) + 20000,
          detailUrl,
        };
      });

      setPosts(mappedPosts);
      setTotal((data as any).meta?.total || data.data?.length || 0);
    } catch (error) {
      console.error('Failed to fetch chat posts:', error);
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  // Reset to page 1 when hashtag changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedHashtag]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-text">
                Gái Chat
              </h1>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Đang Online
              </span>
            </div>
            <p className="text-sm text-text-muted">
              {loading ? (
                'Đang tải...'
              ) : (
                <>
                  Hiển thị {startIndex + 1} tới {endIndex} của <span className="text-primary font-semibold">{total.toLocaleString('vi-VN')}</span> Gái Chat
                </>
              )}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button className="px-3 lg:px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary transition-colors text-sm flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Lọc
            </button>
            <button className="px-3 lg:px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary transition-colors text-sm flex items-center gap-2 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Sắp xếp
            </button>
          </div>
        </div>
      </div>

      {/* Hashtags Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          <h2 className="text-sm font-bold text-text uppercase tracking-wide">
            Hashtags
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {hashtags.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => setSelectedHashtag(hashtag)}
              className={`
                group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold
                transition-all duration-300 cursor-pointer overflow-hidden
                ${
                  selectedHashtag === hashtag
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/40 transform scale-105 border-2 border-primary/80'
                    : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:transform hover:scale-105'
                }
              `}
            >
              {/* Shine effect on selected */}
              {selectedHashtag === hashtag && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
              
              {/* Hashtag icon for "Tất cả" */}
              {hashtag === 'Tất cả' && (
                <span className="inline-block mr-1.5">#</span>
              )}
              
              <span className="relative">{hashtag === 'Tất cả' ? hashtag : `#${hashtag}`}</span>
              
              {/* Active indicator */}
              {selectedHashtag === hashtag && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Girls Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-background-light border border-secondary/30 rounded-lg overflow-hidden animate-pulse">
              <div className="w-full aspect-video bg-secondary/30"></div>
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
                <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-text-muted mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-text-muted text-base sm:text-lg">Không tìm thấy gái chat</p>
          <p className="text-text-muted text-xs sm:text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {posts.map((post: any) => (
              <ChatGirlCard key={post.id} girl={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}

