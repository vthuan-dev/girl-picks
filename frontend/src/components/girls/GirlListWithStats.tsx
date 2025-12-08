'use client';

import { useState, useEffect } from 'react';
import GirlList from '@/modules/girls/components/GirlList';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { getPaginatedData } from '@/lib/api/response-helper';

interface GirlListWithStatsProps {
  onTotalChange?: (total: number) => void;
  selectedProvince?: string | null;
  onPageChange?: (page: number, limit: number) => void;
}

export default function GirlListWithStats({ onTotalChange, selectedProvince, onPageChange }: GirlListWithStatsProps) {
  return (
    <GirlList
      selectedProvince={selectedProvince}
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

