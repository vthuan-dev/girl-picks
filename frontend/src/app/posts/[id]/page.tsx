import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
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
  params: Promise<{ id: string }>;
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
    const description = post.content || `Xem phim ${post.title} chất lượng cao. ${post.category ? `Thể loại: ${post.category}.` : ''}`;
    
    // Get poster or thumbnail or first image
    let imageUrl = post.poster || post.thumbnail;
    if (!imageUrl && post.images) {
      const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
      imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : `${siteUrl}/images/logo/logo.png`;
    }
    if (!imageUrl) imageUrl = `${siteUrl}/images/logo/logo.png`;
    
    // Use slug in URL if available, otherwise use ID
    const url = post.slug 
      ? `${siteUrl}/posts/${post.id}/${post.slug}`
      : `${siteUrl}/posts/${id}`;

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
        'phim sex',
        post.category || '',
        ...(Array.isArray(tags) ? tags : []),
      ].filter(Boolean),
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

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;

  let post: Post;
  try {
    const response = await postsApi.getById(id);
    post = unwrapResponse(response) as Post;
    
    // Check if post exists
    if (!post || !post.id) {
      notFound();
    }

    // Redirect to slug URL if slug exists
    if (post.slug) {
      redirect(`/posts/${post.id}/${post.slug}`);
    }
  } catch (error: any) {
    console.error('Error fetching post:', error);
    // If 404 or not found, show not found page
    if (error?.message === 'Not Found' || error?.status === 404) {
      notFound();
    }
    // For other errors, still show not found to avoid breaking the page
    notFound();
  }

  // Use slug in URL if available
  const url = post.slug 
    ? `${siteUrl}/posts/${post.id}/${post.slug}`
    : `${siteUrl}/posts/${id}`;

  // Breadcrumbs data
  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Phim sex', href: '/phim-sex' },
    { label: post.title, href: url },
  ];

  // Structured data for SEO
  const videoStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: post.title,
    description: post.content || post.title,
    thumbnailUrl: post.thumbnail || post.poster || (typeof post.images === 'string' ? JSON.parse(post.images)?.[0] : post.images?.[0]) || `${siteUrl}/images/logo/logo.png`,
    uploadDate: post.createdAt,
    duration: post.duration || 'PT0M0S',
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

