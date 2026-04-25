import { MetadataRoute } from 'next';

/** Daily ETF Pulse — 동적 robots.txt */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Naver 검색봇 — 한국 검색 60% 점유, 명시적으로 허용
      { userAgent: 'Yeti', allow: '/', disallow: ['/api/'] },
      // Daum 검색봇
      { userAgent: 'Daumoa', allow: '/', disallow: ['/api/'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
