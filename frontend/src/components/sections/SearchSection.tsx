'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/girls?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="py-12 bg-background-light border-y border-secondary/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-background rounded-lg border-2 border-secondary/50 focus-within:border-primary transition-colors shadow-lg">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo tên, địa điểm, tags..."
                className="w-full px-6 py-4 bg-transparent text-text placeholder:text-text-muted focus:outline-none text-lg"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white rounded-r-lg hover:bg-primary-hover transition-colors font-semibold"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          <button className="px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors text-sm">
            Verified Only
          </button>
          <button className="px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors text-sm">
            Available Now
          </button>
          <button className="px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors text-sm">
            High Rating
          </button>
          <button className="px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors text-sm">
            Newest
          </button>
        </div>
      </div>
    </section>
  );
}

