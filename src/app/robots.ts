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
// /_next/static/·/_next/image 는 페이지 렌더링에 필요한 CSS/JS/이미지 리소스 —
// 차단하면 Googlebot 렌더링 품질 평가에 불리(구글 SEO 가이드 "CSS·JS 접근 가능해야").
// 나머지 /_next/(data 등)만 차단 유지.
const ALL_ALLOW: string[]       = [...COMMON_ALLOW, '/_next/static/', '/_next/image'];
const ALL_DISALLOW: string[]    = ['/api/', '/_next/'];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.SITE_URL || 'https://iknowhowinfo.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ALL_ALLOW,
        disallow: ALL_DISALLOW,
      },
      // Google AdSense 크롤러 — 광고 게재·심사용. 와일드카드(*)로도 허용되나 명시해 누락 위험 0.
      { userAgent: 'Mediapartners-Google', allow: ['/'], disallow: [] },
      { userAgent: 'AdsBot-Google',        allow: ['/'], disallow: [] },
      // Naver 검색봇 — 한국 검색 60% 점유, 명시적으로 허용 (모바일 크롤러 포함)
      { userAgent: 'Yeti',           allow: COMMON_ALLOW, disallow: COMMON_DISALLOW },
      { userAgent: 'Yeti-Mobile',    allow: COMMON_ALLOW, disallow: COMMON_DISALLOW },
      // Daum 검색봇
      { userAgent: 'Daumoa',         allow: COMMON_ALLOW, disallow: COMMON_DISALLOW },
      // ── AI 봇 명시 allow ─────────────────────────────────────────────
      //   허용 이유: AI 작성을 투명하게 공개(<AiAgentDisclosure>)하는 정책이므로
      //   AI 검색엔진을 통한 인용도 수용한다. /api/og만 추가 허용, 나머지 /api/* 보호.
      //
      //   2026-08-12 보강 — 각 사가 봇을 "학습용"과 "검색 인출용"으로 분리 운영한다.
      //     학습 봇 : 2년 뒤 모델이 우리를 아는지에 영향
      //     인출 봇 : 지금 AI가 답변할 때 우리를 인용하는지에 영향  ← AEO 관점에서 이쪽이 핵심
      //   기존 목록에 인출 봇이 여럿 빠져 있어(ChatGPT-User·Claude-User·Claude-SearchBot·
      //   Perplexity-User) 실시간 인용 경로가 닫혀 있었다. 공식 문서 기준으로 보강한다.

      // 검색 인출·사용자 요청 봇 (실시간 인용에 직결)
      { userAgent: 'OAI-SearchBot',    allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // ChatGPT Search 인덱스
      { userAgent: 'ChatGPT-User',     allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // 사용자가 물을 때 ChatGPT가 페이지를 열어봄
      { userAgent: 'Claude-SearchBot', allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Claude 검색 인덱스
      { userAgent: 'Claude-User',      allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // 사용자가 물을 때 Claude가 페이지를 열어봄
      { userAgent: 'PerplexityBot',    allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Perplexity 인덱스
      { userAgent: 'Perplexity-User',  allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Perplexity 사용자 요청 fetch

      // 학습 크롤러
      { userAgent: 'GPTBot',           allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // OpenAI 학습
      { userAgent: 'ClaudeBot',        allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Anthropic 학습
      { userAgent: 'Claude-Web',       allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Anthropic 구형 UA (호환 유지)
      { userAgent: 'anthropic-ai',     allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Anthropic 구형 UA (호환 유지)
      { userAgent: 'Google-Extended',  allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Gemini 학습
      { userAgent: 'Applebot-Extended',allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Apple Intelligence 학습
      { userAgent: 'Meta-ExternalAgent', allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Meta AI
      { userAgent: 'Amazonbot',        allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Amazon
      { userAgent: 'CCBot',            allow: COMMON_ALLOW, disallow: COMMON_DISALLOW }, // Common Crawl
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
