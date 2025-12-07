import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Ảnh sex - Xem ảnh sex chất lượng cao',
  description: 'Xem ảnh sex chất lượng cao, ảnh nóng, ảnh gái xinh và nhiều bộ sưu tập ảnh đẹp khác. Cập nhật ảnh mới hàng ngày.',
  keywords: ['ảnh sex', 'ảnh nóng', 'ảnh gái xinh', 'ảnh dâm', 'xem ảnh sex', 'ảnh sex chất lượng cao'],
  alternates: {
    canonical: `${siteUrl}/anh-sex`,
  },
  openGraph: {
    title: 'Ảnh sex - Xem ảnh sex chất lượng cao',
    description: 'Xem ảnh sex chất lượng cao, ảnh nóng, ảnh gái xinh và nhiều bộ sưu tập ảnh đẹp khác',
    url: `${siteUrl}/anh-sex`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Ảnh sex - Tìm Gái gọi',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ảnh sex - Xem ảnh sex chất lượng cao',
    description: 'Xem ảnh sex chất lượng cao, ảnh nóng, ảnh gái xinh và nhiều bộ sưu tập ảnh đẹp khác',
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

export default function AnhSexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

