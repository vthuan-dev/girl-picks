import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Tìm kiếm Gái gọi - Tìm kiếm dịch vụ giải trí',
  description: 'Tìm kiếm gái gọi, dịch vụ giải trí theo tỉnh thành, giá cả, độ tuổi và nhiều tiêu chí khác. Tìm được người phù hợp nhất với nhu cầu của bạn.',
  keywords: [
    'tìm kiếm gái gọi', 'tìm gái gọi', 'search gái gọi', 'tìm kiếm dịch vụ giải trí',
    'tìm gái gọi sài gòn', 'tìm gái gọi hà nội', 'tìm gái gọi theo tỉnh',
    'tìm gái gọi theo giá', 'tìm gái gọi theo tuổi', 'tìm gái gọi xác thực',
    'lọc gái gọi', 'tìm kiếm nâng cao', 'gái gọi gần đây', 'gái gọi online',
    'gái gọi', 'gaigu', 'gaigoi', 'gái gọi cao cấp', 'gái gọi giá rẻ'
  ],
  alternates: {
    canonical: `${siteUrl}/search`,
  },
  openGraph: {
    title: 'Tìm kiếm Gái gọi - Tìm kiếm dịch vụ giải trí',
    description: 'Tìm kiếm gái gọi, dịch vụ giải trí theo tỉnh thành, giá cả, độ tuổi và nhiều tiêu chí khác',
    url: `${siteUrl}/search`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Tìm kiếm Gái gọi',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tìm kiếm Gái gọi - Tìm kiếm dịch vụ giải trí',
    description: 'Tìm kiếm gái gọi, dịch vụ giải trí theo tỉnh thành, giá cả, độ tuổi và nhiều tiêu chí khác',
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

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

