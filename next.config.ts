import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

// 빌드 시점에 1회 로딩 — 1095종 코드 → SEO 슬러그 매핑.
// scripts/generate-etf-slugs.mjs로 갱신하는 data/etf-slug-map.json 참조.
function loadEtfSlugMap(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), 'data', 'etf-slug-map.json');
    if (!fs.existsSync(file)) return {};
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw) as { byCode?: Record<string, string> };
    return parsed.byCode || {};
  } catch {
    return {};
  }
}

const nextConfig: NextConfig = {
  // 배포 보안 · SEO
  poweredByHeader: false,
  reactStrictMode: true,

  // 외부 이미지 도메인 허용(remotePatterns)은 2026-10-30 뺐다. 예전 일별 글용으로 열어 둔 이미지 생성 서비스가
  //   어디서도 쓰이지 않는데, /_next/image?url=... 로 누구나 그 서비스의 아무 그림이나 우리 도메인 주소로 내보낼 수
  //   있었다(구글 security/social-engineering.md·explicit/troubleshooting.md: 외부 리소스로 들어오는 사기·선정성 위험).

  // 영구 redirect (301) — SEO 가치 보존
  //   1. 한글 슬러그 → 영문 슬러그 (2026-04-26 마이그레이션)
  //   2. /etf/{code} → /etf/{slug} (2026-04-27 슬러그 마이그레이션 1095건)
  async redirects() {
    // 0. 도메인 표준화 — www → non-www 301 (2026-07-19 실측: www가 200으로 그대로
    //    서빙되어 도메인 중복 상태였음. canonical 태그만으론 링크 신호가 분산됨).
    //    Cloudflare 대시보드 redirect rule이 더 앞단이지만, 코드 레벨에도 명시해 이중 방어.
    //    2026-09-30 실측: 단일 규칙('/:path*')은 루트에서 path가 비어 Location이
    //    'https://iknowhowinfo.com/:path*' 글자 그대로 나가 404였다(하위 경로는 정상).
    //    그래서 루트('/')와 하위 경로('/:path+')를 두 규칙으로 나눈다.
    //    2026-10-14: permanent(308) 대신 301 을 명시한다. 네이버 서치어드바이저 안내가 301 기준이다.
    const WWW_HOST = [{ type: 'host' as const, value: 'www.iknowhowinfo.com' }];
    const hostCanonical = [
      {
        source: '/',
        has: WWW_HOST,
        destination: 'https://iknowhowinfo.com/',
        statusCode: 301 as const,
      },
      {
        source: '/:path+',
        has: WWW_HOST,
        destination: 'https://iknowhowinfo.com/:path+',
        statusCode: 301 as const,
      },
    ];

    const legacy = [
      { source: '/flow/flow-20260423-조선', destination: '/flow/flow-20260423-shipbuilding', permanent: true },
      { source: '/flow/flow-20260424-조선', destination: '/flow/flow-20260424-shipbuilding', permanent: true },
      { source: '/flow/flow-20260425-조선', destination: '/flow/flow-20260425-shipbuilding', permanent: true },
      { source: '/surge/0080g0-kodex-방산top10-surge', destination: '/surge/0080g0-kodex-defense-top10-surge', permanent: true },
      { source: '/surge/449450-kodex-방산top10-surge', destination: '/surge/449450-kodex-defense-top10-surge', permanent: true },
      // 2026-10-14: 예전 일별 시황 글의 저자 페르소나(AI 에이전트 K~H) 소개 페이지는 은퇴. 작성 방식은 /about 한 곳에서 밝힌다.
      { source: '/author', destination: '/about', permanent: true },
      // 추천 자료실(제휴 도서 큐레이션)은 2026-10-14 은퇴. 제휴 링크를 사이트에서 모두 걷어 냈다
      { source: '/resources', destination: '/guide', permanent: true },
      { source: '/resources/:path*', destination: '/guide', permanent: true },
      { source: '/author/:id', destination: '/about', permanent: true },
    ];

    // 1095종 코드 URL → SEO 슬러그 URL 영구 이동.
    // 슬러그가 코드 자체와 동일하면(매핑 누락 fallback) skip — self-redirect 회피.
    const slugMap = loadEtfSlugMap();
    const etfRedirects = Object.entries(slugMap)
      .filter(([code, slug]) => slug && slug !== code.toLowerCase())
      .flatMap(([code, slug]) => {
        const lower = { source: `/etf/${code.toLowerCase()}`, destination: `/etf/${slug}`, permanent: true };
        // 영문이 섞인 코드(0080G0 등)는 화면에 대문자로 보여 준다. 그대로 쳐서 들어와도 404 가 나지 않게 대문자 주소도 받는다
        //   (구글 url-structure.md 대소문자 통일, 2026-10-30)
        const upper = code.toUpperCase();
        return upper !== code.toLowerCase()
          ? [lower, { source: `/etf/${upper}`, destination: `/etf/${slug}`, permanent: true }]
          : [lower];
      });

    return [...hostCanonical, ...legacy, ...etfRedirects];
  },

  // ⚠️ Cloudflare Pages 배포 참고:
  //   - 현재 모드: Node 런타임 (Vercel·자체 서버 친화).
  //     Cloudflare Pages로 배포하려면 아래 둘 중 하나 선택 필요 (DEPLOY.md 참고):
  //     (A) @cloudflare/next-on-pages 어댑터 추가 + API 라우트를 edge runtime으로 변환
  //     (B) output: 'export' 로 정적 빌드 (API 라우트 제거/우회 필요)
  //   - Vercel 배포는 별도 설정 없이 즉시 동작.
};

export default nextConfig;
