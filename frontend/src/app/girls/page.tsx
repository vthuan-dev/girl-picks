import type { Metadata } from 'next';
import GirlList from '@/modules/girls/components/GirlList';
import LocationFilters from '@/components/sections/LocationFilters';
import PopularTags from '@/components/sections/PopularTags';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

export const metadata: Metadata = {
  title: 'Danh sách Gái gọi',
  description: 'Xem danh sách đầy đủ các gái gọi chuyên nghiệp, đáng tin cậy. Lọc theo tỉnh thành, giá cả, độ tuổi và nhiều tiêu chí khác để tìm được người phù hợp nhất.',
  keywords: ['danh sách gái gọi', 'gái gọi', 'gaigu', 'gái gọi sài gòn', 'gái gọi hà nội', 'tìm gái gọi'],
  alternates: {
    canonical: `${siteUrl}/girls`,
  },
  openGraph: {
    title: 'Danh sách Gái gọi - Tìm kiếm dịch vụ giải trí',
    description: 'Xem danh sách đầy đủ các gái gọi chuyên nghiệp, đáng tin cậy',
    url: `${siteUrl}/girls`,
    type: 'website',
    siteName: 'Tìm Gái gọi',
    images: [
      {
        url: `${siteUrl}/images/logo/logo.png?v=0.0.1`,
        width: 1200,
        height: 630,
        alt: 'Danh sách Gái gọi',
      },
    ],
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Danh sách Gái gọi - Tìm kiếm dịch vụ giải trí',
    description: 'Xem danh sách đầy đủ các gái gọi chuyên nghiệp, đáng tin cậy',
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

export default function GirlsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text mb-2">
                Gái gọi
              </h1>
              <p className="text-sm text-text-muted">
                Hiển thị 1 tới 60 của <span className="text-primary font-semibold">15,550</span> kết quả
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button className="px-3 lg:px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary transition-colors text-sm flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Lọc
              </button>
              <button className="px-3 lg:px-4 py-2 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-primary/10 hover:border-primary transition-colors text-sm flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Sắp xếp
              </button>
            </div>
          </div>
        </div>

        {/* Location Filters */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wide">
            Tỉnh thành
          </h2>
          <LocationFilters />
        </div>

        {/* Additional Filters */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-text uppercase tracking-wide">
              Bộ lọc
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 text-xs sm:text-sm font-semibold shadow-lg shadow-primary/30 cursor-pointer transform hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mới xác thực
              </span>
            </button>
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-xs sm:text-sm font-semibold cursor-pointer transform hover:scale-105">
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Giá
              </span>
            </button>
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-xs sm:text-sm font-semibold cursor-pointer transform hover:scale-105">
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Tuổi
              </span>
            </button>
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-xs sm:text-sm font-semibold cursor-pointer transform hover:scale-105">
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Chiều cao
              </span>
            </button>
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-xs sm:text-sm font-semibold cursor-pointer transform hover:scale-105">
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                Cân nặng
              </span>
            </button>
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-xs sm:text-sm font-semibold cursor-pointer transform hover:scale-105">
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xuất xứ
              </span>
            </button>
            <button className="group relative px-4 sm:px-5 py-2 sm:py-2.5 bg-background-light border border-secondary/50 rounded-lg text-text hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-xs sm:text-sm font-semibold cursor-pointer transform hover:scale-105">
              <span className="relative flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Vị trí
              </span>
            </button>
          </div>
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content - Girls Grid */}
          <div className="flex-1 min-w-0">
            <GirlList />
          </div>

          {/* Sidebar - Popular Tags */}
          <div className="lg:block">
            <PopularTags />
          </div>
        </div>
      </div>
    </main>
  );
}

