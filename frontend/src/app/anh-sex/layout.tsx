import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

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
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AnhSexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

