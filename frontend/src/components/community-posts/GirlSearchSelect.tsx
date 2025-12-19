'use client';

import { useState, useEffect, useRef } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';

interface Girl {
  id: string;
  name: string;
  slug?: string;
  avatarUrl?: string;
}

interface GirlSearchSelectProps {
  value?: string;
  onChange: (girlId: string | undefined) => void;
  placeholder?: string;
}

export default function GirlSearchSelect({ value, onChange, placeholder = 'Tìm kiếm gái gọi...' }: GirlSearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [girls, setGirls] = useState<Girl[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGirl, setSelectedGirl] = useState<Girl | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load selected girl when value changes
  useEffect(() => {
    if (value && !selectedGirl) {
      loadSelectedGirl(value);
    } else if (!value) {
      setSelectedGirl(null);
      setSearchQuery('');
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSelectedGirl = async (girlId: string) => {
    try {
      const response = await girlsApi.getGirlById(girlId);
      const girl = response.data;
      if (girl) {
        // Girl extends User, so fullName and avatarUrl are directly on girl
        // But API response might have user relation, so we check both
        const girlData = girl as any;
        setSelectedGirl({
          id: girl.id,
          name: girl.name || (girlData.user?.fullName) || girl.fullName || 'Unknown',
          slug: girl.slug || undefined,
          avatarUrl: girl.avatarUrl || (girlData.user?.avatarUrl) || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to load selected girl:', error);
    }
  };

  const searchGirls = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setGirls([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await girlsApi.getGirls({ search: query, limit: 10 });
      const girlsList = (response.data || []).map((girl: any) => ({
        id: girl.id,
        // Girl extends User, so fullName and avatarUrl are directly on girl
        // But API may return user relation, so check both
        name: girl.name || (girl.user?.fullName) || girl.fullName || 'Unknown',
        slug: girl.slug || undefined,
        avatarUrl: girl.avatarUrl || (girl.user?.avatarUrl) || undefined,
      }));
      setGirls(girlsList);
    } catch (error) {
      console.error('Failed to search girls:', error);
      setGirls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      setIsOpen(true);
      searchGirls(query);
    } else {
      setIsOpen(false);
      setGirls([]);
    }
  };

  const handleSelectGirl = (girl: Girl) => {
    setSelectedGirl(girl);
    setSearchQuery('');
    setIsOpen(false);
    onChange(girl.id);
  };

  const handleRemove = () => {
    setSelectedGirl(null);
    setSearchQuery('');
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Girl Tag */}
      {selectedGirl && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              {selectedGirl.avatarUrl ? (
                <img src={selectedGirl.avatarUrl} alt={selectedGirl.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{selectedGirl.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="text-sm font-medium text-text">{selectedGirl.name}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="ml-1 p-0.5 hover:bg-primary/20 rounded transition-colors cursor-pointer"
              aria-label="Xóa tag"
            >
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      {!selectedGirl && (
        <>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim() && girls.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-background-light border border-secondary/30 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-text"
          />

          {/* Dropdown Results */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-background border border-secondary/30 rounded-xl shadow-xl shadow-black/20 max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-text-muted">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-sm">Đang tìm kiếm...</span>
                </div>
              ) : girls.length > 0 ? (
                <div className="py-2">
                  {girls.map((girl) => (
                    <button
                      key={girl.id}
                      type="button"
                      onClick={() => handleSelectGirl(girl)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors duration-150 cursor-pointer text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        {girl.avatarUrl ? (
                          <img src={girl.avatarUrl} alt={girl.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-primary text-sm font-bold">{girl.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{girl.name}</p>
                        {girl.slug && (
                          <p className="text-xs text-text-muted truncate">@{girl.slug}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-4 text-center text-text-muted text-sm">
                  Không tìm thấy gái gọi nào
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

