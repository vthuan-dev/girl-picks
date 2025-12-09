'use client';

import { useState } from 'react';

interface GirlTagsSectionProps {
  tags: string[] | null | undefined;
  maxVisible?: number;
}

const DEFAULT_MAX_VISIBLE = 15; // Số tags hiển thị ban đầu

export default function GirlTagsSection({ tags, maxVisible = DEFAULT_MAX_VISIBLE }: GirlTagsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!tags || tags.length === 0) {
    return null;
  }

  const shouldTruncate = tags.length > maxVisible;
  const visibleTags = isExpanded || !shouldTruncate ? tags : tags.slice(0, maxVisible);

  return (
    <>
      {visibleTags.map((tag, index) => (
        <span key={index} className="flex items-center">
          <span className="text-text text-sm sm:text-base lg:text-lg font-medium">
            {tag}
          </span>
          {index < visibleTags.length - 1 && (
            <span className="mx-1 sm:mx-2 text-pink-500 text-lg sm:text-xl">❤️</span>
          )}
        </span>
      ))}
      
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-primary hover:text-primary-hover transition-colors font-medium text-sm sm:text-base cursor-pointer group ml-2"
        >
          <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </>
  );
}


