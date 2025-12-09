import type { Metadata } from 'next';
import ReviewsPageClient from '@/components/pages/ReviewsPageClient';

export const metadata: Metadata = {
  title: 'Đánh giá gái gọi - Review từ khách hàng thực | Tìm Gái gọi',
  description: 'Xem đánh giá, review gái gọi từ khách hàng thực. Chia sẻ trải nghiệm và tìm gái gọi chất lượng qua các đánh giá uy tín.',
  keywords: [
    'đánh giá gái gọi', 'review gái gọi', 'nhận xét gái gọi',
    'gái gọi uy tín', 'gái gọi chất lượng', 'feedback gái gọi',
  ],
};

export default function ReviewsPage() {
  return <ReviewsPageClient />;
}
