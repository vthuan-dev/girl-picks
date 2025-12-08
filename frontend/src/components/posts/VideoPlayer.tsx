'use client';

import { useState, useRef, useEffect } from 'react';
import { VideoSource } from '@/types/post';

// Helper to get quality icon
const getQualityIcon = (label: string) => {
  if (label.includes('720') || label.includes('1080') || label.includes('HD')) {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

interface VideoPlayerProps {
  videoUrl: string;
  videoSources?: VideoSource[];
  poster?: string;
  onSourceChange?: (source: VideoSource | null) => void;
}

export default function VideoPlayer({ 
  videoUrl, 
  videoSources = [], 
  poster,
  onSourceChange 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const [selectedSource, setSelectedSource] = useState<VideoSource | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  // Check if Picture-in-Picture is supported
  useEffect(() => {
    if (videoRef.current && 'pictureInPictureEnabled' in document) {
      setIsPipSupported(true);
    }
  }, []);

  // Handle Picture-in-Picture events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPip = () => {
      setIsPipActive(true);
    };

    const handleLeavePip = () => {
      setIsPipActive(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPip);
    video.addEventListener('leavepictureinpicture', handleLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip);
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, []);

  // Handle source change
  useEffect(() => {
    if (selectedSource && onSourceChange) {
      onSourceChange(selectedSource);
    }
  }, [selectedSource, onSourceChange]);

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setIsQualityMenuOpen(false);
      }
    };

    if (isQualityMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQualityMenuOpen]);

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        // Exit PiP
        await document.exitPictureInPicture();
      } else {
        // Enter PiP
        if (document.pictureInPictureEnabled) {
          await video.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error('Error toggling Picture-in-Picture:', error);
    }
  };

  const handleSourceSelect = (source: VideoSource) => {
    setSelectedSource(source);
    setIsQualityMenuOpen(false);
    if (onSourceChange) {
      onSourceChange(source);
    }
  };

  const currentQualityLabel = selectedSource?.label || selectedSource?.resolution || 'Auto';

  const currentVideoUrl = selectedSource?.url || videoUrl;

  // Prevent drag and drop download
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden group select-none"
      onDragStart={handleDragStart}
      onDrag={(e) => e.preventDefault()}
      draggable={false}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        key={currentVideoUrl}
        controls
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture={false}
        poster={poster}
        className="w-full h-auto pointer-events-auto"
        preload="metadata"
        style={{ aspectRatio: '16/9' }}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onAuxClick={(e) => {
          // Disable middle mouse button download
          if (e.button === 1) {
            e.preventDefault();
            return false;
          }
        }}
        draggable={false}
      >
        <source src={currentVideoUrl} type={selectedSource?.type || 'video/mp4'} />
        Trình duyệt của bạn không hỗ trợ video tag.
      </video>

      {/* Picture-in-Picture Button */}
      {isPipSupported && (
        <button
          onClick={togglePictureInPicture}
          className={`
            absolute top-4 right-4 z-10
            p-2.5 rounded-lg
            backdrop-blur-md
            transition-all duration-300
            ${isPipActive 
              ? 'bg-primary text-white shadow-lg shadow-primary/50' 
              : 'bg-background/80 text-text hover:bg-background border border-secondary/50'
            }
            hover:scale-110 active:scale-95
            group-hover:opacity-100 opacity-0
          `}
          title={isPipActive ? 'Thoát Picture-in-Picture' : 'Bật Picture-in-Picture'}
          aria-label={isPipActive ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
        >
          {isPipActive ? (
            // Exit PiP icon
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" 
              />
            </svg>
          ) : (
            // Enter PiP icon
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
              />
            </svg>
          )}
        </button>
      )}

      {/* Video Quality Selector - Modern Dropdown */}
      {videoSources.length > 1 && (
        <div 
          ref={qualityMenuRef}
          className="absolute bottom-20 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="relative">
            {/* Quality Button */}
            <button
              onClick={() => setIsQualityMenuOpen(!isQualityMenuOpen)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-background/95 backdrop-blur-xl border border-secondary/50
                text-sm font-semibold text-text
                shadow-lg shadow-black/20
                hover:bg-background hover:border-primary/50
                hover:shadow-xl hover:shadow-primary/10
                active:scale-95
                transition-all duration-200 cursor-pointer
                ${isQualityMenuOpen ? 'bg-primary/10 border-primary/50 shadow-primary/20' : ''}
              `}
              aria-label="Chọn chất lượng video"
              aria-expanded={isQualityMenuOpen}
            >
              <svg 
                className="w-4 h-4 text-text-muted" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
                />
              </svg>
              <span className="text-text">{currentQualityLabel}</span>
              <svg 
                className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                  isQualityMenuOpen ? 'rotate-180' : ''
                }`}
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

            {/* Quality Dropdown Menu */}
            {isQualityMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-background/98 backdrop-blur-xl rounded-xl border border-secondary/50 shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-2">
                  <div className="px-3 py-2 mb-1">
                    <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      Chất lượng video
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {videoSources.map((source, index) => {
                      const isSelected = selectedSource?.url === source.url;
                      const label = source.label || source.resolution || `Quality ${index + 1}`;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSourceSelect(source)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-sm font-medium
                            transition-all duration-200 cursor-pointer
                            ${
                              isSelected
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'text-text hover:bg-background-light hover:text-primary'
                            }
                          `}
                          aria-label={`Chọn chất lượng ${label}`}
                        >
                          <span className={`flex-shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`}>
                            {getQualityIcon(label)}
                          </span>
                          <span className="flex-1 text-left">{label}</span>
                          {isSelected && (
                            <svg 
                              className="w-4 h-4 text-white flex-shrink-0" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PiP Active Indicator */}
      {isPipActive && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-primary/90 backdrop-blur-md rounded-lg text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
          </svg>
          <span>Picture-in-Picture</span>
        </div>
      )}
    </div>
  );
}

