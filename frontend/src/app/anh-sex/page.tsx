'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
 import Pagination from '@/components/common/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import { albumsApi, Album } from '@/modules/albums/api/albums.api';

export default function AnhSexPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await albumsApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
      });
      setAlbums(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch albums:', error);
      setAlbums([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, total);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: 'Ảnh sex',
          description: 'Xem ảnh sex chất lượng cao, ảnh nóng, ảnh gái xinh và nhiều bộ sưu tập ảnh đẹp khác',
          url: `${siteUrl}/anh-sex`,
          numberOfItems: albums.length,
        }}
      />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Ảnh sex</h1>
              <p className="text-sm text-text-muted">
              {loading ? 'Đang tải...' : (
                <>Hiển thị {startIndex + 1} – {endIndex} / <span className="text-primary font-semibold">{total}</span> album</>
              )}
            </p>
          </div>
          <div className="text-xs text-text-muted">Bộ sưu tập ảnh</div>
        </div>

        {/* Albums Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-background-light border border-secondary/25 rounded-md overflow-hidden animate-pulse">
                <div className="w-full aspect-[4/5] bg-secondary/30"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-text-muted">
            <p className="text-base sm:text-lg">Không tìm thấy album</p>
            <p className="text-xs sm:text-sm mt-1">Thử thay đổi bộ lọc của bạn</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/anh-sex/${album.id}`}
                  className="group bg-background-light border border-secondary/30 rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all"
                >
                  <div className="relative w-full aspect-[4/5] bg-background">
                    {album.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">No cover</div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                      {(album._count?.images || 0)} ảnh
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold text-text line-clamp-2">{album.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

