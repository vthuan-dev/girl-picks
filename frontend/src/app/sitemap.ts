import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';
// Prefer environment variable; if missing we will gracefully skip dynamic entries
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '';

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
      priority: 0.9,
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
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  // Try to fetch girls for dynamic sitemap entries (if API URL is configured)
  if (apiBaseUrl) {
    try {
      const girlsResponse = await fetch(`${apiBaseUrl}/girls?limit=1000`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      
      if (girlsResponse.ok) {
        const girlsData = await girlsResponse.json();
        const girls = girlsData?.data?.data || girlsData?.data || [];

        const girlRoutes: MetadataRoute.Sitemap = girls.map((girl: any) => ({
          url: girl.slug ? `${siteUrl}/girls/${girl.id}/${girl.slug}` : `${siteUrl}/girls/${girl.id}`,
          lastModified: girl.updatedAt ? new Date(girl.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }));

        dynamicRoutes.push(...girlRoutes);
      }
    } catch (error: any) {
      console.warn('Error fetching girls for sitemap, continuing without dynamic girl URLs:', error?.message ?? String(error));
    }
  }

  // Try to fetch posts for dynamic sitemap entries (if API URL is configured)
  if (apiBaseUrl) {
    try {
      const postsResponse = await fetch(`${apiBaseUrl}/posts?status=APPROVED&limit=1000`, {
        next: { revalidate: 3600 }, // Revalidate every hour
      });
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        const posts = postsData?.data?.data || postsData?.data || [];

        const postRoutes: MetadataRoute.Sitemap = posts.map((post: any) => {
          const slug = post.slug || post.id;
          return {
            url: `${siteUrl}/posts/${post.id}/${slug}`,
            lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          };
        });

        dynamicRoutes.push(...postRoutes);
      }
    } catch (error: any) {
      console.warn('Error fetching posts for sitemap, continuing without dynamic post URLs:', error?.message ?? String(error));
    }
  }

  return [...baseRoutes, ...dynamicRoutes];
}

