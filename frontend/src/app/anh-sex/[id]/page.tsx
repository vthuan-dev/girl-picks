'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import StructuredData from '@/components/seo/StructuredData';
import { albumsApi, Album } from '@/modules/albums/api/albums.api';
import { getFullImageUrl } from '@/lib/utils/image';

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params?.id as string;
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const fetchAlbum = useCallback(async () => {
    if (!albumId) return;
    setLoading(true);
    try {
      const data = await albumsApi.getById(albumId);
      setAlbum(data);
    } catch (error) {
      console.error('Failed to load album', error);
      setAlbum(null);
    } finally {
      setLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

  const images = album?.images || [];

  const closeLightbox = () => {
    setIsLightboxVisible(false);
    setTimeout(() => setLightboxIndex(null), 180);
  };
  const showPrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! - 1 + images.length) % images.length);
  };
  const showNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! + 1) % images.length);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {album && (
        <StructuredData
          type="CollectionPage"
          data={{
            name: album.title,
            description: album.description || album.title,
            url: `${siteUrl}/anh-sex/${album.id}`,
            numberOfItems: images.length,
          }}
        />
      )}

      <div className="mb-4">
        <Link href="/anh-sex" className="text-sm text-primary hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-background-light border border-secondary/20 rounded-md overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-secondary/30"></div>
            </div>
          ))}
        </div>
      ) : !album ? (
        <div className="text-text-muted">Album không tồn tại.</div>
      ) : (
        <>
          <div className="space-y-1 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-text">{album.title}</h1>
            {album.description && <p className="text-text-muted text-sm">{album.description}</p>}
            <p className="text-xs text-text-muted">{images.length} ảnh</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => {
                  setLightboxIndex(idx);
                  requestAnimationFrame(() => setIsLightboxVisible(true));
                }}
                className="group relative aspect-square bg-background-light border border-secondary/20 rounded-md overflow-hidden hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all"
              >
                <Image
                  src={getFullImageUrl(img.url)}
                  alt={img.caption || album.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className={`fixed inset-0 z-50 bg-black/80 flex items-center justify-center transition-opacity duration-200 ${isLightboxVisible ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl px-3 py-2 bg-black/40 rounded-full hover:bg-black/60 z-10"
          >
            ✕
          </button>
          <button
            onClick={showPrev}
            className="absolute left-4 text-white text-2xl px-3 py-2 bg-black/40 rounded-full hover:bg-black/60 z-10"
          >
            ‹
          </button>
          <div className={`relative max-w-5xl w-full h-[80vh] mx-4 transform transition-transform duration-250 ease-out ${isLightboxVisible ? 'scale-100' : 'scale-90'}`}>
            <Image
              src={getFullImageUrl(images[lightboxIndex].url)}
              alt={images[lightboxIndex].caption || album?.title || ''}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              referrerPolicy="no-referrer"
            />
            {images[lightboxIndex].caption && (
              <p className="absolute -bottom-8 left-0 right-0 text-center text-sm text-white mt-2">{images[lightboxIndex].caption}</p>
            )}
          </div>
          <button
            onClick={showNext}
            className="absolute right-4 text-white text-2xl px-3 py-2 bg-black/40 rounded-full hover:bg-black/60 z-10"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

