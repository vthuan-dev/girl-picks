'use client';

import { useState, useEffect } from 'react';
import ImageCard from '@/components/images/ImageCard';
import Pagination from '@/components/common/Pagination';

// Generate more mock images for pagination demo
const generateMockImages = () => {
  const titles = [
    'Em gái xinh đẹp',
    'Em gái dâm đãng',
    'Em gái quyến rũ',
    'Em gái nóng bỏng',
    'Em gái sexy',
    'Em gái đẹp',
    'Em gái xinh xắn',
    'Em gái quyến rũ',
  ];
  const images = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop',
  ];

  return Array.from({ length: 60 }, (_, i) => ({
    id: `${i + 1}`,
    title: titles[i % titles.length] + ` ${Math.floor(i / titles.length) + 1}`,
    url: images[i % images.length],
    thumbnail: images[i % images.length],
    views: Math.floor(Math.random() * 20000) + 5000,
    likes: Math.floor(Math.random() * 1500) + 500,
    category: 'Ảnh sex',
    tags: ['gái xinh', 'sex'],
  }));
};

const mockImages = generateMockImages();

const categories = ['Tất cả', 'Ảnh sex', 'Ảnh nóng', 'Ảnh gái xinh', 'Ảnh dâm'];

export default function AnhSexPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [images] = useState(mockImages);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredImages = selectedCategory === 'Tất cả' 
    ? images 
    : images.filter(image => image.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentImages = filteredImages.slice(startIndex, endIndex);

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
                Ảnh sex
              </h1>
              <p className="text-sm text-text-muted">
                Hiển thị {startIndex + 1} tới {Math.min(endIndex, filteredImages.length)} của <span className="text-primary font-semibold">{filteredImages.length}</span> ảnh
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
                  <span className="inline-block mr-1.5">📸</span>
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

        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-text-muted mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-text-muted text-base sm:text-lg">Không tìm thấy ảnh</p>
            <p className="text-text-muted text-xs sm:text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              {currentImages.map((image) => (
                <ImageCard key={image.id} image={image} />
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

