'use client';

import { useRouter } from 'next/navigation';
import PopularTags from '@/components/sections/PopularTags';
import LatestCommunityPosts from '@/components/sections/LatestCommunityPosts';

export default function HomePageClient() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8 pt-4 sm:pt-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
            Tìm Gái gọi
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Nền tảng đánh giá và tìm kiếm gái gọi uy tín
          </p>
        </div>
      </div>

      {/* Latest Community Posts */}
      <div className="mb-10">
        <LatestCommunityPosts />
      </div>

      {/* Popular Tags */}
      <div className="mt-8">
        <PopularTags />
      </div>
    </div>
  );
}
