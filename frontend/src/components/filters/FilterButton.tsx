'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left?: number; width?: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const recalcPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    if (isMobile) {
      setDropdownStyle({
        top: rect.bottom + 8 + window.scrollY,
      });
    } else {
      setDropdownStyle({
        top: rect.bottom + 8 + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      recalcPosition();
      window.addEventListener('resize', recalcPosition);
      window.addEventListener('scroll', recalcPosition, true);
    }
    return () => {
      window.removeEventListener('resize', recalcPosition);
      window.removeEventListener('scroll', recalcPosition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isMobile]);

  const handleSelect = (value: string) => {
    console.log('[FilterButton] select', label, value);
    onSelect(value);
    setIsOpen(false);
  };

  const handleToggle = () => {
    console.log('[FilterButton] toggle', label, !isOpen);
    if (isOpen) {
      setIsOpen(false);
    } else {
      recalcPosition();
      setIsOpen(true);
    }
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
        ref={buttonRef}
        onClick={handleToggle}
        type="button"
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
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)}>
            <div className="fixed inset-0 bg-black/20" />
            <div
              className="fixed bg-background-light border border-secondary/50 rounded-lg shadow-xl overflow-hidden min-w-[180px]"
              style={
                isMobile
                  ? {
                      top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 100,
                      left: 16,
                      right: 16,
                    }
                  : {
                      top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 8 : 100,
                      left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 16,
                      minWidth: buttonRef.current ? Math.max(buttonRef.current.getBoundingClientRect().width, 180) : 180,
                    }
              }
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1 max-h-[60vh] overflow-auto">
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
          </div>,
          document.body,
        )}
    </div>
  );
}

