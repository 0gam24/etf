import { MetadataRoute } from 'next';

/** Daily ETF Pulse — 동적 robots.txt */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
