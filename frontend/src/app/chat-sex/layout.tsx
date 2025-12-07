import type { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

export const metadata: Metadata = {
  title: 'Gái Chat - Chat sex trực tuyến với gái gọi',
  description: 'Xem và chat với gái chat online. Danh sách gái chat đang online, video chat sex chất lượng cao. Tìm kiếm theo hashtags: Thủ dâm, Dâm thuỷ, Khẩu dâm, Mông to, Vú to và nhiều hơn nữa.',
  keywords: ['gái chat', 'chat sex', 'gái chat online', 'chat trực tuyến', 'gái gọi chat', 'video chat sex', 'thủ dâm', 'dâm thuỷ', 'khẩu dâm'],
  alternates: {
    canonical: `${siteUrl}/chat-sex`,
  },
  openGraph: {
    title: 'Gái Chat - Chat sex trực tuyến với gái gọi',
    description: 'Xem và chat với gái chat online. Danh sách gái chat đang online, video chat sex chất lượng cao.',
    url: `${siteUrl}/chat-sex`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Gái Chat - Tìm Gái gọi',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gái Chat - Chat sex trực tuyến với gái gọi',
    description: 'Xem và chat với gái chat online. Danh sách gái chat đang online, video chat sex chất lượng cao.',
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

export default function ChatSexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: 'Gái Chat',
          description: 'Danh sách gái chat đang online, video chat sex chất lượng cao',
          url: `${siteUrl}/chat-sex`,
        }}
      />
      {children}
    </>
  );
}

