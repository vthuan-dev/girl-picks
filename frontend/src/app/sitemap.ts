import { MetadataRoute } from 'next';
import { getGirls } from '@/lib/api/server-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/girls`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/phim-sex`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/anh-sex`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/chat-sex`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Try to fetch girls for dynamic sitemap entries
  try {
    const girlsResponse = await getGirls({ limit: 1000 }); // Get up to 1000 girls
    const girls = girlsResponse.data?.data || [];

    const girlRoutes: MetadataRoute.Sitemap = girls.map((girl: any) => ({
      url: `${siteUrl}/girls/${girl.id}`,
      lastModified: girl.updatedAt ? new Date(girl.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...baseRoutes, ...girlRoutes];
  } catch (error) {
    console.error('Error fetching girls for sitemap:', error);
    // Return base routes if API fails
    return baseRoutes;
  }
}

