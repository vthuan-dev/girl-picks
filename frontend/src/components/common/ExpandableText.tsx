'use client';

import { useState } from 'react';

interface ExpandableTextProps {
  text: string | null | undefined;
  maxLength?: number;
  className?: string;
  showButton?: boolean;
}

const DEFAULT_MAX_LENGTH = 150; // Số ký tự hiển thị ban đầu

export default function ExpandableText({ 
  text, 
  maxLength = DEFAULT_MAX_LENGTH,
  className = '',
  showButton = true
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || !text.trim()) {
    return null;
  }

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? text : `${text.substring(0, maxLength)}...`;

  return (
    <div className={className}>
      <p className="text-text-muted leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      
      {shouldTruncate && showButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium text-sm cursor-pointer group"
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
    </div>
  );
}

