'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { girlsApi } from '@/modules/girls/api/girls.api';

// Default locations list (fallback if API fails)
const defaultLocations = [
  'Sài Gòn',
  'Hà Nội',
  'Bình Dương',
  'Đà Nẵng',
  'Đồng Nai',
  'Lâm Đồng',
  'Bà Rịa Vũng Tàu',
  'Khánh Hòa',
  'Long An',
  'Cần Thơ',
  'Đắk Lắk',
  'Bình Thuận',
  'Thừa Thiên Huế',
  'Bình Phước',
  'Bình Định',
  'Đồng Tháp',
  'Bến Tre',
  'Kiên Giang',
  'Tiền Giang',
  'An Giang',
  'Trà Vinh',
  'Vĩnh Long',
  'Phú Yên',
  'Bạc Liêu',
  'Hải Phòng',
  'Hậu Giang',
  'Sóc Trăng',
  'Ninh Thuận',
  'Nghệ An',
];

interface LocationFiltersProps {
  selectedLocation?: string | null;
  onLocationChange?: (location: string | null) => void;
}

export default function LocationFilters({ selectedLocation, onLocationChange }: LocationFiltersProps) {
  // Fetch count by province
  const { data: provinceCounts = [], isLoading, error } = useQuery(
    ['girls', 'count-by-province'],
    async () => {
      const result = await girlsApi.getCountByProvince();
      console.log('[LocationFilters] API Response:', result);
      console.log('[LocationFilters] Response type:', Array.isArray(result) ? 'Array' : typeof result);
      console.log('[LocationFilters] Response length:', Array.isArray(result) ? result.length : 'N/A');
      if (Array.isArray(result) && result.length > 0) {
        console.log('[LocationFilters] First item:', result[0]);
      }
      return result;
    },
    {
      staleTime: 10 * 60 * 1000, // Cache for 10 minutes
      cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
      onError: (err) => {
        console.error('[LocationFilters] Error fetching province counts:', err);
      },
    }
  );

  // Create a map of province to count
  const provinceCountMap = useMemo(() => {
    const map = new Map<string, number>();
    provinceCounts.forEach(({ province, count }) => {
      map.set(province, count);
    });
    return map;
  }, [provinceCounts]);

  // Get only provinces that have girls, sorted by count
  const sortedLocations = useMemo(() => {
    // Only show provinces that actually have girls (count > 0)
    return provinceCounts
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count)
      .map(({ province }) => province);
  }, [provinceCounts]);

  const handleLocationClick = (location: string) => {
    console.log('[LocationFilters] Clicked location:', location, 'onLocationChange:', !!onLocationChange);
    if (onLocationChange) {
      if (selectedLocation === location) {
        onLocationChange(null);
      } else {
        onLocationChange(location);
      }
    } else {
      console.warn('[LocationFilters] onLocationChange is not provided');
    }
  };

  // Show only provinces with girls, use default list while loading
  const displayLocations = isLoading ? defaultLocations.slice(0, 5) : sortedLocations;

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5">
      {displayLocations.map((location) => {
        const count = provinceCountMap.get(location) || 0;
        return (
          <button
            key={location}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLocationClick(location);
            }}
            className={`px-3.5 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer min-h-[40px] flex items-center justify-center gap-2 relative z-10 ${
              selectedLocation === location
                ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30 transform scale-105'
                : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary hover:transform hover:scale-105'
            }`}
          >
            <span>{location}</span>
            {!isLoading && count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedLocation === location
                  ? 'bg-white/20 text-white'
                  : 'bg-primary/10 text-primary'
              }`}>
                {count.toLocaleString('vi-VN')}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
