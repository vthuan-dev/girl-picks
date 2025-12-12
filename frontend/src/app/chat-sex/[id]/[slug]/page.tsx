import type { Metadata } from 'next';
import ChatSexDetailClient from '@/components/pages/ChatSexDetailClient';
import StructuredData from '@/components/seo/StructuredData';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

interface PageProps {
  params: Promise<{ id: string; slug?: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id, slug } = await params;
  
  // Fetch girl data for metadata
  let title = 'Gái Chat Sex';
  let description = 'Chat sex với gái xinh, trò chuyện online';

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat-sex/${id}`,
      { next: { revalidate: 3600 } },
    );
    if (response.ok) {
      const girl = await response.json();
      title = `${girl.name || 'Gái Chat'} - Chat Sex Online`;
      description = girl.bio || `Chat sex với ${girl.name || 'gái xinh'}`;
    }
  } catch (error) {
    console.error('Failed to fetch girl for metadata:', error);
  }

  const url = `${siteUrl}/chat-sex/${id}${slug ? `/${slug}` : ''}`;

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
      type: 'website',
      siteName: 'Tìm Gái gọi',
    },
  };
}

export default async function ChatSexDetailPage({ params }: PageProps) {
  const { id, slug } = await params;
  const url = `${siteUrl}/chat-sex/${id}${slug ? `/${slug}` : ''}`;
  
  // Fetch girl data for structured data
  let structuredData = {
    headline: 'Gái Chat Sex',
    description: 'Chat sex với gái xinh, trò chuyện online',
    url,
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat-sex/${id}`,
      { next: { revalidate: 3600 } },
    );
    if (response.ok) {
      const girl = await response.json();
      structuredData = {
        headline: girl.name || 'Gái Chat Sex',
        description: girl.bio || `Chat sex với ${girl.name || 'gái xinh'}`,
        url,
        ...(girl.coverImage && { image: girl.coverImage }),
        ...(girl.rating && { aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: girl.rating,
          bestRating: 5,
        }}),
      };
    }
  } catch (error) {
    console.error('Failed to fetch girl for structured data:', error);
  }
  
  return (
    <>
      <StructuredData
        type="Article"
        data={structuredData}
      />
      <ChatSexDetailClient id={id} />
    </>
  );
}

