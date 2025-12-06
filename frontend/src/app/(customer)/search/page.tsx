'use client';

import { useState } from 'react';
import GirlCard from '@/components/girls/GirlCard';

const districts = ['Tất cả', 'Quận 1', 'Quận 2', 'Quận 3', 'Quận 7', 'Bình Thạnh'];
const priceRanges = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K - 1M', min: 500000, max: 1000000 },
  { label: 'Trên 1M', min: 1000000, max: Infinity },
];

export default function SearchPage() {
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const girls = [
    {
      id: '1',
      name: 'Nguyễn Thị A',
      age: 22,
      price: '300K/giờ',
      location: 'Quận 1',
      rating: 4.8,
      totalReviews: 24,
      avatar: null,
      verified: true,
      isAvailable: true,
    },
    {
      id: '2',
      name: 'Trần Thị B',
      age: 25,
      price: '500K/giờ',
      location: 'Quận 2',
      rating: 4.9,
      totalReviews: 45,
      avatar: null,
      verified: true,
      isAvailable: true,
    },
    {
      id: '3',
      name: 'Lê Thị C',
      age: 23,
      price: '400K/giờ',
      location: 'Quận 3',
      rating: 4.7,
      totalReviews: 18,
      avatar: null,
      verified: false,
      isAvailable: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Tìm kiếm</h1>
        <p className="text-text-muted">Tìm gái gọi phù hợp với bạn</p>
      </div>

      {/* Search Bar */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
            />
          </div>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Khu vực</label>
          <div className="flex flex-wrap gap-2">
            {districts.map((district) => (
              <button
                key={district}
                onClick={() => setSelectedDistrict(district)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    selectedDistrict === district
                      ? 'bg-primary text-white'
                      : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {district}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">Mức giá</label>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => setSelectedPriceRange(range)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    selectedPriceRange.label === range.label
                      ? 'bg-primary text-white'
                      : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-muted">
            Tìm thấy <span className="font-bold text-text">{girls.length}</span> kết quả
          </p>
          <select className="px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary">
            <option>Sắp xếp theo: Mới nhất</option>
            <option>Sắp xếp theo: Đánh giá cao</option>
            <option>Sắp xếp theo: Giá thấp đến cao</option>
            <option>Sắp xếp theo: Giá cao đến thấp</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {girls.map((girl) => (
            <GirlCard key={girl.id} girl={girl} />
          ))}
        </div>
      </div>
    </div>
  );
}

