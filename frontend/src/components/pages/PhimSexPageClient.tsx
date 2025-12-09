'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/movies/MovieCard';
import Pagination from '@/components/common/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import PopularTags from '@/components/sections/PopularTags';
import { postsApi } from '@/modules/posts/api/posts.api';
import { categoriesApi, Category } from '@/modules/categories/api/categories.api';
import { Post } from '@/types/post';

interface MoviePost {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
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
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 24;
  const categoriesToShow = 15; // Số categories hiển thị ban đầu

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
      const data = await postsApi.getAll({
        status: 'APPROVED', // Only show approved posts
        page: currentPage,
        limit: itemsPerPage,
        categoryId: selectedCategory || undefined,
      });

      // Map posts to movie format
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

        const thumbnail = images[0] || post.girl?.user?.avatarUrl || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop';
        
        // Get category name from post.category relation or use default
        const categoryName = (post.category as any)?.name || 'Khác';

        // Mock duration
        const duration = `${Math.floor(Math.random() * 30) + 10}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

        // Generate URL with slug if available
        const detailUrl = post.slug 
          ? `/posts/${post.id}/${post.slug}`
          : `/posts/${post.id}`;

        return {
          id: post.id,
          title: post.title,
          thumbnail,
          duration,
          views: post._count?.likes || Math.floor(Math.random() * 50000) + 10000,
          rating: (4 + Math.random()).toFixed(1),
          detailUrl,
          category: categoryName,
          poster: images[1] || thumbnail,
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                Phim sex
              </h1>
              <p className="text-sm text-text-muted">
                {loading ? (
                  'Đang tải...'
                ) : (
                  <>
                    Hiển thị {startIndex + 1} tới {endIndex} của <span className="text-primary font-semibold">{total.toLocaleString('vi-VN')}</span> phim
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

        {/* Category Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-text uppercase tracking-wide">
              Danh mục
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {/* "Tất cả" button */}
              <button
              onClick={() => setSelectedCategory(null)}
                className={`
                  group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold
                  transition-all duration-300 cursor-pointer overflow-hidden
                  ${
                  selectedCategory === null
                      ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/40 transform scale-105 border-2 border-primary/80'
                      : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:transform hover:scale-105'
                  }
                `}
              >
              {selectedCategory === null && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                  <span className="inline-block mr-1.5">🎬</span>
              <span className="relative">Tất cả</span>
              {selectedCategory === null && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
                
            {/* Category buttons from API */}
            {categoriesLoading ? (
              <div className="text-text-muted text-sm">Đang tải danh mục...</div>
            ) : (
              <>
                {(showAllCategories ? categories : categories.slice(0, categoriesToShow)).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold
                      transition-all duration-300 cursor-pointer overflow-hidden
                      ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/40 transform scale-105 border-2 border-primary/80'
                          : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:transform hover:scale-105'
                      }
                    `}
                  >
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    )}
                    <span className="relative">{category.name}</span>
                    {selectedCategory === category.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
                
                {/* Show More/Less button */}
                {categories.length > categoriesToShow && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-background-light border border-secondary/50 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 cursor-pointer"
                  >
                    {showAllCategories ? (
                      <span className="flex items-center gap-1.5">
                        Thu gọn
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        Xem thêm ({categories.length - categoriesToShow})
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content - Movies Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                {Array.from({ length: 24 }).map((_, i) => (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-text-muted text-base sm:text-lg">Không tìm thấy phim</p>
                <p className="text-text-muted text-xs sm:text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
                  {posts.map((post: any) => (
                    <MovieCard key={post.id} movie={post} />
                  ))}
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
              </>
            )}
          </div>

          {/* Sidebar - Popular Tags */}
          <div className="lg:block">
            <PopularTags 
              source="posts"
              onTagClick={(tag) => {
                setSelectedCategory(tag);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

