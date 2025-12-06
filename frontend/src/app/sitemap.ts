import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigu1.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/girls',
    '/phim-sex',
    '/anh-sex',
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}

