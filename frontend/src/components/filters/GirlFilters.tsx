'use client';

import { useState, useRef, useEffect } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface GirlFiltersProps {
  filters: {
    price: string;
    age: string;
    height: string;
  };
  onFilterChange: (filters: { price: string; age: string; height: string }) => void;
}

const priceOptions: FilterOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'under-600k', label: 'Dưới 600K' },
  { value: '600k-1000k', label: '600K - 1 triệu' },
  { value: 'over-1000k', label: 'Trên 1 triệu' },
];

const ageOptions: FilterOption[] = [
  { value: '', label: 'Tất cả' },
  { value: '18-22', label: '18 - 22 tuổi' },
  { value: '23-27', label: '23 - 27 tuổi' },
  { value: '28-32', label: '28 - 32 tuổi' },
  { value: 'over-32', label: 'Trên 32 tuổi' },
];

const heightOptions: FilterOption[] = [
  { value: '', label: 'Tất cả' },
  { value: 'under-155', label: 'Dưới 155cm' },
  { value: '155-165', label: '155 - 165cm' },
  { value: '165-175', label: '165 - 175cm' },
  { value: 'over-175', label: 'Trên 175cm' },
];

function FilterDropdown({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = value !== '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          border ${hasValue 
            ? 'bg-primary/10 border-primary text-primary' 
            : 'bg-background-light border-secondary/50 text-text hover:border-primary/50'
          }
        `}
      >
        {icon}
        <span className="font-medium">{label}:</span>
        <span className={hasValue ? 'text-primary font-semibold' : 'text-text-muted'}>
          {selectedOption?.label || 'Tất cả'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-background-light border border-secondary/50 rounded-lg shadow-xl z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2.5 text-left text-sm transition-colors
                ${option.value === value 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-text hover:bg-secondary/30'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GirlFilters({ filters, onFilterChange }: GirlFiltersProps) {
  const hasActiveFilters = filters.price || filters.age || filters.height;

  const handleClearAll = () => {
    onFilterChange({ price: '', age: '', height: '' });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Filter Label */}
        <div className="flex items-center gap-2 text-text-muted mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">Lọc theo:</span>
        </div>

        {/* Price Filter */}
        <FilterDropdown
          label="Giá"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          options={priceOptions}
          value={filters.price}
          onChange={(value) => onFilterChange({ ...filters, price: value })}
        />

        {/* Age Filter */}
        <FilterDropdown
          label="Tuổi"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          options={ageOptions}
          value={filters.age}
          onChange={(value) => onFilterChange({ ...filters, age: value })}
        />

        {/* Height Filter */}
        <FilterDropdown
          label="Chiều cao"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          }
          options={heightOptions}
          value={filters.height}
          onChange={(value) => onFilterChange({ ...filters, height: value })}
        />

        {/* Clear All Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">Xóa lọc</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-text-muted">Đang lọc:</span>
          {filters.price && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
              {priceOptions.find((o) => o.value === filters.price)?.label}
              <button
                onClick={() => onFilterChange({ ...filters, price: '' })}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.age && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
              {ageOptions.find((o) => o.value === filters.age)?.label}
              <button
                onClick={() => onFilterChange({ ...filters, age: '' })}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.height && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
              {heightOptions.find((o) => o.value === filters.height)?.label}
              <button
                onClick={() => onFilterChange({ ...filters, height: '' })}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
