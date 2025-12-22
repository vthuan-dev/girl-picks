import type { Metadata } from 'next';
import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

// Dynamic import với error boundary
const ReviewsPageClient = dynamicImport(
  () => import('@/components/pages/ReviewsPageClient'),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-background-light rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/30"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary/30 rounded w-1/3"></div>
                  <div className="h-20 bg-secondary/30 rounded w-full mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Đánh giá gái gọi - Review từ khách hàng thực | Tìm Gái gọi',
  description: 'Xem đánh giá, review gái gọi từ khách hàng thực. Chia sẻ trải nghiệm và tìm gái gọi chất lượng qua các đánh giá uy tín.',
  keywords: [
    'đánh giá gái gọi', 'review gái gọi', 'nhận xét gái gọi',
    'gái gọi uy tín', 'gái gọi chất lượng', 'feedback gái gọi',
  ],
};

export default function ReviewsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-background-light rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/30"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary/30 rounded w-1/4"></div>
                  <div className="h-3 bg-secondary/30 rounded w-1/3"></div>
                  <div className="h-20 bg-secondary/30 rounded w-full mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ReviewsPageClient />
    </Suspense>
  );
}
