import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StructuredData from '@/components/seo/StructuredData';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ViewTracker from '@/components/common/ViewTracker';
import PostDetailClient from '@/components/posts/PostDetailClient';
import { postsApi } from '@/modules/posts/api/posts.api';
import { Post } from '@/types/post';
import { unwrapResponse } from '@/lib/api/response-helper';

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
    const response = await postsApi.getById(id);
    const post = unwrapResponse(response) as Post;

    if (!post) {
      return {
        title: 'Không tìm thấy',
      };
    }

    const title = `${post.title} | Phim sex`;
    const categoryName = typeof post.category === 'string' ? post.category : post.category?.name;
    const description = post.content || `Xem phim ${post.title} chất lượng cao. ${categoryName ? `Thể loại: ${categoryName}.` : ''}`;
    
    // Get poster or thumbnail or first image
    let imageUrl = post.poster || post.thumbnail;
    if (!imageUrl && post.images) {
      const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
      imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : `${siteUrl}/images/logo/logo.png`;
    }
    if (!imageUrl) imageUrl = `${siteUrl}/images/logo/logo.png`;
    
    const { slug } = await params;
    const url = `${siteUrl}/posts/${post.id}/${slug}`;

    // Parse tags
    let tags: string[] = [];
    if (post.tags) {
      tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
    }

    return {
      title,
      description,
      keywords: [
        post.title,
        'phim sex', 'phim người lớn', 'phim 18+', 'sex tự quay', 'sex việt nam',
        'sex nhật bản', 'sex hàn quốc', 'phim sex việt nam', 'phim sex nhật bản',
        'phim sex hàn quốc', 'phim sex châu á', 'phim sex jav', 'phim sex hd',
        'xem phim sex', 'phim sex online', 'phim sex miễn phí', 'phim sex mới nhất',
        'phim sex hay nhất', 'phim sex chất lượng cao', 'video sex', 'clip sex',
        categoryName || '',
        ...(Array.isArray(tags) ? tags : []),
      ].filter(Boolean) as string[],
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'video.movie',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
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

export default async function PostDetailWithSlugPage({ params }: PageProps) {
  const { id, slug } = await params;

  let post: Post;
  try {
    const response = await postsApi.getById(id);
    post = unwrapResponse(response) as Post;
    
    // Check if post exists
    if (!post || !post.id) {
      notFound();
    }

    // Note: We don't verify slug match to allow any slug for SEO flexibility
    // The ID is the source of truth for fetching the post
  } catch (error: any) {
    console.error('Error fetching post:', error);
    // If 404 or not found, show not found page
    if (error?.message === 'Not Found' || error?.status === 404) {
      notFound();
    }
    // For other errors, still show not found to avoid breaking the page
    notFound();
  }

  // Parse tags
  let tags: string[] = [];
  if (post.tags) {
    tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
  }

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Phim sex', href: '/phim-sex' },
    { label: post.title, href: `/posts/${post.id}/${slug}` },
  ];

  // Structured data for SEO (VideoObject)
  const videoStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: post.title,
    description: post.content || post.title,
    thumbnailUrl: post.thumbnail || post.poster || `${siteUrl}/images/logo/logo.png`,
    uploadDate: post.createdAt || new Date().toISOString(),
    duration: post.duration || 'PT0M',
    contentUrl: post.videoUrl || '',
    embedUrl: post.videoUrl || '',
    ...(post.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: post.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }),
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
      <ViewTracker type="post" id={post.id} />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoStructuredData) }}
      />
      <StructuredData type="BreadcrumbList" data={breadcrumbStructuredData} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Post Detail Client Component */}
        <PostDetailClient post={post} />
      </div>
    </>
  );
}
