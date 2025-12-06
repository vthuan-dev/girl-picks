import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

export const metadata: Metadata = {
  title: 'Phim sex - Xem phim sex chất lượng cao',
  description: 'Xem phim sex chất lượng cao, phim sex tự quay, phim sex Nhật Bản, phim sex Việt Nam và nhiều thể loại khác. Cập nhật phim mới hàng ngày.',
  keywords: ['phim sex', 'phim sex tự quay', 'phim sex nhật bản', 'phim sex việt nam', 'phim sex hàn quốc', 'xem phim sex'],
  alternates: {
    canonical: `${siteUrl}/phim-sex`,
  },
  openGraph: {
    title: 'Phim sex - Xem phim sex chất lượng cao',
    description: 'Xem phim sex chất lượng cao, phim sex tự quay, phim sex Nhật Bản và nhiều thể loại khác',
    url: `${siteUrl}/phim-sex`,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PhimSexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

