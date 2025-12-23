import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StructuredData from '@/components/seo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tìm Gái gọi - Nền tảng đặt lịch dịch vụ giải trí',
    template: '%s | Tìm Gái gọi',
  },
  description: 'Kết nối với những người bạn đồng hành chuyên nghiệp, đáng tin cậy và thú vị. Tìm kiếm và đặt lịch dịch vụ giải trí chất lượng cao.',
  keywords: [
    'gái gọi', 'gaigu', 'gaigoi', 'gái gọi sài gòn', 'gái gọi hà nội', 'gái gọi cao cấp',
    'gái gọi giá rẻ', 'gái gọi quận 10', 'gái gọi quận 8', 'gái gọi bình dương',
    'gái gọi đà nẵng', 'gái gọi cần thơ', 'gái gọi online', 'gái gọi kỹ nữ',
    'dịch vụ giải trí', 'tìm gái gọi', 'gái gọi xinh', 'gái gọi vú to',
    'gái gọi làm tình', 'gái dâm', 'gái xinh', 'hot girl', 'sinh viên',
    'người mẫu', 'chân dài', 'eo thon', 'mông to', 'ngực khủng', 'da trắng',
    'phim sex', 'sex tự quay', 'sex việt nam', 'sex nhật bản', 'sex hàn quốc',
    'chat sex', 'ảnh sex', 'video sex', 'phim người lớn', 'phim 18+',
    'gái gọi kynu', 'gái gọi thuận an', 'gái gọi hàng ngon', 'gái gọi kín đáo',
    'gái gọi uy tín', 'gái gọi chất lượng', 'gái gọi đảm bảo', 'gái gọi an toàn',
    'tìm gái gọi sài gòn', 'tìm gái gọi hà nội', 'gái gọi tại nhà', 'gái gọi khách sạn',
    'gái gọi chung cư', 'gái gọi đi chơi', 'gái gọi qua đêm', 'gái gọi tình một đêm'
  ],
  authors: [{ name: 'Girl Pick' }],
  creator: 'Girl Pick',
  publisher: 'Girl Pick',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: 'https://gaigu2.net/images/logo/logo.png?v=0.0.1',
    shortcut: 'https://gaigu2.net/images/logo/logo.png?v=0.0.1',
    apple: 'https://gaigu2.net/images/logo/logo.png?v=0.0.1',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: siteUrl,
    siteName: 'Tìm Gái gọi',
    title: 'Tìm Gái gọi - Nền tảng đặt lịch dịch vụ giải trí',
    description: 'Kết nối với những người bạn đồng hành chuyên nghiệp, đáng tin cậy và thú vị',
    images: [
      {
        url: 'https://gaigu2.net/images/logo/logo.png?v=0.0.1',
        width: 1200,
        height: 630,
        alt: 'Tìm Gái gọi Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tìm Gái gọi - Nền tảng đặt lịch dịch vụ giải trí',
    description: 'Kết nối với những người bạn đồng hành chuyên nghiệp, đáng tin cậy và thú vị',
    images: ['https://gaigu2.net/images/logo/logo.png?v=0.0.1'],
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
  verification: {
    google: 'LK7_qX7HnN_q_HBtYwQtNrY4cy8Kn_JjOCf_0JSquZI',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

import ClientLayout from '@/components/layout/ClientLayout';
import QueryProvider from '@/providers/QueryProvider';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { ChunkErrorHandler } from '@/components/common/ChunkErrorHandler';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ChunkErrorHandler />
        <QueryProvider>
          <PageViewTracker />
          <StructuredData
            type="Organization"
            data={{
              name: 'Tìm Gái gọi',
              url: siteUrl,
              logo: 'https://gaigu2.net/images/logo/logo.png?v=0.0.1',
              description: 'Nền tảng đặt lịch dịch vụ giải trí chuyên nghiệp',
              sameAs: [],
            }}
          />
          <StructuredData
            type="WebSite"
            data={{
              name: 'Tìm Gái gọi',
              url: siteUrl,
              description: 'Nền tảng đặt lịch dịch vụ giải trí chuyên nghiệp',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${siteUrl}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }}
          />
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1c1c1c',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff0000',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}

