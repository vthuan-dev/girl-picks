import type { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import HomePageClient from '@/components/pages/HomePageClient';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Gái gọi - Tìm kiếm và đặt lịch dịch vụ giải trí',
  description: 'Tìm kiếm gái gọi chuyên nghiệp, đáng tin cậy tại Sài Gòn, Hà Nội và các tỉnh thành khác. Xem thông tin chi tiết, đánh giá và đặt lịch dịch vụ giải trí chất lượng cao.',
  keywords: [
    'gái gọi', 'gaigu', 'gaigoi', 'gái gọi sài gòn', 'gái gọi hà nội', 'gái gọi cao cấp',
    'gái gọi giá rẻ', 'gái gọi quận 10', 'gái gọi quận 8', 'gái gọi bình dương',
    'gái gọi đà nẵng', 'gái gọi cần thơ', 'gái gọi online', 'gái gọi kỹ nữ',
    'tìm gái gọi', 'gái gọi xinh', 'gái gọi vú to', 'gái gọi làm tình',
    'gái dâm', 'gái xinh', 'hot girl', 'sinh viên', 'người mẫu', 'chân dài',
    'eo thon', 'mông to', 'ngực khủng', 'da trắng', 'dịch vụ giải trí',
    'gái gọi kynu', 'gái gọi thuận an', 'gái gọi hàng ngon', 'gái gọi kín đáo',
    'gái gọi uy tín', 'gái gọi chất lượng', 'gái gọi đảm bảo', 'gái gọi an toàn',
    'tìm gái gọi sài gòn', 'tìm gái gọi hà nội', 'gái gọi tại nhà', 'gái gọi khách sạn'
  ],
  alternates: {
    canonical: `${siteUrl}`,
  },
  openGraph: {
    title: 'Gái gọi - Tìm kiếm và đặt lịch dịch vụ giải trí',
    description: 'Tìm kiếm gái gọi chuyên nghiệp, đáng tin cậy tại Sài Gòn, Hà Nội và các tỉnh thành khác',
    url: `${siteUrl}`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Tìm Gái gọi - Nền tảng đặt lịch dịch vụ giải trí',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gái gọi - Tìm kiếm và đặt lịch dịch vụ giải trí',
    description: 'Tìm kiếm gái gọi chuyên nghiệp, đáng tin cậy tại Sài Gòn, Hà Nội và các tỉnh thành khác',
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

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

  return (
    <>
      <StructuredData
        type="ItemList"
        data={{
          name: 'Danh sách Gái gọi',
          description: 'Danh sách các gái gọi chuyên nghiệp, đáng tin cậy',
          url: `${siteUrl}`,
        }}
      />
      <HomePageClient />
    </>
  );
}
