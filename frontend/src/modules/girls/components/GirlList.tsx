'use client';

import { useState, useEffect } from 'react';
import { girlsApi } from '../api/girls.api';
import { Girl, GirlListParams } from '@/types/girl';
import GirlCard from './GirlCard';
import { PaginatedResponse } from '@/lib/api/types';

// Mock images - diverse and high quality
const mockImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&q=80',
];

const districts = ['Sài Gòn', 'Hà Nội', 'Đà Nẵng'];

export default function GirlList() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<GirlListParams>({
    page: 1,
    limit: 60,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
  });

  useEffect(() => {
    fetchGirls();
  }, [params]);

  const fetchGirls = async () => {
    setLoading(true);
    try {
      const response = await girlsApi.getGirls(params);
      if (response.success) {
        const data = response.data as unknown as PaginatedResponse<Girl>;
        const girlsWithImages = data.data.map((girl, index) => ({
          ...girl,
          avatar: girl.avatar || mockImages[index % mockImages.length],
          images: girl.images || [mockImages[index % mockImages.length]],
        }));
        setGirls(girlsWithImages);
        setPagination({
          total: data.total,
          totalPages: data.totalPages,
          page: data.page,
        });
      }
    } catch (error) {
      console.error('Failed to fetch girls:', error);
      // Use mock data if API fails
      const mockGirls: Girl[] = Array.from({ length: 12 }, (_, i) => ({
        id: `mock-${i}`,
        email: `girl${i}@example.com`,
        username: `girl${i}`,
        fullName: `Nguyễn Thị ${String.fromCharCode(65 + i)}`,
        role: 'GIRL' as any,
        avatar: mockImages[i % mockImages.length],
        images: [mockImages[i % mockImages.length]],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bio: `Chào mừng bạn đến với profile của tôi. Tôi là một người vui vẻ, thân thiện và chuyên nghiệp.`,
        verified: i % 3 === 0,
        rating: 4.5 + Math.random() * 0.5,
        totalReviews: Math.floor(Math.random() * 100) + 10,
        totalBookings: Math.floor(Math.random() * 50) + 5,
        isAvailable: i % 2 === 0,
        districtId: `district-${i % 3}`,
        district: {
          id: `district-${i % 3}`,
          name: districts[i % 3],
          code: `SG-${i}`,
        },
        tags: ['tag1', 'tag2'],
      }));
      setGirls(mockGirls);
      setPagination({
        total: 15550,
        totalPages: 260,
        page: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-background-light border border-secondary/30 rounded-lg overflow-hidden animate-pulse">
            <div className="w-full aspect-[3/4] bg-secondary/30"></div>
            <div className="p-3 sm:p-4 space-y-2">
              <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
              <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
              <div className="h-3 bg-secondary/30 rounded w-2/3 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (girls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-text-muted mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-text-muted text-base sm:text-lg">Không tìm thấy kết quả</p>
        <p className="text-text-muted text-xs sm:text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {girls.map((girl) => (
          <GirlCard key={girl.id} girl={girl} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8 sm:mt-12">
          <button
            onClick={() => setParams({ ...params, page: (params.page || 1) - 1 })}
            disabled={pagination.page === 1}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-background-light border border-secondary/50 text-text rounded-lg hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Trước</span>
            <span className="sm:hidden">Trang trước</span>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide px-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = pagination.page <= 3 
                ? i + 1 
                : pagination.page >= pagination.totalPages - 2
                ? pagination.totalPages - 4 + i
                : pagination.page - 2 + i;
              
              if (page < 1 || page > pagination.totalPages) return null;
              
              return (
                <button
                  key={page}
                  onClick={() => setParams({ ...params, page })}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all text-xs sm:text-sm flex-shrink-0 cursor-pointer ${
                    pagination.page === page
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setParams({ ...params, page: (params.page || 1) + 1 })}
            disabled={pagination.page >= pagination.totalPages}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-background-light border border-secondary/50 text-text rounded-lg hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <span className="hidden sm:inline">Sau</span>
            <span className="sm:hidden">Trang sau</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
