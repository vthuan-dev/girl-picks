import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getGirlBySlug } from '@/lib/api/server-client';
import StructuredData from '@/components/seo/StructuredData';
import GirlGallery from '@/components/girls/GirlGallery';
import GirlInfoCard from '@/components/girls/GirlInfoCard';
import GirlBioSection from '@/components/girls/GirlBioSection';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ViewTracker from '@/components/common/ViewTracker';
import { Girl } from '@/types/girl';
import { generateSlug } from '@/lib/utils/slug';
import Header from '@/components/layout/Header';

// Dynamic imports for heavy components - load after initial render
const ReviewsSection = dynamic(() => import('@/components/girls/ReviewsSection'), {
  loading: () => <div className="animate-pulse bg-secondary/20 h-48 rounded-lg" />,
});
const GirlCommunityPosts = dynamic(() => import('@/components/girls/GirlCommunityPosts'), {
  loading: () => <div className="animate-pulse bg-secondary/20 h-32 rounded-lg" />,
});
const RelatedGirls = dynamic(() => import('@/components/girls/RelatedGirls'), {
  loading: () => <div className="animate-pulse bg-secondary/20 h-48 rounded-lg" />,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

// ISR: Revalidate every 2 minutes for fresh data but still cached
export const revalidate = 120;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await getGirlBySlug(slug);
    const girl = response.data as Girl;

    if (!girl) {
      return { title: 'Không tìm thấy' };
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

    const title = girlPhone
      ? `${girlName}_ ${Array.isArray(girl.tags) ? girl.tags.slice(0, 3).join(', ') : ''}`
      : `${girlName} - Gái gọi ${girlProvince} | Tìm Gái gọi`;

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
    const finalSlug = canonicalSlug || slug;
    const url = `${siteUrl}/girls/${finalSlug}`;

    const phoneVariants = girlPhone
      ? [girlPhone, girlPhone.replace(/\s/g, ''), `gái gọi ${girlPhone}`]
      : [];

    return {
      title,
      description,
      keywords: [
        girlName,
        ...phoneVariants,
        girlProvince ? `gái gọi ${girlProvince}` : '',
        'gái gọi',
        'gaigu',
        'tìm gái gọi',
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
  } catch {
    return { title: 'Không tìm thấy' };
  }
}

export default async function GirlDetailBySlugPage({ params }: PageProps) {
  const { slug } = await params;

  let girl: Girl;
  try {
    const response = await getGirlBySlug(slug);
    girl = response.data as Girl;

    if (!girl || !girl.id) {
      notFound();
    }

    const canonicalSlug = girl.slug || generateSlug(girl.fullName || (girl as any).name || '');

    // Only redirect if a slug explicitly exists in the DB AND it's different from current param
    // This prevents redirecting to "generated" slugs that might not be searchable yet
    if (girl.slug && slug.toLowerCase() !== girl.slug.toLowerCase()) {
      redirect(`/girls/${girl.slug}`);
    }
  } catch (error: any) {
    console.error('Error fetching girl by slug:', error);
    notFound();
  }

  const displayName = (girl as any).name || girl.fullName || girl.username || girl.slug || 'Gái gọi';
  const ratingValue = girl.rating ?? (girl as any).ratingAverage ?? 0;
  const totalReviews = girl.totalReviews ?? 0;
  const imageUrl =
    girl.images?.[0] ||
    girl.avatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=800&fit=crop';
  const title = `${displayName} - Gái gọi ${girl.district?.name || ''}`;
  const description = girl.bio || `Thông tin chi tiết về ${displayName}`;
  const url = girl.slug ? `${siteUrl}/girls/${girl.slug}` : `${siteUrl}/girls/${slug}`;

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Gái gọi', href: '/girls' },
    { label: displayName, href: url },
  ];

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
      <ViewTracker type="girl" id={girl.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />
      <StructuredData type="BreadcrumbList" data={breadcrumbStructuredData} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-1 sm:py-6 lg:py-8 page-transition">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex flex-col lg:grid lg:grid-cols-[2fr,1fr] gap-4 sm:gap-6 lg:gap-10">
          {/* Main content: gallery + bio */}
          <div className="space-y-4 sm:space-y-6">
            <GirlGallery id={girl.id} images={girl.images as string[]} name={displayName} />

            {/* Bio: loại bỏ cảnh báo thanh toán 25 điểm nếu có */}
            {(() => {
              const cleanedBio = (girl.bio || '')
                .replace(/Bạn đồng ý thanh toán 25 điểm để up đánh giá\??/gi, '')
                .trim();

              if (!cleanedBio) {
                return null;
              }

              return (
                <>
                  <GirlBioSection bio={cleanedBio} />
                </>
              );
            })()}
          </div>

          {/* Sidebar thông tin cơ bản */}
          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-20 h-fit">
            <GirlInfoCard girl={girl} />
          </div>
        </div>

        {/* Reviews: dưới Thông tin cơ bản ở mobile, cột trái ở desktop */}
        <div className="mt-4 sm:mt-6 lg:mt-1 lg:max-w-3xl">
          <ReviewsSection
            girlId={girl.id}
            totalReviews={totalReviews}
            averageRating={ratingValue}
          />
        </div>

        {/* Bài viết cộng đồng */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <GirlCommunityPosts girlId={girl.id} limit={6} />
        </div>

        {/* Gái gọi liên quan – hiển thị toàn chiều ngang, dưới InnerLayoutRouter */}
        <div className="mt-4 sm:mt-8">
          <RelatedGirls currentGirlId={girl.id} districtId={girl.districtId} />
        </div>
      </div>
    </>
  );
}


