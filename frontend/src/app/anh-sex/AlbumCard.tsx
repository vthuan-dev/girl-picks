/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Album } from '@/modules/albums/api/albums.api';

interface AlbumCardProps {
  album: Album;
  images?: string[];
}

const SLIDE_INTERVAL = 3000;

export default function AlbumCard({ album, images }: AlbumCardProps) {
  const displayImages = useMemo(() => {
    const unique = Array.from(new Set(images && images.length ? images : album.coverUrl ? [album.coverUrl] : []));
    return unique.length ? unique : album.coverUrl ? [album.coverUrl] : [];
  }, [album.coverUrl, images]);

  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAuto = () => {
    if (displayImages.length <= 1) return;
    clearInterval(timerRef.current as any);
    timerRef.current = setInterval(() => {
      setIndex((prev) => {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const next = (prev + dir + displayImages.length) % displayImages.length;
        return next;
      });
    }, SLIDE_INTERVAL);
  };

  useEffect(() => {
    startAuto();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displayImages.length]);

  if (!displayImages.length) {
    return (
      <Link
        href={`/anh-sex/${album.id}`}
        className="group bg-background-light border border-secondary/30 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all"
      >
        <div className="relative w-full aspect-[4/5] bg-background flex items-center justify-center text-text-muted text-sm">
          No cover
        </div>
        <div className="p-3 space-y-1">
          <p className="text-sm font-semibold text-text line-clamp-2">{album.title}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/anh-sex/${album.id}`}
      className="group bg-background-light border border-secondary/30 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all"
      onMouseEnter={() => {
        if (timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={() => {
        startAuto();
      }}
    >
      <div className="relative w-full aspect-[4/5] bg-background overflow-hidden">
        {displayImages.map((src, i) => {
          const isActive = i === index;
          return (
            <img
              key={src + i}
              src={src}
              alt={album.title}
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
            />
          );
        })}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
          {(album._count?.images || displayImages.length || 0)} ảnh
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-text line-clamp-2">{album.title}</p>
      </div>
    </Link>
  );
}

