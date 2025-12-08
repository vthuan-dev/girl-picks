import type { Metadata } from 'next';
import PhimSexPageClient from '@/components/pages/PhimSexPageClient';
import StructuredData from '@/components/seo/StructuredData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Phim sex - Xem phim người lớn chất lượng cao',
  description: 'Xem phim sex, phim người lớn chất lượng cao, phim 18+, sex tự quay, sex việt nam, sex nhật bản, sex hàn quốc. Cập nhật phim mới nhất mỗi ngày.',
  keywords: [
    'phim sex', 'phim người lớn', 'phim 18+', 'sex tự quay', 'sex việt nam',
    'sex nhật bản', 'sex hàn quốc', 'phim sex việt nam', 'phim sex nhật bản',
    'phim sex hàn quốc', 'phim sex châu á', 'phim sex jav', 'phim sex hd',
    'xem phim sex', 'phim sex online', 'phim sex miễn phí', 'phim sex mới nhất',
    'phim sex hay nhất', 'phim sex chất lượng cao', 'video sex', 'clip sex',
    'phim sex không che', 'phim sex full hd', 'phim sex 4k', 'phim sex nhanh',
    'phim sex không lag', 'phim sex đa dạng', 'phim sex theo thể loại'
  ],
  alternates: {
    canonical: `${siteUrl}/phim-sex`,
  },
  openGraph: {
    title: 'Phim sex - Xem phim người lớn chất lượng cao',
    description: 'Xem phim sex, phim người lớn chất lượng cao, phim 18+, sex tự quay, sex việt nam, sex nhật bản, sex hàn quốc',
    url: `${siteUrl}/phim-sex`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Phim sex - Xem phim người lớn chất lượng cao',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phim sex - Xem phim người lớn chất lượng cao',
    description: 'Xem phim sex, phim người lớn chất lượng cao, phim 18+, sex tự quay, sex việt nam',
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

export default function PhimSexPage() {
  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: 'Phim sex',
          description: 'Xem phim sex, phim người lớn chất lượng cao, phim 18+, sex tự quay, sex việt nam, sex nhật bản, sex hàn quốc',
          url: `${siteUrl}/phim-sex`,
        }}
      />
      <PhimSexPageClient />
    </>
  );
}
