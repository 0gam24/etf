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
    // 두 개 sitemap 모두 명시 — index + main
    // (검색엔진은 둘 다 처리. index가 우선 권장이지만 main 단독 발견도 가능하게 둠.)
    sitemap: [
      `${baseUrl}/sitemap-index.xml`,
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  };
}
