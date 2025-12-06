'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const locations = [
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

export default function LocationFilters() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleLocationClick = (location: string) => {
    if (selectedLocation === location) {
      setSelectedLocation(null);
      router.push('/girls');
    } else {
      setSelectedLocation(location);
      router.push(`/girls?location=${encodeURIComponent(location)}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {locations.map((location) => (
        <button
          key={location}
          onClick={() => handleLocationClick(location)}
          className={`px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
            selectedLocation === location
              ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30 transform scale-105'
              : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary hover:transform hover:scale-105'
          }`}
        >
          {location}
        </button>
      ))}
    </div>
  );
}
