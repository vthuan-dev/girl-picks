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
  },
  robots: {
    index: true,
    follow: true,
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

