 'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GirlList from '@/modules/girls/components/GirlList';
import PopularTags from '@/components/sections/PopularTags';
import LocationFilters from '@/components/sections/LocationFilters';
import Header from '@/components/layout/Header';
import { provinceToSlug, slugToProvince } from '@/lib/location/provinceSlugs';
import Link from 'next/link';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const query = useMemo(() => {
    try {
      return decodeURIComponent(rawQuery).replace(/\+/g, ' ');
    } catch {
      return rawQuery.replace(/\+/g, ' ');
    }
  }, [rawQuery]);
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

  // Nếu query là tên tỉnh → redirect sang URL SEO /{slug}
  useEffect(() => {
    if (!query || selectedTag || isPhoneQuery) return;

    const slug = provinceToSlug(query);
    const province = slug ? slugToProvince(slug) : null;

    if (slug && province) {
      router.replace(`/${slug}`);
      return;
    }

    // Nếu không phải tỉnh, reset selectedProvince (chế độ search thường)
    setSelectedProvince(null);
  }, [query, selectedTag, isPhoneQuery, router]);

  const displayTitle = selectedProvince || query || selectedTag || 'Tìm kiếm';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
              Kết Quả Tìm Kiếm Cho: <span className="text-primary">{displayTitle}</span>
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
                const slug = provinceToSlug(location);
                if (slug) {
                  router.push(`/${slug}`);
                }
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
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
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
    </>
  );
}

