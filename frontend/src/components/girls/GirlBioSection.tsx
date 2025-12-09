'use client';

import { useState } from 'react';

interface GirlBioSectionProps {
  bio: string | null | undefined;
}

const MAX_LENGTH = 200; // Số ký tự hiển thị ban đầu

export default function GirlBioSection({ bio }: GirlBioSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!bio || !bio.trim()) {
    return null;
  }

  const shouldTruncate = bio.length > MAX_LENGTH;
  const displayText = isExpanded || !shouldTruncate ? bio : `${bio.substring(0, MAX_LENGTH)}...`;

  return (
    <>
      <div className="prose prose-invert max-w-none">
        <p className="text-text-muted leading-relaxed whitespace-pre-line">
          {displayText}
        </p>
      </div>
      
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium text-sm cursor-pointer group"
        >
          <span>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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

