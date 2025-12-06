'use client';

import Link from 'next/link';
import { useState } from 'react';

// Mock popular tags data - in real app, this would come from API
const popularTags = [
  { name: 'gái gọi', count: 12580, icon: '🔥' },
  { name: 'gaigu', count: 8930, icon: '⭐' },
  { name: 'gái gọi sài gòn', count: 6540, icon: '📍' },
  { name: 'gái gọi cao cấp', count: 5230, icon: '💎' },
  { name: 'Gaigoi', count: 4890, icon: '✨' },
  { name: 'gái gọi kỹ nữ', count: 4120, icon: '🎭' },
  { name: 'gái gọi vú to', count: 3890, icon: '💋' },
  { name: 'gái gọi hà nội', count: 3650, icon: '🏛️' },
  { name: 'Ngon', count: 3420, icon: '😋' },
  { name: 'gái dâm', count: 3210, icon: '🔥' },
  { name: 'gái gọi quận 10', count: 2980, icon: '📍' },
  { name: 'gái xinh', count: 2750, icon: '💕' },
  { name: 'gái gọi kynu', count: 2540, icon: '🎯' },
  { name: 'Gái Gọi Sài Gòn', count: 2330, icon: '🌆' },
  { name: 'gái gọi giá rẻ', count: 2120, icon: '💰' },
  { name: 'vú to', count: 1980, icon: '💋' },
];

export default function PopularTags() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    // In real app, this would filter the results
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-background-light rounded-xl border border-secondary/30 p-4 lg:p-5 sticky top-20 shadow-lg shadow-black/10">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-secondary/30">
          <div className="w-1 h-6 bg-primary rounded-full"></div>
          <h2 className="text-lg font-bold text-text">
            Tags phổ biến
          </h2>
        </div>
        <div className="space-y-2">
          {popularTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag.name)}
              className={`
                group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                transition-all duration-300 text-left cursor-pointer overflow-hidden
                ${
                  selectedTag === tag.name
                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-2 border-primary/60 shadow-lg shadow-primary/20 transform scale-[1.02]'
                    : 'bg-background hover:bg-background-light border border-secondary/20 hover:border-primary/40 text-text-muted hover:text-text hover:shadow-md hover:shadow-primary/5'
                }
              `}
            >
              {/* Gradient overlay on hover */}
              {!selectedTag || selectedTag !== tag.name ? (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              ) : null}
              
              <div className="relative flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-base flex-shrink-0">{tag.icon}</span>
                <span className="text-sm font-medium truncate">{tag.name}</span>
              </div>
              
              <span className={`
                relative text-xs font-bold ml-2 flex-shrink-0 px-2 py-0.5 rounded-md transition-all duration-300
                ${
                  selectedTag === tag.name
                    ? 'bg-primary/30 text-primary'
                    : 'bg-secondary/20 text-text-muted group-hover:bg-primary/10 group-hover:text-primary'
                }
              `}>
                {tag.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

