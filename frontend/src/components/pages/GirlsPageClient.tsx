'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const pageParamValue = searchParams?.get('page') || '1';

  useEffect(() => {
    setSearchQuery(searchParamValue);

    // Chuyển slug tỉnh thành tên tỉnh chuẩn (có dấu) cho API
    const province = provinceParamValue ? slugToProvince(provinceParamValue) || provinceParamValue : '';
    console.log('[GirlsPageClient] Province param:', provinceParamValue, '-> Converted to:', province);
    setSelectedProvince(province);

    setSelectedTag(tagParamValue);
  }, [searchParamValue, provinceParamValue, tagParamValue]);

  // Parse page from URL
  const currentPage = parseInt(pageParamValue, 10) || 1;

  // Memoize onPageChange to prevent infinite re-renders
  const handlePageChange = useCallback((page: number) => {
    // Update URL with page parameter
    const urlParams = new URLSearchParams();
    if (searchQuery) urlParams.set('search', searchQuery);
    if (provinceParamValue) urlParams.set('province', provinceParamValue);
    if (tagParamValue) urlParams.set('tag', tagParamValue);
    if (page > 1) urlParams.set('page', page.toString());
    
    const queryString = urlParams.toString();
    const newUrl = queryString ? `/girls?${queryString}` : '/girls';
    router.push(newUrl, { scroll: false });
  }, [searchQuery, provinceParamValue, tagParamValue, router]);

  const handleFilterChange = (newFilters: { price: string; age: string; height: string }) => {
    setFilters((prev) => ({
      ...prev,
      price: newFilters.price,
      age: newFilters.age,
      height: newFilters.height,
    }));
  };

  const handlePhoneSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSearchQuery('');
      // Xóa param search khỏi URL nhưng giữ province nếu có
      if (provinceParamValue) {
        router.push(`/girls?province=${encodeURIComponent(provinceParamValue)}`);
      } else {
        router.push('/girls');
      }
      return;
    }

    setSearchQuery(trimmed);

    // Khi tìm theo số điện thoại hoặc từ khóa, chúng ta CÓ THỂ giữ tỉnh nếu muốn tìm trong tỉnh đó
    // Tuy nhiên theo thiết kế hiện tại, thường người dùng muốn tìm toàn cục khi nhập SĐT
    // Nếu muốn tìm toàn cục:
    // setSelectedProvince(null); 
    // router.push(`/girls?search=${encodeURIComponent(trimmed)}`);

    // Nếu muốn tìm trong tỉnh hiện tại (nếu có):
    if (selectedProvince && provinceParamValue) {
      router.push(`/girls?province=${encodeURIComponent(provinceParamValue)}&search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/girls?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 page-transition">
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

            {/* Tìm nhanh theo số điện thoại */}
            <div className="w-full sm:w-80">
              <label className="block text-xs font-semibold text-text mb-1.5">
                Tìm gái theo số điện thoại
              </label>
              <div className="flex items-center gap-2 rounded-2xl bg-background-light/80 border border-secondary/40 px-2 py-1 shadow-sm">
                <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.516.758a11.042 11.042 0 005.516 5.516l.758-1.516a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 17.72V20a2 2 0 01-2 2h-.25C9.304 22 3 15.696 3 7.25V7a2 2 0 012-2z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  inputMode="tel"
                  pattern="[0-9\\s+]*"
                  className="flex-1 px-3 py-2 rounded-xl bg-transparent text-sm text-text placeholder:text-text-muted/60 focus:outline-none"
                  placeholder="Nhập số điện thoại (ít nhất 6 số)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePhoneSearch(searchQuery);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handlePhoneSearch(searchQuery)}
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all shadow-sm"
                >
                  <svg
                    className="w-5 h-5 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                    />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-[11px] text-text-muted">
                Gõ số điện thoại gái (ví dụ 09xx...) để lọc nhanh đúng profile.
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
            selectedLocation={selectedProvince}
            onLocationChange={(location) => {
              if (location) {
                setSelectedProvince(location);
                // Dùng slug cho URL chuẩn SEO
                const slug = provinceToSlug(location) || encodeURIComponent(location);

                // Giữ lại search query nếu có
                if (searchQuery) {
                  router.push(`/girls?province=${slug}&search=${encodeURIComponent(searchQuery)}`);
                } else {
                  router.push(`/girls?province=${slug}`);
                }
              } else {
                setSelectedProvince(null);
                if (searchQuery) {
                  router.push(`/girls?search=${encodeURIComponent(searchQuery)}`);
                } else {
                  router.push('/girls');
                }
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
              selectedProvince={selectedProvince}
              searchQuery={searchQuery || undefined}
              selectedTag={selectedTag}
              initialPage={currentPage}
              onPageChange={handlePageChange}
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
