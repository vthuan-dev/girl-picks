import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/seo/StructuredData';
import GirlGallery from '@/components/girls/GirlGallery';
import GirlInfoCard from '@/components/girls/GirlInfoCard';
import RelatedGirls from '@/components/girls/RelatedGirls';
import GirlBioSection from '@/components/girls/GirlBioSection';
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

// Generate metadata for SEO - Tối ưu cho số điện thoại
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

    const girlName = girl.fullName || (girl as any).name || '';
    const girlPhone = (girl as any).phone || '';
    const girlProvince = (girl as any).province || girl.district?.name || '';
    const girlLocation = (girl as any).location || '';
    const girlPrice = (girl as any).price || '';
    const girlHeight = (girl as any).height || '';
    const girlWeight = (girl as any).weight || '';
    const girlMeasurements = (girl as any).measurements || '';
    const girlOrigin = (girl as any).origin || '';
    const girlBirthYear = (girl as any).birthYear;
    const girlAge = girlBirthYear ? new Date().getFullYear() - girlBirthYear : null;
    
    // Title tối ưu cho SĐT - đặt SĐT ở đầu để Google dễ index
    const title = girlPhone 
      ? `${girlName}_ ${Array.isArray(girl.tags) ? girl.tags.slice(0, 3).join(', ') : ''}`
      : `${girlName} - Gái gọi ${girlProvince} | Tìm Gái gọi`;
    
    // Description chi tiết với SĐT, thông số - Google sẽ hiển thị trong snippet
    const descParts = [
      girlName,
      girlPhone ? `Điện thoại: ${girlPhone}` : '',
      girlProvince ? `Khu vực: ${girlProvince}` : '',
      girlLocation ? girlLocation : '',
      girlAge ? `Năm sinh: ${girlBirthYear}` : '',
      girlHeight ? `Chiều cao: ${girlHeight}` : '',
      girlWeight ? `Cân nặng: ${girlWeight}` : '',
      girlMeasurements ? `Số đo 3 vòng: ${girlMeasurements}` : '',
      girlOrigin ? `Xuất xứ: ${girlOrigin}` : '',
      girlPrice ? `Giá: ${girlPrice}` : '',
    ].filter(Boolean);
    
    const description = descParts.join('. ') + '.';
    
    const imageUrl = girl.images?.[0] || girl.avatar || `${siteUrl}/images/logo/logo.png`;
    const { slug } = await params;
    const url = `${siteUrl}/girls/${girl.id}/${slug}`;

    // Keywords bao gồm SĐT và các biến thể
    const phoneVariants = girlPhone ? [
      girlPhone,
      girlPhone.replace(/\s/g, ''),
      girlPhone.replace(/^0/, '+84'),
      girlPhone.replace(/^0/, '84'),
      `sdt ${girlPhone}`,
      `số điện thoại ${girlPhone}`,
      `gái gọi ${girlPhone}`,
    ] : [];

    return {
      title,
      description,
      keywords: [
        girlName,
        ...phoneVariants,
        girlProvince ? `gái gọi ${girlProvince}` : '',
        girlLocation || '',
        'gái gọi', 'gaigu', 'gaigoi',
        'gái gọi cao cấp', 'gái gọi giá rẻ', 'gái gọi online',
        'tìm gái gọi', 'gái gọi xinh', 'hot girl',
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

  const girlName = girl.fullName || (girl as any).name || '';
  const girlPhone = (girl as any).phone || '';
  const girlProvince = (girl as any).province || girl.district?.name || '';
  const girlLocation = (girl as any).location || '';
  const girlPrice = (girl as any).price || '';
  const girlHeight = (girl as any).height || '';
  const girlWeight = (girl as any).weight || '';
  const girlMeasurements = (girl as any).measurements || '';
  const girlOrigin = (girl as any).origin || '';
  const girlBirthYear = (girl as any).birthYear;
  
  const imageUrl = girl.images?.[0] || girl.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';
  const title = girlPhone 
    ? `${girlName} — ${girlPhone} - Gái gọi ${girlProvince}`
    : `${girlName} - Gái gọi ${girlProvince}`;
  
  // Description chi tiết cho SEO
  const descParts = [
    girlName,
    girlPhone ? `Điện thoại: ${girlPhone}` : '',
    girlProvince ? `Khu vực: ${girlProvince}` : '',
    girlHeight ? `Chiều cao: ${girlHeight}` : '',
    girlWeight ? `Cân nặng: ${girlWeight}` : '',
    girlMeasurements ? `Số đo: ${girlMeasurements}` : '',
    girlPrice ? `Giá: ${girlPrice}` : '',
  ].filter(Boolean);
  const description = girl.bio || descParts.join('. ') + '.';
  
  const url = `${siteUrl}/girls/${girl.id}/${slug}`;

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Gái gọi', href: '/girls' },
    { label: girlPhone ? `${girlName} - ${girlPhone}` : girlName || 'Chi tiết', href: url },
  ];

  // Structured data for SEO - Tối ưu cho SĐT
  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: girlName,
    description: description,
    image: girl.images || [imageUrl],
    url: url,
    // Telephone - quan trọng cho SEO SĐT
    ...(girlPhone && {
      telephone: girlPhone,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: girlPhone,
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: 'Vietnamese',
      },
    }),
    // Address
    address: {
      '@type': 'PostalAddress',
      addressLocality: girlProvince || girlLocation,
      addressRegion: girlProvince,
      addressCountry: 'VN',
    },
    // Additional info
    ...(girlHeight && { height: girlHeight }),
    ...(girlWeight && { weight: girlWeight }),
    ...(girlOrigin && { birthPlace: girlOrigin }),
    ...(girlBirthYear && { birthDate: `${girlBirthYear}` }),
    // Rating
    aggregateRating: girl.totalReviews && girl.totalReviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: girl.rating || 0,
      reviewCount: girl.totalReviews || 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
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
                  {/* Name */}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text mb-3">
                    {girlName}
                  </h1>
                  
                  {/* Phone Number - SEO optimized */}
                  {girlPhone && (
                    <div className="mb-3">
                      <a 
                        href={`tel:${girlPhone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm sm:text-base font-bold hover:bg-green-600 transition-colors"
                        title={`Gọi ${girlPhone}`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{girlPhone}</span>
                      </a>
                    </div>
                  )}
                  
                  {/* District Button */}
                  {girlProvince && (
                    <div className="mb-3">
                      <span className="inline-block px-4 py-1.5 bg-red-500 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer">
                        Gái gọi {girlProvince}
                      </span>
                    </div>
                  )}
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

            {/* Info Card - Tags will be displayed below Share button */}
            <GirlInfoCard girl={girl} tags={girl.tags} />

            {/* Bio Section */}
            <GirlBioSection bio={girl.bio} />
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
