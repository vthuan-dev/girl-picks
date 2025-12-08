'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { tagsApi, PopularTag } from '@/modules/tags/api/tags.api';

// Icon mapping for tags
const getTagIcon = (tagName: string): string => {
  const name = tagName.toLowerCase();
  if (name.includes('sài gòn') || name.includes('hà nội') || name.includes('quận')) {
    return '📍';
  }
  if (name.includes('cao cấp') || name.includes('premium')) {
    return '💎';
  }
  if (name.includes('xinh') || name.includes('đẹp')) {
    return '💕';
  }
  if (name.includes('giá rẻ') || name.includes('rẻ')) {
    return '💰';
  }
  if (name.includes('kỹ nữ') || name.includes('kynu')) {
    return '🎭';
  }
  if (name.includes('vú') || name.includes('ngực')) {
    return '💋';
  }
  return '🔥';
};

interface PopularTagsProps {
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
  source?: 'girls' | 'posts' | 'all'; // Source of tags
}

export default function PopularTags({ 
  onTagClick, 
  selectedTag: externalSelectedTag,
  source = 'girls' 
}: PopularTagsProps) {
  const router = useRouter();
  const [internalSelectedTag, setInternalSelectedTag] = useState<string | null>(null);
  const selectedTag = externalSelectedTag !== undefined ? externalSelectedTag : internalSelectedTag;

  // Fetch popular tags from API
  const { data: popularTags = [], isLoading, error } = useQuery<PopularTag[]>(
    ['popularTags', source],
    async () => {
      try {
        const result = await tagsApi.getPopularTags({ limit: 20, source });
        console.log('[PopularTags] Fetched tags:', result);
        return result;
      } catch (err) {
        console.error('[PopularTags] Error fetching tags:', err);
        throw err;
      }
    },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      retry: 2, // Retry 2 times on error
      retryDelay: 1000, // Wait 1 second between retries
    }
  );

  const handleTagClick = (tag: string) => {
    // Navigate to search page with tag query
    const searchUrl = `/search?q=${encodeURIComponent(tag)}&tag=${encodeURIComponent(tag)}`;
    router.push(searchUrl);
    
    // Also call onTagClick callback if provided (for local filtering)
    if (onTagClick) {
      onTagClick(tag);
    }
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
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-full h-10 bg-background rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="text-text-muted text-sm mb-2">
              Không thể tải tags
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-primary hover:text-primary-hover underline cursor-pointer"
            >
              Thử lại
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-red-400 mt-2">
                {error instanceof Error ? error.message : 'Unknown error'}
              </div>
            )}
          </div>
        ) : popularTags.length === 0 ? (
          <div className="text-center py-4 text-text-muted text-sm">
            Chưa có tags nào
          </div>
        ) : (
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
                <span className="text-base flex-shrink-0">{getTagIcon(tag.name)}</span>
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
        )}
      </div>
    </aside>
  );
}

