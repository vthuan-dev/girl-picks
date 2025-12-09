'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationFilters from '@/components/sections/LocationFilters';
import PopularTags from '@/components/sections/PopularTags';
import LatestReviews from '@/components/sections/LatestReviews';

export default function HomePageClient() {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
              Tìm Gái gọi
            </h1>
            <p className="text-sm text-text-muted">
              Nền tảng đánh giá và tìm kiếm gái gọi uy tín
            </p>
          </div>
        </div>
      </div>

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

      {/* Main Content with Sidebar Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content - Reviews */}
        <div className="flex-1 min-w-0">
          {/* Latest Reviews Section - Đánh giá gái gọi */}
          <LatestReviews limit={10} />
        </div>

        {/* Sidebar - Popular Tags */}
        <div className="lg:block">
          <PopularTags />
        </div>
      </div>
    </div>
  );
}
