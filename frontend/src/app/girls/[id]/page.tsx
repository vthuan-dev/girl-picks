import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getGirlById } from '@/lib/api/server-client';
import StructuredData from '@/components/seo/StructuredData';
import GirlGallery from '@/components/girls/GirlGallery';
import GirlInfoCard from '@/components/girls/GirlInfoCard';
import RelatedGirls from '@/components/girls/RelatedGirls';
import GirlBioSection from '@/components/girls/GirlBioSection';
import ExpandableText from '@/components/common/ExpandableText';
import ReviewsSection from '@/components/girls/ReviewsSection';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ViewTracker from '@/components/common/ViewTracker';
import { Girl } from '@/types/girl';
import { generateSlug } from '@/lib/utils/slug';
import Header from '@/components/layout/Header';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; slug?: string }>;
}

// Generate metadata for SEO - Tối ưu cho số điện thoại
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, slug: slugFromUrl } = await params;
  
  try {
    const response = await getGirlById(id);
    const girl = response.data as Girl;

    if (!girl) {
      return {
        title: 'Không tìm thấy',
      };
    }

    const displayName = (girl as any).name || girl.fullName || girl.username || girl.slug || '';
    const girlName = displayName || '';
    const girlPhone = (girl as any).phone || '';
    const girlProvince = (girl as any).province || girl.district?.name || '';
    const girlLocation = (girl as any).location || '';
    const girlPrice = (girl as any).price || '';
    const girlHeight = (girl as any).height || '';
    const girlWeight = (girl as any).weight || '';
    const girlMeasurements = (girl as any).measurements || '';
    const girlBirthYear = (girl as any).birthYear;
    
    // Title tối ưu cho SĐT
    const title = girlPhone 
      ? `${girlName}_ ${Array.isArray(girl.tags) ? girl.tags.slice(0, 3).join(', ') : ''}`
      : `${girlName} - Gái gọi ${girlProvince} | Tìm Gái gọi`;
    
    // Description chi tiết với SĐT
    const descParts = [
      girlName,
      girlPhone ? `Điện thoại: ${girlPhone}` : '',
      girlProvince ? `Khu vực: ${girlProvince}` : '',
      girlLocation || '',
      girlBirthYear ? `Năm sinh: ${girlBirthYear}` : '',
      girlHeight ? `Chiều cao: ${girlHeight}` : '',
      girlWeight ? `Cân nặng: ${girlWeight}` : '',
      girlMeasurements ? `Số đo: ${girlMeasurements}` : '',
      girlPrice ? `Giá: ${girlPrice}` : '',
    ].filter(Boolean);
    const description = descParts.join('. ') + '.';
    
    const imageUrl = girl.images?.[0] || girl.avatar || `${siteUrl}/images/logo/logo.png`;
    const canonicalSlug = girl.slug || generateSlug(girlName || '');
    const slug = canonicalSlug || slugFromUrl || '';
    const url = slug ? `${siteUrl}/girls/${girl.id}/${slug}` : `${siteUrl}/girls/${id}`;

    // Keywords bao gồm SĐT
    const phoneVariants = girlPhone ? [
      girlPhone,
      girlPhone.replace(/\s/g, ''),
      `gái gọi ${girlPhone}`,
    ] : [];

    return {
      title,
      description,
      keywords: [
        girlName,
        ...phoneVariants,
        girlProvince ? `gái gọi ${girlProvince}` : '',
        'gái gọi', 'gaigu', 'tìm gái gọi',
        ...(Array.isArray(girl.tags) ? girl.tags : []),
      ].filter(Boolean),
      alternates: {
        canonical: url,
      },
      openGraph: {
        title: girlPhone ? `${girlName} — ${girlPhone}` : title,
        description,
        url,
        type: 'profile',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${girlName} ${girlPhone}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: girlPhone ? `${girlName} — ${girlPhone}` : title,
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
  const { id, slug: slugFromUrl } = await params;

  let girl: Girl;
  try {
    const response = await getGirlById(id);
    girl = response.data as Girl;
    const normalizedName = (girl as any).name || girl.fullName || girl.username || girl.slug || girl.bio || '';
    girl = {
      ...girl,
      name: normalizedName || (girl as any).name,
      fullName: girl.fullName || normalizedName,
    };
    
    // Check if girl exists
    if (!girl || !girl.id) {
      notFound();
    }

    const canonicalSlug = girl.slug || generateSlug(girl.fullName || (girl as any).name || '');
    if (canonicalSlug) {
      // If URL has slug and mismatched -> redirect; if no slug -> redirect to canonical
      if (!slugFromUrl || slugFromUrl !== canonicalSlug) {
        redirect(`/girls/${girl.id}/${canonicalSlug}`);
      }
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

  const displayName = (girl as any).name || girl.fullName || girl.username || girl.slug || 'Gái gọi';
  const ratingValue = (girl.rating ?? (girl as any).ratingAverage ?? 0);
  const totalReviews = girl.totalReviews ?? 0;
  const imageUrl = girl.images?.[0] || girl.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';
  const title = `${displayName} - Gái gọi ${girl.district?.name || ''}`;
  const description = girl.bio || `Thông tin chi tiết về ${displayName}`;
  // Use slug in URL if available
  const url = girl.slug 
    ? `${siteUrl}/girls/${girl.id}/${girl.slug}`
    : `${siteUrl}/girls/${id}`;

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Gái gọi', href: '/girls' },
    { label: displayName, href: url },
  ];

  // Structured data for SEO
  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: displayName,
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
      ratingValue,
      reviewCount: totalReviews,
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
                      {displayName}
                    </h1>
                  </div>
                  
                  {/* Rating & Status */}
                  <div className="flex flex-col sm:items-end gap-3">
                    <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-2 border border-secondary/30">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(ratingValue)
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
                      <span className="text-text font-bold text-lg">{ratingValue.toFixed(1)}</span>
                      <span className="text-text-muted text-sm">({totalReviews})</span>
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
                <GirlBioSection bio={girl.bio} />
              </div>
            )}

            {/* Comments & Reviews Section */}
            <ReviewsSection
              girlId={girl.id}
              totalReviews={girl.totalReviews ?? 0}
              averageRating={(girl.rating ?? (girl as any).ratingAverage ?? 0)}
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

