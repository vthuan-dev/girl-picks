'use client';

import { useState, useEffect } from 'react';
import ImageCard from '@/components/images/ImageCard';
import ImageGalleryModal from '@/components/images/ImageGalleryModal';
 import Pagination from '@/components/common/Pagination';
import StructuredData from '@/components/seo/StructuredData';
import { postsApi } from '@/modules/posts/api/posts.api';
import { Post } from '@/types/post';

interface ImageItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  views: number;
  likes: number;
  category?: string;
  tags?: string[];
  post: Post;
  imageIndex: number;
}

export default function AnhSexPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postsApi.getAll({
        status: 'APPROVED',
        page: currentPage,
        limit: itemsPerPage,
        categoryId: selectedCategory || undefined,
      });

      // Extract images from posts
      const imageItems: ImageItem[] = [];
      (data.data || []).forEach((post: Post) => {
        // Parse images from post
        let postImages: string[] = [];
        if (post.images) {
          if (typeof post.images === 'string') {
            try {
              postImages = JSON.parse(post.images);
            } catch {
              postImages = [post.images];
            }
          } else if (Array.isArray(post.images)) {
            postImages = post.images;
          }
        }

        // Create image item for each image in the post
        postImages.forEach((imageUrl, index) => {
          imageItems.push({
            id: `${post.id}-${index}`,
            title: post.title,
            url: imageUrl,
            thumbnail: imageUrl,
            views: post.viewCount || post._count?.likes || 0,
            likes: post._count?.likes || 0,
            category: (post.category as any)?.name,
            tags: Array.isArray(post.tags) ? post.tags : [],
            post,
            imageIndex: index,
          });
        });
      });

      setImages(imageItems);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch images:', error);
      setImages([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: ImageItem) => {
    setSelectedPost(image.post);
    setSelectedImageIndex(image.imageIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  // Calculate pagination - based on images count, not posts count
  const totalPages = Math.ceil(images.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, images.length);
  const currentImages = images.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: 'Ảnh sex',
          description: 'Xem ảnh sex chất lượng cao, ảnh nóng, ảnh gái xinh và nhiều bộ sưu tập ảnh đẹp khác',
          url: `${siteUrl}/anh-sex`,
          numberOfItems: images.length,
        }}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                Ảnh sex
              </h1>
              <p className="text-sm text-text-muted">
                {loading ? (
                  'Đang tải...'
                ) : (
                  <>
                    Hiển thị {startIndex + 1} tới {endIndex} của <span className="text-primary font-semibold">{images.length}</span> ảnh
                  </>
                )}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button className="px-3 lg:px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary transition-colors text-sm flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Lọc
              </button>
              <button className="px-3 lg:px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary transition-colors text-sm flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Sắp xếp
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters - Simplified, using same categories as PhimSexPage */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-text uppercase tracking-wide">
              Danh mục
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`
                group relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold
                transition-all duration-300 cursor-pointer overflow-hidden
                ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl shadow-primary/40 transform scale-105 border-2 border-primary/80'
                    : 'bg-background-light border border-secondary/50 text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:transform hover:scale-105'
                }
              `}
            >
              {selectedCategory === null && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}
              <span className="inline-block mr-1.5">📸</span>
              <span className="relative">Tất cả</span>
              {selectedCategory === null && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Images Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-background-light border border-secondary/30 rounded-lg overflow-hidden animate-pulse">
                <div className="w-full aspect-[3/4] bg-secondary/30"></div>
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-secondary/30 rounded w-3/4"></div>
                  <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-text-muted mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-text-muted text-base sm:text-lg">Không tìm thấy ảnh</p>
            <p className="text-text-muted text-xs sm:text-sm mt-2">Thử thay đổi bộ lọc của bạn</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              {currentImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onClick={() => handleImageClick(image)}
                />
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

        {/* Image Gallery Modal */}
        <ImageGalleryModal
          post={selectedPost}
          initialImageIndex={selectedImageIndex}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}

