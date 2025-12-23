'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getFullImageUrl } from '@/lib/utils/image';

interface ImageLightboxProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

export default function ImageLightbox({ images, currentIndex, onClose, onNext, onPrev }: ImageLightboxProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/95 z-[200] animate-fadeIn"
                onClick={onClose}
            />

            {/* Lightbox Content */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-3 text-white hover:text-primary transition-colors bg-black/50 rounded-full backdrop-blur-sm z-10"
                    aria-label="Đóng"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Previous Button */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-4 p-3 text-white hover:text-primary transition-colors bg-black/50 rounded-full backdrop-blur-sm z-10"
                        aria-label="Ảnh trước"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Image */}
                <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
                    <Image
                        src={getFullImageUrl(images[currentIndex])}
                        alt={`Image ${currentIndex + 1}`}
                        fill
                        referrerPolicy="no-referrer"
                        className="object-contain rounded-lg"
                        sizes="100vw"
                        priority
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Next Button */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-4 p-3 text-white hover:text-primary transition-colors bg-black/50 rounded-full backdrop-blur-sm z-10"
                        aria-label="Ảnh tiếp"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm text-white text-sm z-10">
                    {currentIndex + 1} / {images.length}
                </div>
            </div>
        </>
    );
}
