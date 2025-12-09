'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Post } from '@/types/post';

interface ImageGalleryModalProps {
  post: Post | null;
  initialImageIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageGalleryModal({
  post,
  initialImageIndex,
  isOpen,
  onClose,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (post) {
      // Parse images from post
      let parsedImages: string[] = [];
      if (post.images) {
        if (typeof post.images === 'string') {
          try {
            parsedImages = JSON.parse(post.images);
          } catch {
            parsedImages = [post.images];
          }
        } else if (Array.isArray(post.images)) {
          parsedImages = post.images;
        }
      }
      setImages(parsedImages);
      setCurrentIndex(Math.min(initialImageIndex, parsedImages.length - 1));
    }
  }, [post, initialImageIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!isOpen || !post || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-md rounded-full hover:bg-background transition-colors text-text hover:text-primary"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Main Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 z-10 p-3 bg-background/80 backdrop-blur-md rounded-full hover:bg-background transition-colors text-text hover:text-primary"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
          <Image
            src={currentImage}
            alt={post.title || 'Image'}
            fill
            className="object-contain"
            sizes="100vw"
            unoptimized
            priority
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 p-3 bg-background/80 backdrop-blur-md rounded-full hover:bg-background transition-colors text-text hover:text-primary"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-text text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Post Info */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-md p-4 rounded-lg max-w-md">
          <h3 className="text-text font-bold text-lg mb-2">{post.title}</h3>
          {post.author && (
            <p className="text-text-muted text-sm">
              Bởi: {post.author.fullName}
            </p>
          )}
          {post._count && (
            <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
              <span>👁️ {post._count.likes || 0} lượt xem</span>
              <span>💬 {post._count.comments || 0} bình luận</span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip (if multiple images) */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 overflow-x-auto px-4 pb-4">
          <div className="flex gap-2 justify-center max-w-7xl mx-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  index === currentIndex
                    ? 'border-primary scale-110'
                    : 'border-secondary/50 hover:border-primary/50'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

