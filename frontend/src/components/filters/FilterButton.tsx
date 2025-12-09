'use client';

import { useState, useRef, useEffect } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterButtonProps {
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
  isActive?: boolean;
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClear?: () => void;
}

export default function FilterButton({
  label,
  icon,
  options,
  isActive = false,
  selectedValue,
  onSelect,
  onClear,
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transform transition-all duration-300 ${
          isActive
            ? 'bg-background-light border border-secondary/50 text-primary'
            : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:scale-105'
        }`}
      >
        <span className="relative flex items-center gap-1.5">
          {icon}
          {label}
          {isActive && (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {onClear && (
                <button
                  onClick={handleClear}
                  className="ml-1 p-0.5 hover:bg-primary/20 rounded transition-colors"
                  title="Xóa filter"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          )}
        </span>
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-background-light border border-secondary/50 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  selectedValue === option.value
                    ? 'bg-primary/20 text-primary font-semibold'
                    : 'text-text hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

