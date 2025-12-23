import Image from 'next/image';
import { useState } from 'react';
import ImageLightbox from '@/components/common/ImageLightbox';
import { getFullImageUrl } from '@/lib/utils/image';

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

    // Single image layout - LARGER
    if (images.length === 1) {
        return (
            <>
                <div className="mt-4 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all relative aspect-video max-h-[600px]" onClick={() => openLightbox(0)}>
                    <Image
                        src={getFullImageUrl(images[0])}
                        alt="Review image"
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 80vw"
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

    // 2-3 images: Simple grid - LARGER
    if (images.length <= 3) {
        return (
            <>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl overflow-hidden">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`relative cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all group aspect-square ${images.length === 3 && index === 0 ? 'col-span-2' : ''
                                }`}
                            onClick={() => openLightbox(index)}
                        >
                            <Image
                                src={getFullImageUrl(img)}
                                alt={`Review image ${index + 1}`}
                                fill
                                referrerPolicy="no-referrer"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
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

    // 4+ images: Hero + Thumbnails layout - MUCH LARGER (like reference)
    return (
        <>
            <div className="mt-4 grid grid-cols-3 gap-1 overflow-hidden h-[800px]">
                {/* Hero Image (Left - 2 columns) - LARGER */}
                <div
                    className="col-span-2 row-span-3 relative cursor-pointer overflow-hidden transition-all group"
                    onClick={() => openLightbox(0)}
                >
                    <Image
                        src={getFullImageUrl(images[0])}
                        alt="Main review image"
                        fill
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>

                {/* Thumbnail Images (Right - 3 rows) - LARGER */}
                {images.slice(1, 4).map((img, index) => (
                    <div
                        key={index + 1}
                        className="relative cursor-pointer overflow-hidden transition-all group h-[266px]"
                        onClick={() => openLightbox(index + 1)}
                    >
                        <Image
                            src={getFullImageUrl(img)}
                            alt={`Review image ${index + 2}`}
                            fill
                            referrerPolicy="no-referrer"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>

                        {/* Show +N more on last thumbnail if more images exist */}
                        {images.length > 4 && index === 2 && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="text-white text-center">
                                    <div className="text-3xl font-bold mb-1">+{images.length - 4}</div>
                                    <div className="text-sm">ảnh khác</div>
                                </div>
                            </div>
                        )}
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
