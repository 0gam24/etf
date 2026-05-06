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
      // AI 검색·요약 봇 — 명시적 allow 정책 (E-E-A-T 투명성 신호 + AI Overview 인입 허용).
      //   허용 이유: 우리는 AI 작성을 투명하게 공개(<AiAgentDisclosure>)하는 정책이므로
      //   AI 검색엔진(Perplexity·ChatGPT Search·Claude.ai)을 통한 인용도 수용.
      //   /api/ 만 disallow — 동적 OG 이미지·내부 라우트 보호.
      { userAgent: 'GPTBot', allow: '/', disallow: ['/api/'] },           // OpenAI 학습 크롤러
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: ['/api/'] },    // ChatGPT Search 인덱스
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/api/'] },    // Perplexity 검색
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/api/'] },        // Claude 학습 크롤러
      { userAgent: 'Claude-Web', allow: '/', disallow: ['/api/'] },       // Claude 검색 시 fetch
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/api/'] },  // Gemini·Bard 학습
      { userAgent: 'CCBot', allow: '/', disallow: ['/api/'] },            // Common Crawl (LLM 학습 데이터셋)
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
