'use client';

import { useState } from 'react';
import ImageLightbox from '@/components/common/ImageLightbox';

interface ReviewImageGalleryProps {
    images: string[];
}

export default function ReviewImageGallery({ images }: ReviewImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Single image layout
    if (images.length === 1) {
        return (
            <>
                <div className="mt-3 rounded-lg overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
                    <img
                        src={images[0]}
                        alt="Review image"
                        className="w-full h-auto object-contain max-h-[500px] hover:opacity-90 transition-opacity"
                    />
                </div>
                {lightboxOpen && (
                    <ImageLightbox
                        images={images}
                        currentIndex={currentImageIndex}
                        onClose={() => setLightboxOpen(false)}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                )}
            </>
        );
    }

    // 2-3 images: Simple grid
    if (images.length <= 3) {
        return (
            <>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`relative cursor-pointer overflow-hidden rounded-lg ${images.length === 3 && index === 0 ? 'col-span-2' : ''
                                }`}
                            onClick={() => openLightbox(index)}
                        >
                            <img
                                src={img}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-full object-cover hover:opacity-90 transition-opacity aspect-square"
                            />
                        </div>
                    ))}
                </div>
                {lightboxOpen && (
                    <ImageLightbox
                        images={images}
                        currentIndex={currentImageIndex}
                        onClose={() => setLightboxOpen(false)}
                        onNext={handleNext}
                        onPrev={handlePrev}
                    />
                )}
            </>
        );
    }

    // 4+ images: Hero + Thumbnails layout (like reference)
    return (
        <>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg overflow-hidden max-h-[500px]">
                {/* Hero Image (Left - 2 columns) */}
                <div
                    className="col-span-2 row-span-3 relative cursor-pointer overflow-hidden rounded-lg bg-background"
                    onClick={() => openLightbox(0)}
                >
                    <img
                        src={images[0]}
                        alt="Main review image"
                        className="w-full h-full object-contain hover:opacity-90 transition-opacity"
                    />
                </div>

                {/* Thumbnail Images (Right - 3 rows) */}
                {images.slice(1, 4).map((img, index) => (
                    <div
                        key={index + 1}
                        className="relative cursor-pointer overflow-hidden rounded-lg bg-background"
                        onClick={() => openLightbox(index + 1)}
                    >
                        <img
                            src={img}
                            alt={`Review image ${index + 2}`}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity aspect-square"
                        />
                    </div>
                ))}

                {/* More images overlay */}
                {images.length > 4 && (
                    <div
                        className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer hover:bg-black/80 transition-colors"
                        onClick={() => openLightbox(4)}
                    >
                        +{images.length - 4} ảnh
                    </div>
                )}
            </div>

            {lightboxOpen && (
                <ImageLightbox
                    images={images}
                    currentIndex={currentImageIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNext={handleNext}
                    onPrev={handlePrev}
                />
            )}
        </>
    );
}
