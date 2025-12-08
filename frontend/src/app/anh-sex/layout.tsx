import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Ảnh sex - Xem ảnh nóng, ảnh gái xinh chất lượng cao',
  description: 'Xem ảnh sex, ảnh nóng, ảnh gái xinh chất lượng cao. Bộ sưu tập ảnh đẹp, ảnh dâm, ảnh sexy đa dạng. Cập nhật ảnh mới nhất mỗi ngày.',
  keywords: [
    'ảnh sex', 'ảnh nóng', 'ảnh gái xinh', 'ảnh dâm', 'ảnh sexy', 'ảnh đẹp',
    'ảnh sex việt nam', 'ảnh sex nhật bản', 'ảnh sex hàn quốc', 'ảnh sex châu á',
    'xem ảnh sex', 'ảnh sex online', 'ảnh sex miễn phí', 'ảnh sex mới nhất',
    'ảnh sex hay nhất', 'ảnh sex chất lượng cao', 'ảnh sex hd', 'ảnh sex 4k',
    'ảnh sex đa dạng', 'ảnh sex theo thể loại', 'ảnh gái xinh không che',
    'ảnh gái xinh đẹp', 'ảnh hot girl', 'ảnh người mẫu', 'ảnh chân dài',
    'ảnh eo thon', 'ảnh mông to', 'ảnh ngực khủng', 'ảnh da trắng'
  ],
  alternates: {
    canonical: `${siteUrl}/anh-sex`,
  },
  openGraph: {
    title: 'Ảnh sex - Xem ảnh nóng, ảnh gái xinh chất lượng cao',
    description: 'Xem ảnh sex, ảnh nóng, ảnh gái xinh chất lượng cao. Bộ sưu tập ảnh đẹp, ảnh dâm, ảnh sexy đa dạng',
    url: `${siteUrl}/anh-sex`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Ảnh sex - Xem ảnh nóng, ảnh gái xinh chất lượng cao',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ảnh sex - Xem ảnh nóng, ảnh gái xinh chất lượng cao',
    description: 'Xem ảnh sex, ảnh nóng, ảnh gái xinh chất lượng cao. Bộ sưu tập ảnh đẹp, ảnh dâm, ảnh sexy đa dạng',
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
