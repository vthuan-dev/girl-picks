import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { communityPostsApi } from '@/modules/community-posts/api/community-posts.api';
import CommunityPostDetailClient from '@/components/community-posts/CommunityPostDetailClient';
import Header from '@/components/layout/Header';
import Breadcrumbs from '@/components/common/Breadcrumbs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await communityPostsApi.getById(id);
    // API returns the post directly or wrapped in data
    const post = (response as any).data || response;

    if (!post || !post.id) {
      return {
        title: 'Không tìm thấy',
      };
    }

    const title = post.title || `Bài viết của ${post.author?.fullName || 'Cộng đồng'}`;
    const description = post.content?.substring(0, 160) || title;
    const url = `${siteUrl}/community-posts/${id}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        images: post.images && post.images.length > 0 ? [
          {
            url: post.images[0],
            width: 1200,
            height: 630,
            alt: title,
          },
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.images && post.images.length > 0 ? [post.images[0]] : [],
      },
    };
  } catch {
    return {
      title: 'Không tìm thấy',
    };
  }
}

export default async function CommunityPostDetailPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  try {
    const response = await communityPostsApi.getById(id);
    // API returns the post directly or wrapped in data
    post = (response as any).data || response;

    if (!post || !post.id) {
      notFound();
    }
  } catch (error: any) {
    console.error('Error fetching community post:', error);
    if (error?.message === 'Not Found' || error?.status === 404) {
      notFound();
    }
    notFound();
  }

  const breadcrumbs = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Bài viết cộng đồng', href: '/community-posts' },
    { label: post.title || 'Chi tiết bài viết', href: `/community-posts/${id}` },
  ];

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 page-transition">
        <Breadcrumbs items={breadcrumbs} />
        <CommunityPostDetailClient post={post} />
      </div>
    </>
  );
}

