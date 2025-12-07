import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StructuredData from '@/components/seo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Tìm Gái gọi - Nền tảng đặt lịch dịch vụ giải trí',
    template: '%s | Tìm Gái gọi',
  },
  description: 'Kết nối với những người bạn đồng hành chuyên nghiệp, đáng tin cậy và thú vị. Tìm kiếm và đặt lịch dịch vụ giải trí chất lượng cao.',
  keywords: ['gái gọi', 'gaigu', 'gái gọi sài gòn', 'gái gọi hà nội', 'dịch vụ giải trí', 'tìm gái gọi'],
  authors: [{ name: 'Girl Pick' }],
  creator: 'Girl Pick',
  publisher: 'Girl Pick',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: 'https://gaigu1.net/images/logo/logo.png?v=0.0.1',
    shortcut: 'https://gaigu1.net/images/logo/logo.png?v=0.0.1',
    apple: 'https://gaigu1.net/images/logo/logo.png?v=0.0.1',
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
        url: 'https://gaigu1.net/images/logo/logo.png?v=0.0.1',
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
    images: ['https://gaigu1.net/images/logo/logo.png?v=0.0.1'],
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
    google: 'imrKeLEUy2G3YJDgu2ugYH5p7I67wEJQqtjMhwpc040',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

import ClientLayout from '@/components/layout/ClientLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <StructuredData
          type="Organization"
          data={{
            name: 'Tìm Gái gọi',
            url: siteUrl,
            logo: 'https://gaigu1.net/images/logo/logo.png?v=0.0.1',
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
      </body>
    </html>
  );
}

