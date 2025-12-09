'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GirlListWithStats from '@/components/girls/GirlListWithStats';
import LocationFilters from '@/components/sections/LocationFilters';
import PopularTags from '@/components/sections/PopularTags';
import LatestPosts from '@/components/sections/LatestPosts';
import LatestReviews from '@/components/sections/LatestReviews';
import GirlFilters from '@/components/filters/GirlFilters';

export default function HomePageClient() {
  const router = useRouter();
  const [pageInfo, setPageInfo] = useState({ total: 0, page: 1, limit: 20 });
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    verified: false,
    price: '',
    age: '',
    height: '',
    weight: '',
    origin: '',
    location: '',
  });

  const handleFilterChange = (newFilters: { price: string; age: string; height: string }) => {
    setFilters((prev) => ({
      ...prev,
      price: newFilters.price,
      age: newFilters.age,
      height: newFilters.height,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
              Gái gọi
            </h1>
            <p className="text-sm text-text-muted">
              {pageInfo.total > 0 ? (
                <>
                  Hiển thị {(pageInfo.page - 1) * pageInfo.limit + 1} tới {Math.min(pageInfo.page * pageInfo.limit, pageInfo.total)} của{' '}
                  <span className="text-primary font-semibold">{pageInfo.total.toLocaleString('vi-VN')}</span> kết quả
                </>
              ) : (
                'Đang tải...'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Girl Filters - Tuổi, Giá, Chiều cao */}
      <GirlFilters
        filters={{ price: filters.price, age: filters.age, height: filters.height }}
        onFilterChange={handleFilterChange}
      />

      {/* Location Filters */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
          Tỉnh thành
        </h2>
        <LocationFilters 
          selectedLocation={selectedProvince}
          onLocationChange={(location) => {
            console.log('[HomePageClient] Location changed:', location);
            setSelectedProvince(location);
            if (location) {
              router.push(`/search?q=${encodeURIComponent(location)}`);
            }
          }}
        />
      </div>

      {/* Latest Reviews Section - Đánh giá gái gọi - ĐẶT LÊN ĐẦU */}
      <LatestReviews limit={5} />

      {/* Main Content with Sidebar Layout - Gái gọi cho bạn */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6 lg:mb-10">
        {/* Main Content - Girls Grid */}
        <div className="flex-1 min-w-0">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h2 className="text-lg font-bold text-text">Gái gọi cho bạn</h2>
          </div>
          
          <GirlListWithStats
            selectedProvince={selectedProvince}
            filters={filters}
            onTotalChange={(total) => setPageInfo((prev) => ({ ...prev, total }))}
            onPageChange={(page, limit) => setPageInfo((prev) => ({ ...prev, page, limit }))}
          />
        </div>

        {/* Sidebar - Popular Tags */}
        <div className="lg:block">
          <PopularTags />
        </div>
      </div>

      {/* Latest Posts Section */}
      <LatestPosts />
    </div>
  );
}
