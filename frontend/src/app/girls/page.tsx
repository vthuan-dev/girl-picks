import type { Metadata } from 'next';
import { Suspense } from 'react';
import GirlsPageClient from '@/components/pages/GirlsPageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Danh sách Gái gọi',
  description: 'Xem danh sách đầy đủ các gái gọi chuyên nghiệp, đáng tin cậy. Lọc theo tỉnh thành, giá cả, độ tuổi và nhiều tiêu chí khác để tìm được người phù hợp nhất.',
  keywords: [
    'danh sách gái gọi', 'gái gọi', 'gaigu', 'gaigoi', 'gái gọi sài gòn', 'gái gọi hà nội',
    'gái gọi cao cấp', 'gái gọi giá rẻ', 'gái gọi quận 10', 'gái gọi quận 8',
    'gái gọi bình dương', 'gái gọi đà nẵng', 'gái gọi cần thơ', 'gái gọi online',
    'gái gọi kỹ nữ', 'tìm gái gọi', 'gái gọi xinh', 'gái gọi vú to', 'gái gọi làm tình',
    'gái dâm', 'gái xinh', 'hot girl', 'sinh viên', 'người mẫu', 'chân dài',
    'eo thon', 'mông to', 'ngực khủng', 'da trắng', 'lọc gái gọi', 'tìm kiếm gái gọi',
    'gái gọi theo tỉnh', 'gái gọi theo giá', 'gái gọi theo tuổi', 'gái gọi xác thực',
    'gái gọi mới nhất', 'gái gọi nổi bật', 'gái gọi được đánh giá cao'
  ],
  alternates: {
    canonical: `${siteUrl}/girls`,
  },
  openGraph: {
    title: 'Danh sách Gái gọi - Tìm kiếm dịch vụ giải trí',
    description: 'Xem danh sách đầy đủ các gái gọi chuyên nghiệp, đáng tin cậy',
    url: `${siteUrl}/girls`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Danh sách Gái gọi',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Danh sách Gái gọi - Tìm kiếm dịch vụ giải trí',
    description: 'Xem danh sách đầy đủ các gái gọi chuyên nghiệp, đáng tin cậy',
    images: [`${siteUrl}/images/logo/logo.png?v=0.0.1`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const dynamic = 'force-dynamic';

export default function GirlsPage() {
  return (
    <Suspense fallback={null}>
      <GirlsPageClient />
    </Suspense>
  );
}

