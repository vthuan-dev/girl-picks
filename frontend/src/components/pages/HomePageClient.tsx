'use client';

import { useRouter } from 'next/navigation';
import PopularTags from '@/components/sections/PopularTags';
import LatestCommunityPosts from '@/components/sections/LatestCommunityPosts';

export default function HomePageClient() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Page Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
              Tìm Gái gọi
            </h1>
            <p className="text-sm text-text-muted">
              Nền tảng đánh giá và tìm kiếm gái gọi uy tín
            </p>
          </div>
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
