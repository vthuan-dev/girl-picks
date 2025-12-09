'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'next/navigation';
import GirlList from '@/modules/girls/components/GirlList';
import LocationFilters from '@/components/sections/LocationFilters';
import PopularTags from '@/components/sections/PopularTags';
import Header from '@/components/layout/Header';
import FilterButton from '@/components/filters/FilterButton';
import { girlsApi } from '@/modules/girls/api/girls.api';

export default function GirlsPageClient() {
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

  useEffect(() => {
    setSearchQuery((prev) => (prev === searchParamValue ? prev : searchParamValue));
  }, [searchParamValue]);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
              Gái gọi
            </h1>
            <p className="text-sm text-text-muted">
              {isLoadingTotal ? (
                'Đang tải...'
              ) : total > 0 ? (
                <>
                  Tổng cộng <span className="text-primary font-semibold">{total.toLocaleString('vi-VN')}</span> kết quả
                </>
              ) : (
                'Không có kết quả'
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

      {/* Location Filters */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
          Tỉnh thành
        </h2>
        <LocationFilters 
          selectedLocation={selectedProvince || searchQuery || null}
          onLocationChange={(location) => {
            console.log('[GirlsPageClient] Location changed:', location);
            if (location) {
              setSelectedProvince(location);
              setSearchQuery(location);
            } else {
              setSelectedProvince(null);
              setSearchQuery('');
            }
          }}
        />
      </div>

      {/* Additional Filters */}
      <div className="mb-4 sm:mb-6 lg:mb-8 relative overflow-visible">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-text uppercase tracking-wide">
              Bộ lọc
            </h2>
          </div>
          {/* Clear All Filters Button */}
          {(filters.verified || filters.price || filters.age || filters.height || filters.weight || filters.origin || filters.location || selectedProvince || searchQuery) && (
            <button
              onClick={() => {
                setFilters({
                  verified: false,
                  price: '',
                  age: '',
                  height: '',
                  weight: '',
                  origin: '',
                  location: '',
                });
                setSelectedProvince(null);
                setSearchQuery('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
              title="Xóa tất cả filter"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Xóa tất cả</span>
            </button>
          )}
        </div>
        {/* Horizontal scroll on mobile to keep filters in one line */}
        <div className="flex flex-nowrap gap-2 sm:gap-2.5 overflow-x-auto overflow-y-visible pb-2 -mx-2 px-2 snap-x snap-mandatory">
          {/* Mới xác thực */}
          <button
            onClick={() => setFilters({ ...filters, verified: !filters.verified })}
            className={`group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transform transition-all duration-300 ${
              filters.verified
                ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105'
                : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:scale-105'
            }`}
          >
            {filters.verified && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            )}
            <span className="relative flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mới xác thực
            </span>
          </button>

          {/* Giá */}
          <FilterButton
            label="Giá"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            options={[
              { label: 'Giá dưới 600k', value: 'under-600k' },
              { label: 'Giá từ 600k - 1000k', value: '600k-1000k' },
              { label: 'Giá trên 1000k', value: 'over-1000k' },
            ]}
            isActive={!!filters.price}
            selectedValue={filters.price}
            onSelect={(value) => {
              const newValue = filters.price === value ? '' : value;
              setFilters({ ...filters, price: newValue });
            }}
            onClear={() => setFilters({ ...filters, price: '' })}
          />

          {/* Tuổi */}
          <FilterButton
            label="Tuổi"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            options={[
              { label: '18 - 22 tuổi', value: '18-22' },
              { label: '23 - 27 tuổi', value: '23-27' },
              { label: '28 - 32 tuổi', value: '28-32' },
              { label: 'Trên 32 tuổi', value: 'over-32' },
            ]}
            isActive={!!filters.age}
            selectedValue={filters.age}
            onSelect={(value) => {
              const newValue = filters.age === value ? '' : value;
              setFilters({ ...filters, age: newValue });
            }}
            onClear={() => setFilters({ ...filters, age: '' })}
          />

          {/* Chiều cao */}
          <FilterButton
            label="Chiều cao"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            }
            options={[
              { label: 'Dưới 155cm', value: 'under-155' },
              { label: '155cm - 165cm', value: '155-165' },
              { label: '165cm - 175cm', value: '165-175' },
              { label: 'Trên 175cm', value: 'over-175' },
            ]}
            isActive={!!filters.height}
            selectedValue={filters.height}
            onSelect={(value) => {
              const newValue = filters.height === value ? '' : value;
              setFilters({ ...filters, height: newValue });
            }}
            onClear={() => setFilters({ ...filters, height: '' })}
          />

          {/* Cân nặng */}
          <FilterButton
            label="Cân nặng"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            }
            options={[
              { label: 'Dưới 45kg', value: 'under-45' },
              { label: '45kg - 55kg', value: '45-55' },
              { label: '55kg - 65kg', value: '55-65' },
              { label: 'Trên 65kg', value: 'over-65' },
            ]}
            isActive={!!filters.weight}
            selectedValue={filters.weight}
            onSelect={(value) => {
              const newValue = filters.weight === value ? '' : value;
              setFilters({ ...filters, weight: newValue });
            }}
            onClear={() => setFilters({ ...filters, weight: '' })}
          />

          {/* Xuất xứ */}
          <FilterButton
            label="Xuất xứ"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            options={[
              { label: 'Miền Bắc', value: 'mien-bac' },
              { label: 'Miền Trung', value: 'mien-trung' },
              { label: 'Miền Nam', value: 'mien-nam' },
              { label: 'Nước ngoài', value: 'nuoc-ngoai' },
            ]}
            isActive={!!filters.origin}
            selectedValue={filters.origin}
            onSelect={(value) => {
              const newValue = filters.origin === value ? '' : value;
              setFilters({ ...filters, origin: newValue });
            }}
            onClear={() => setFilters({ ...filters, origin: '' })}
          />

          {/* Vị trí */}
          <FilterButton
            label="Vị trí"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            options={[
              { label: 'Quận 1', value: 'quan-1' },
              { label: 'Quận 2', value: 'quan-2' },
              { label: 'Quận 3', value: 'quan-3' },
              { label: 'Quận 7', value: 'quan-7' },
              { label: 'Quận 10', value: 'quan-10' },
            ]}
            isActive={!!filters.location}
            selectedValue={filters.location}
            onSelect={(value) => {
              const newValue = filters.location === value ? '' : value;
              setFilters({ ...filters, location: newValue });
            }}
            onClear={() => setFilters({ ...filters, location: '' })}
          />
        </div>
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
        {/* Main Content - Girls Grid */}
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

        {/* Sidebar - Popular Tags */}
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

