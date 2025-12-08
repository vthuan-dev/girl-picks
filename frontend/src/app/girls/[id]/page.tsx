import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getGirlById } from '@/lib/api/server-client';
import StructuredData from '@/components/seo/StructuredData';
import GirlGallery from '@/components/girls/GirlGallery';
import GirlInfoCard from '@/components/girls/GirlInfoCard';
import RelatedGirls from '@/components/girls/RelatedGirls';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ViewTracker from '@/components/common/ViewTracker';
import { Girl } from '@/types/girl';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const response = await getGirlById(id);
    const girl = response.data as Girl;

    if (!girl) {
      return {
        title: 'Không tìm thấy',
      };
    }

    const title = `${girl.fullName || (girl as any).name} - Gái gọi ${girl.district?.name || ''} | Tìm Gái gọi`;
    const description = girl.bio || `Thông tin chi tiết về ${girl.fullName || (girl as any).name}. ${girl.district?.name ? `Khu vực: ${girl.district.name}.` : ''} Xem ảnh, đánh giá và đặt lịch ngay.`;
    const imageUrl = girl.images?.[0] || girl.avatar || `${siteUrl}/images/logo/logo.png`;
    // Use slug in URL if available, otherwise use ID
    const url = girl.slug 
      ? `${siteUrl}/girls/${girl.id}/${girl.slug}`
      : `${siteUrl}/girls/${id}`;

    return {
      title,
      description,
      keywords: [
        girl.fullName,
        'gái gọi',
        girl.district?.name || '',
        'gaigu',
        'tìm gái gọi',
        girl.tags?.join(', ') || '',
      ].filter(Boolean),
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'profile',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: girl.fullName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
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
  } catch (error) {
    return {
      title: 'Không tìm thấy',
    };
  }
}

export default async function GirlDetailPage({ params }: PageProps) {
  const { id } = await params;

  let girl: Girl;
  try {
    const response = await getGirlById(id);
    girl = response.data as Girl;
    
    // Check if girl exists
    if (!girl || !girl.id) {
      notFound();
    }

    // Redirect to slug URL if slug exists
    if (girl.slug) {
      redirect(`/girls/${girl.id}/${girl.slug}`);
    }
  } catch (error: any) {
    console.error('Error fetching girl:', error);
    // If 404 or not found, show not found page
    if (error?.message === 'Not Found' || error?.status === 404) {
      notFound();
    }
    // For other errors, still show not found to avoid breaking the page
    notFound();
  }

  const imageUrl = girl.images?.[0] || girl.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';
  const title = `${girl.fullName || (girl as any).name} - Gái gọi ${girl.district?.name || ''}`;
  const description = girl.bio || `Thông tin chi tiết về ${girl.fullName || (girl as any).name}`;
  // Use slug in URL if available
  const url = girl.slug 
    ? `${siteUrl}/girls/${girl.id}/${girl.slug}`
    : `${siteUrl}/girls/${id}`;

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Gái gọi', href: '/girls' },
    { label: girl.fullName, href: url },
  ];

  // Structured data for SEO
  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: girl.fullName,
    description: description,
    image: girl.images || [imageUrl],
    ...(girl.district && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: girl.district.name,
        addressRegion: girl.district.name,
        addressCountry: 'VN',
      },
    }),
    ...(girl.phone && {
      telephone: girl.phone,
    }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: girl.rating,
      reviewCount: girl.totalReviews,
      bestRating: 5,
      worstRating: 1,
    },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${siteUrl}${crumb.href}`,
    })),
  };

  return (
    <>
      {/* Track view count */}
      <ViewTracker type="girl" id={girl.id} />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />
      <StructuredData type="BreadcrumbList" data={breadcrumbStructuredData} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4">
          {/* Left Column - Gallery & Info */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title Section */}
            <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
                      {girl.fullName}
                    </h1>
                    {girl.bio && (
                      <p className="text-text-muted text-sm sm:text-base leading-relaxed">
                        {girl.bio}
                      </p>
                    )}
                    {/* Tags */}
                    {girl.tags && girl.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {girl.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Rating & Status */}
                  <div className="flex flex-col sm:items-end gap-3">
                    <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-2 border border-secondary/30">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(girl.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-secondary/30'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-text font-bold text-lg">{girl.rating.toFixed(1)}</span>
                      <span className="text-text-muted text-sm">({girl.totalReviews})</span>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      {girl.verified && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-semibold border border-primary/30">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Đã xác thực
                        </div>
                      )}
                      {girl.isAvailable ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-semibold border border-green-500/30">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Đang online
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 text-text-muted rounded-lg text-xs font-semibold border border-secondary/30">
                          <span className="w-2 h-2 bg-text-muted rounded-full"></span>
                          Offline
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>

            {/* Gallery */}
            <GirlGallery images={girl.images || [imageUrl]} name={girl.fullName} />

            {/* Info Card */}
            <GirlInfoCard girl={girl} />

            {/* Description Section */}
            {girl.bio && (
              <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
                <h2 className="text-xl font-bold text-text mb-4">Mô tả</h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {girl.bio}
                  </p>
                </div>
              </div>
            )}

            {/* Comments & Reviews Section */}
            <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text">Đánh giá & Bình luận</h2>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium cursor-pointer">
                  Viết đánh giá
                </button>
              </div>
              <div className="text-center py-8 text-text-muted">
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
              </div>
            </div>
          </div>

          {/* Right Column - Related Girls */}
          <div className="lg:w-80 flex-shrink-0">
            <RelatedGirls currentGirlId={girl.id} districtId={girl.districtId} />
          </div>
        </div>
      </div>
    </>
  );
}

