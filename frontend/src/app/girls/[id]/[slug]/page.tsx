import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/seo/StructuredData';
import GirlGallery from '@/components/girls/GirlGallery';
import GirlInfoCard from '@/components/girls/GirlInfoCard';
import RelatedGirls from '@/components/girls/RelatedGirls';
import ReviewsSection from '@/components/girls/ReviewsSection';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ViewTracker from '@/components/common/ViewTracker';
import Header from '@/components/layout/Header';
import { getGirlById } from '@/lib/api/server-client';
import { Girl } from '@/types/girl';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
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
    const { slug } = await params;
    const url = `${siteUrl}/girls/${girl.id}/${slug}`;

    return {
      title,
      description,
      keywords: [
        girl.fullName,
        'gái gọi', 'gaigu', 'gaigoi', 'gái gọi sài gòn', 'gái gọi hà nội',
        'gái gọi cao cấp', 'gái gọi giá rẻ', 'gái gọi online', 'gái gọi kỹ nữ',
        'tìm gái gọi', 'gái gọi xinh', 'gái gọi vú to', 'gái gọi làm tình',
        'gái dâm', 'gái xinh', 'hot girl', 'sinh viên', 'người mẫu', 'chân dài',
        'eo thon', 'mông to', 'ngực khủng', 'da trắng',
        girl.district?.name || '',
        ...(Array.isArray(girl.tags) ? girl.tags : []),
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

export default async function GirlDetailWithSlugPage({ params }: PageProps) {
  const { id, slug } = await params;

  let girl: Girl;
  try {
    const response = await getGirlById(id);
    girl = response.data as Girl;
    
    // Check if girl exists
    if (!girl || !girl.id) {
      notFound();
    }

    // Verify slug matches
    if (girl.slug && girl.slug !== slug) {
      // Redirect to correct slug URL
      notFound();
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
  const url = `${siteUrl}/girls/${girl.id}/${slug}`;

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Gái gọi', href: '/girls' },
    { label: girl.fullName || (girl as any).name || 'Chi tiết', href: url },
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
      ratingValue: girl.rating || 0,
      reviewCount: girl.totalReviews || 0,
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
      {/* Header */}
      <Header />

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
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Name with Tags and Emoji - All in one line */}
                  <div className="mb-3">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text">
                        {girl.fullName || (girl as any).name}
                      </h1>
                      
                      {/* Tags with Emoji Separator */}
                      {girl.tags && girl.tags.length > 0 && (
                        <>
                          <span className="text-pink-500 text-lg sm:text-xl">❤️</span>
                          {girl.tags.map((tag, index) => (
                            <span key={index} className="flex items-center">
                              <span className="text-text text-sm sm:text-base lg:text-lg font-medium">
                                {tag}
                              </span>
                              {index < girl.tags!.length - 1 && (
                                <span className="mx-1 sm:mx-2 text-pink-500 text-lg sm:text-xl">❤️</span>
                              )}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {/* District Button */}
                    {girl.district?.name && (
                      <div>
                        <span className="inline-block px-4 py-1.5 bg-red-500 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer">
                          Gái gọi {girl.district.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Rating & Status */}
                <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end gap-3">
                  <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-2 border border-secondary/30">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => {
                        const rating = girl.rating || 0;
                        const filled = i < Math.floor(rating);
                        const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;
                        return (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              filled
                                ? 'text-yellow-400 fill-current'
                                : halfFilled
                                ? 'text-yellow-400 fill-current opacity-50'
                                : 'text-secondary/30'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        );
                      })}
                    </div>
                    <span className="text-text font-bold text-lg">{(girl.rating || 0).toFixed(1)}</span>
                    <span className="text-text-muted text-sm">({girl.totalReviews || 0})</span>
                  </div>
                  
                  {/* Status Badge */}
                  {girl.isAvailable ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Đang online
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 text-text-muted rounded-full text-xs font-semibold border border-secondary/30">
                      <span className="w-2 h-2 bg-text-muted rounded-full"></span>
                      Offline
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <GirlGallery images={girl.images || [imageUrl]} name={girl.fullName} />

            {/* Info Card */}
            <GirlInfoCard girl={girl} />

            {/* Comments & Reviews Section */}
            <ReviewsSection 
              girlId={girl.id} 
              totalReviews={girl.totalReviews || 0}
              averageRating={girl.rating || 0}
            />
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
