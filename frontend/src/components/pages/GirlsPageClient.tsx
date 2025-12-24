'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GirlList from '@/modules/girls/components/GirlList';
import LocationFilters from '@/components/sections/LocationFilters';
import PopularTags from '@/components/sections/PopularTags';
import GirlFilters from '@/components/filters/GirlFilters';
import Header from '@/components/layout/Header';
import { provinceToSlug, slugToProvince } from '@/lib/location/provinceSlugs';

export default function GirlsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    verified: false,
    price: '',
    age: '',
    height: '',
    weight: '',
    origin: '',
    location: '',
  });
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState<boolean>(true);

  const searchParamValue = searchParams?.get('search') || '';
  const provinceParamValue = searchParams?.get('province') || '';
  const tagParamValue = searchParams?.get('tag') || '';

  useEffect(() => {
    setSearchQuery(searchParamValue);

    // Chuyển slug tỉnh thành tên tỉnh chuẩn (có dấu) cho API
    const province = provinceParamValue ? slugToProvince(provinceParamValue) || provinceParamValue : '';
    setSelectedProvince(province);

    setSelectedTag(tagParamValue);
  }, [searchParamValue, provinceParamValue, tagParamValue]);

  const handleFilterChange = (newFilters: { price: string; age: string; height: string }) => {
    setFilters((prev) => ({
      ...prev,
      price: newFilters.price,
      age: newFilters.age,
      height: newFilters.height,
    }));
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">Gái gọi</h1>
              <p className="text-sm text-text-muted">
                {isLoadingTotal ? (
                  'Đang tải...'
                ) : total > 0 ? (
                  <>
                    Hiển thị 1 tới 20 của <span className="text-primary font-semibold">{total.toLocaleString('vi-VN')}</span> kết quả
                  </>
                ) : (
                  'Không có kết quả'
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
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">Tỉnh thành</h2>
          <LocationFilters
            selectedLocation={selectedProvince || searchQuery || null}
            onLocationChange={(location) => {
              if (location) {
                setSelectedProvince(location);
                setSearchQuery(location);
                // Dùng slug cho URL chuẩn SEO
                const slug = provinceToSlug(location) || encodeURIComponent(location);
                router.push(`/girls?province=${slug}`);
              } else {
                setSelectedProvince(null);
                setSearchQuery('');
                router.push('/girls');
              }
            }}
          />
        </div>

        {/* Search Result Display */}
        {(selectedProvince || searchQuery) && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-4 py-3 bg-background-light border border-secondary/50 rounded-lg">
              <p className="text-sm text-text-muted">
                Kết quả cho: <span className="text-primary font-semibold">{selectedProvince || searchQuery}</span>
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProvince(null);
                }}
                className="text-text-muted hover:text-text transition-colors"
                title="Xóa filter"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <GirlList
              filters={filters}
              selectedProvince={selectedProvince || (searchQuery ? searchQuery : null)}
              searchQuery={searchQuery || undefined}
              selectedTag={selectedTag}
              onTotalChange={(total, isLoading) => {
                setTotal(total);
                setIsLoadingTotal(isLoading);
              }}
            />
          </div>
          <div className="lg:block">
            <PopularTags
              selectedTag={selectedTag}
              onTagClick={(tag) => {
                setSelectedTag(tag || null);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
