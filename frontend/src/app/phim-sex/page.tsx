'use client';

import { useState, useEffect } from 'react';
import MovieCard from '@/components/movies/MovieCard';
import Pagination from '@/components/common/Pagination';

// Mock movies data - in real app, this would come from API
// Generate more mock movies for pagination demo
const generateMockMovies = () => {
  const categories = ['sex tự quay', 'sex nhật bản', 'gaidam', 'sex việt nam', 'sex hàn quốc'];
  const titles = [
    'Làm tình cùng bạn gái Nhật',
    'Móc lồn em',
    'Em gái xinh làm tình',
    'Thủ dâm cùng bạn',
    'Làm tình với em gái',
    'Em gái dâm đãng',
    'Sex với em gái xinh',
    'Thủ dâm em gái',
    'Làm tình nóng bỏng',
    'Em gái quyến rũ',
    'Sex tự quay nóng',
    'Em gái dâm dục',
    'Làm tình đã đời',
    'Thủ dâm cùng bạn gái',
    'Em gái xinh đẹp',
    'Sex nóng bỏng',
    'Làm tình với bạn',
    'Em gái dâm đãng',
    'Thủ dâm em gái xinh',
    'Sex tự quay',
  ];

  return Array.from({ length: 60 }, (_, i) => ({
    id: `${i + 1}`,
    title: titles[i % titles.length] + ` ${Math.floor(i / titles.length) + 1}`,
    thumbnail: i < 2 
      ? `https://gaigu1.net/media/videos/tmb2/777${34 - i}/1.jpg`
      : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop',
    duration: `${Math.floor(Math.random() * 30) + 10}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    views: Math.floor(Math.random() * 50000) + 10000,
    rating: (4 + Math.random()).toFixed(1),
    detailUrl: '#',
    category: categories[i % categories.length],
    poster: i < 2 
      ? `https://gaigu1.net/media/videos/tmb2/777${34 - i}/default.jpg`
      : undefined,
  }));
};

const mockMovies = generateMockMovies();

const categories = ['Tất cả', 'sex tự quay', 'sex nhật bản', 'gaidam', 'sex việt nam', 'sex hàn quốc'];

export default function PhimSexPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [movies, setMovies] = useState(mockMovies);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredMovies = selectedCategory === 'Tất cả' 
    ? movies 
    : movies.filter(movie => movie.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = filteredMovies.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                Phim sex
              </h1>
              <p className="text-sm text-text-muted">
                Hiển thị {startIndex + 1} tới {Math.min(endIndex, filteredMovies.length)} của <span className="text-primary font-semibold">{filteredMovies.length}</span> phim
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
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold
                  transition-all duration-300 cursor-pointer overflow-hidden
                  ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/40 transform scale-105 border-2 border-primary/80'
                      : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:transform hover:scale-105'
                  }
                `}
              >
                {/* Shine effect on selected */}
                {selectedCategory === category && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                
                {/* Icon for "Tất cả" */}
                {category === 'Tất cả' && (
                  <span className="inline-block mr-1.5">🎬</span>
                )}
                
                <span className="relative">{category}</span>
                
                {/* Active indicator */}
                {selectedCategory === category && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
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
        ) : filteredMovies.length === 0 ? (
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
              {currentMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
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
    </main>
  );
}

