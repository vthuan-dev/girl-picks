import type { Metadata } from 'next';
import ChatSexPageClient from '@/components/pages/ChatSexPageClient';
import StructuredData from '@/components/seo/StructuredData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  title: 'Chat sex - Trò chuyện và tán gẫu online',
  description: 'Chat sex, trò chuyện online với gái xinh, tán gẫu, làm quen, kết bạn. Nền tảng chat an toàn, kín đáo và thú vị.',
  keywords: [
    'chat sex', 'chat online', 'trò chuyện online', 'tán gẫu', 'làm quen',
    'kết bạn online', 'chat với gái xinh', 'chat video', 'chat webcam',
    'chat sex việt nam', 'chat sex sài gòn', 'chat sex hà nội', 'chat sex miễn phí',
    'chat sex không cần đăng ký', 'chat sex ẩn danh', 'chat sex an toàn',
    'chat sex kín đáo', 'chat sex nhanh', 'chat sex đa dạng', 'chat sex theo sở thích'
  ],
  alternates: {
    canonical: `${siteUrl}/chat-sex`,
  },
  openGraph: {
    title: 'Chat sex - Trò chuyện và tán gẫu online',
    description: 'Chat sex, trò chuyện online với gái xinh, tán gẫu, làm quen, kết bạn',
    url: `${siteUrl}/chat-sex`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Chat sex - Trò chuyện và tán gẫu online',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat sex - Trò chuyện và tán gẫu online',
    description: 'Chat sex, trò chuyện online với gái xinh, tán gẫu, làm quen, kết bạn',
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

export default function ChatSexPage() {
  return (
    <>
      <StructuredData
        type="CollectionPage"
        data={{
          name: 'Chat sex',
          description: 'Chat sex, trò chuyện online với gái xinh, tán gẫu, làm quen, kết bạn',
          url: `${siteUrl}/chat-sex`,
        }}
      />
      <ChatSexPageClient />
    </>
  );
}
