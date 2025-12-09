'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GirlList from '@/modules/girls/components/GirlList';
import Header from '@/components/layout/Header';
import PopularTags from '@/components/sections/PopularTags';
import LocationFilters from '@/components/sections/LocationFilters';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const tagParam = searchParams.get('tag') || '';
  
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

  // Extract tag from query or tag param
  const selectedTag = useMemo(() => {
    if (tagParam) return tagParam;
    // Only treat as tag if it's a single word without digits (avoid phone number being a tag)
    if (query && !query.includes(' ') && !/\d/.test(query)) return query;
    return null;
  }, [query, tagParam]);

  const isPhoneQuery = useMemo(() => /\d{6,}/.test(query || ''), [query]);

  // Update selected province if query contains location and is not phone
  useEffect(() => {
    if (query && !selectedTag && !isPhoneQuery) {
      // Check if query matches a province
      const provinces = ['Sài Gòn', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai'];
      const matchedProvince = provinces.find(p => 
        query.toLowerCase().includes(p.toLowerCase()) || 
        p.toLowerCase().includes(query.toLowerCase())
      );
      if (matchedProvince) {
        setSelectedProvince(matchedProvince);
      } else {
        setSelectedProvince(null);
      }
    } else if (isPhoneQuery) {
      setSelectedProvince(null);
    }
  }, [query, selectedTag, isPhoneQuery]);

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                {query || selectedTag ? (
                  <>
                    Kết Quả Tìm Kiếm Cho: <span className="text-primary">{query || selectedTag}</span>
                  </>
                ) : (
                  'Tìm kiếm'
                )}
              </h1>
              {selectedTag && (
                <p className="text-sm text-text-muted">
                  Đang tìm kiếm theo tag: <span className="text-primary font-semibold">{selectedTag}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location Filters */}
        {!selectedTag && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
              Tỉnh thành
            </h2>
            <LocationFilters 
              selectedLocation={selectedProvince || null}
              onLocationChange={(location) => {
                if (location) {
                  setSelectedProvince(location);
                } else {
                  setSelectedProvince(null);
                }
              }}
            />
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content - Girls Grid */}
          <div className="flex-1 min-w-0">
            <GirlList 
              filters={filters} 
              selectedProvince={selectedProvince} 
              searchQuery={query && !selectedTag ? query : undefined}
              selectedTag={selectedTag}
            />
          </div>

          {/* Sidebar - Popular Tags */}
          <div className="lg:block">
            <PopularTags 
              source="girls"
              selectedTag={selectedTag}
              onTagClick={(tag) => {
                // Already handled by navigation in PopularTags component
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Đang tải...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

