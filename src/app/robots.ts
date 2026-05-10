import { MetadataRoute } from 'next';

/** Daily ETF Pulse — 동적 robots.txt */

// OG 동적 이미지 (/api/og?...) 는 sitemap-images.xml 에 등록되어 있고
// 검색결과 미리보기·이미지 검색 인입 가치가 있어 명시 허용.
// 다른 /api/* (KRX 시세 프록시·검색 등) 는 그대로 차단.
//
// 사건 기록 (2026-04-29 ~ 2026-05-10):
//   네이버 웹마스터도구 "robots.txt에 의해 수집 차단된 페이지" 1건 발생.
//   원인: sitemap-images.xml 의 /api/og?... URL 이 /api/ disallow 에 걸림.
//   해결: 봇별 allow 에 '/api/og' 명시. Allow 가 더 구체적 prefix 라 Disallow 보다 우선.
const COMMON_ALLOW: string[] = ['/', '/api/og'];
const COMMON_DISALLOW: string[] = ['/api/'];
const ALL_DISALLOW: string[]    = ['/api/', '/_next/'];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: COMMON_ALLOW,
        disallow: ALL_DISALLOW,
      },
      // Naver 검색봇 — 한국 검색 60% 점유, 명시적으로 허용
      { userAgent: 'Yeti',           allow: COMMON_ALLOW, disallow: COMMON_DISALLOW },
      // Daum 검색봇
      { userAgent: 'Daumoa',         allow: COMMON_ALLOW, disallow: COMMON_DISALLOW },
      // AI 검색·요약 봇 — 명시적 allow 정책 (E-E-A-T 투명성 신호 + AI Overview 인입 허용).
      //   허용 이유: 우리는 AI 작성을 투명하게 공개(<AiAgentDisclosure>)하는 정책이므로
      //   AI 검색엔진(Perplexity·ChatGPT Search·Claude.ai)을 통한 인용도 수용.
      //   /api/og 만 추가 허용 — 동적 OG 이미지 = 검색 미리보기 자산, 나머지 /api/* 보호.
      { userAgent: 'GPTBot',         allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // OpenAI 학습 크롤러
      { userAgent: 'OAI-SearchBot',  allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // ChatGPT Search 인덱스
      { userAgent: 'PerplexityBot',  allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Perplexity 검색
      { userAgent: 'ClaudeBot',      allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Claude 학습 크롤러
      { userAgent: 'Claude-Web',     allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Claude 검색 시 fetch
      { userAgent: 'Google-Extended',allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Gemini·Bard 학습
      { userAgent: 'CCBot',          allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Common Crawl
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
