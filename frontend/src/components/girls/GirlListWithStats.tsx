'use client';

import GirlList from '@/modules/girls/components/GirlList';

interface GirlListWithStatsProps {
  onTotalChange?: (total: number) => void;
  selectedProvince?: string | null;
  onPageChange?: (page: number, limit: number) => void;
  filters?: {
    verified?: boolean;
    price?: string;
    age?: string;
    height?: string;
    weight?: string;
    origin?: string;
    location?: string;
  };
}

export default function GirlListWithStats({ onTotalChange, selectedProvince, onPageChange, filters }: GirlListWithStatsProps) {
  return (
    <GirlList
      selectedProvince={selectedProvince}
      filters={filters}
      onPageInfoChange={(info) => {
        if (onTotalChange) {
          onTotalChange(info.total);
        }
        if (onPageChange) {
          onPageChange(info.page, info.limit);
        }
      }}
    />
  );
}

