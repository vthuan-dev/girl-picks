'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LocationFilters from '@/components/sections/LocationFilters';
import GirlList from '@/modules/girls/components/GirlList';
import PopularTags from '@/components/sections/PopularTags';
import { provinceToSlug } from '@/lib/location/provinceSlugs';

interface ProvincePageClientProps {
  province: string;
  slug: string;
}

export default function ProvincePageClient({ province, slug }: ProvincePageClientProps) {
  const router = useRouter();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(province || null);

  // Sync state when slug/province changes
  useEffect(() => {
    setSelectedProvince(province || null);
  }, [province, slug]);

  const handleLocationChange = (location: string | null) => {
    if (!location) {
      router.push('/search');
      return;
    }

    if (location) {
      setSelectedProvince(location);
      const slug = provinceToSlug(location) || encodeURIComponent(location);
      router.push(`/girls?province=${slug}`);
    } else {
      setSelectedProvince(null);
      router.push('/girls');
    }
  };

  const displayTitle = selectedProvince || province || 'Danh mục';

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                Danh mục: <span className="text-primary">{displayTitle}</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">Tỉnh thành</h2>
          <LocationFilters selectedLocation={selectedProvince} onLocationChange={handleLocationChange} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 min-w-0">
            <GirlList
              filters={{}}
              selectedProvince={selectedProvince}
              searchQuery={undefined}
              selectedTag={null}
            />
          </div>
          <div className="lg:block">
            <PopularTags
              source="girls"
              selectedTag={null}
              onTagClick={() => {
                /* handled by PopularTags navigation */
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}


