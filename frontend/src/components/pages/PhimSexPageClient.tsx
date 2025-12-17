'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/movies/MovieCard';
import Pagination from '@/components/common/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import { moviesApi, type Movie } from '@/modules/movies/api/movies.api';
import { categoriesApi, Category } from '@/modules/categories/api/categories.api';
import { Post } from '@/types/post';

interface MoviePost {
  id: string;
  title: string;
  thumbnail: string;
  duration: string | null;
  views: number;
  rating: string;
  detailUrl: string;
  category: string;
  poster: string;
}

export default function PhimSexPageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<MoviePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 24;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await moviesApi.getAll({
        status: 'APPROVED', // Only show approved movies
        page: currentPage,
        limit: itemsPerPage,
        categoryId: selectedCategory || undefined,
      });

      // Map movies to movie format
      const mappedPosts = (data.data || []).map((post: Movie) => {
        const thumbnail =
          post.thumbnail ||
          post.poster ||
          'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop';
        
        // Get category name from post.category relation or use default
        const categoryName = (post as any)?.category?.name || 'Khác';

        // Duration: lấy từ post.duration nếu có, format nếu là số giây
        let duration: string | null = null;
        const rawDuration = post.duration || (post as any)?.videoDuration;
        
        if (rawDuration) {
          // Nếu là số (giây), format thành MM:SS hoặc HH:MM:SS
          if (typeof rawDuration === 'number') {
            const hours = Math.floor(rawDuration / 3600);
            const minutes = Math.floor((rawDuration % 3600) / 60);
            const seconds = Math.floor(rawDuration % 60);
            
            if (hours > 0) {
              duration = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
              duration = `${minutes}:${String(seconds).padStart(2, '0')}`;
            }
          } else if (typeof rawDuration === 'string') {
            // Nếu đã là string format MM:SS hoặc HH:MM:SS, dùng trực tiếp
            duration = rawDuration;
          }
        }
        
        // Debug: log để kiểm tra API response nếu không có duration
        if (!duration && (post as any).videoUrl) {
          console.log('[PhimSexPageClient] Post without duration:', {
            id: post.id,
            title: post.title,
            videoUrl: post.videoUrl,
            rawDuration,
            availableFields: Object.keys(post),
          });
        }

        // Generate URL with slug (SEO-friendly)
        const detailUrl = post.slug 
          ? `/movies/${post.slug}`
          : `/movies/${post.id}`;

        return {
          id: post.id,
          title: post.title,
          thumbnail,
          duration,
          views: post.viewCount || 0,
          rating: (4 + Math.random()).toFixed(1),
          detailUrl,
          category: categoryName,
          poster: post.poster || thumbnail,
        };
      });

      setPosts(mappedPosts);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch movies:', error);
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: 'Phim sex',
          description: 'Xem phim sex chất lượng cao, phim sex tự quay, phim sex Nhật Bản, phim sex Việt Nam và nhiều thể loại khác',
          url: `${siteUrl}/phim-sex`,
          numberOfItems: total,
        }}
      />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Phim sex</h1>
              <p className="text-sm text-text-muted">
              {loading ? 'Đang tải...' : (
                <>Hiển thị {startIndex + 1} – {endIndex} / <span className="text-primary font-semibold">{total.toLocaleString('vi-VN')}</span> phim</>
                )}
              </p>
            </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="hidden sm:inline">Hiển thị</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-3 py-1.5 bg-background-light border border-secondary/50 rounded-lg hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              Tất cả
              </button>
          </div>
        </div>

        {/* Categories horizontal scroll */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-text">Danh mục</span>
            <span className="text-xs text-text-muted">Kéo ngang để xem thêm</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
            {categoriesLoading ? (
              <span className="text-text-muted text-sm">Đang tải...</span>
            ) : (
              categories.slice(0, 20).map((category) => (
                  <button
                    key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                    className={`
                    px-3 py-1.5 rounded-full text-xs sm:text-sm border transition-all cursor-pointer whitespace-nowrap
                    ${selectedCategory === category.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background-light text-text border-secondary/40 hover:border-primary/60 hover:text-primary'
                      }
                    `}
                  >
                  {category.name}
              </button>
              ))
            )}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-background-light border border-secondary/30 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full aspect-[4/5] bg-secondary/30"></div>
                <div className="p-3 space-y-2">
                      <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
                      <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
                    </div>
              </div>
            ))
            ) : posts.length === 0 ? (
            <div className="col-span-full text-center py-10 text-text-muted">Không tìm thấy phim</div>
            ) : (
            posts.map((post: any) => <MovieCard key={post.id} movie={post} />)
          )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
      </div>
    </>
  );
}

