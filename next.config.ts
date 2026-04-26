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

  // 외부 이미지 도메인 허용 (포스팅 내 AI 생성 이미지용)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
    ],
  },

  // 영구 redirect (301) — SEO 가치 보존
  //   1. 한글 슬러그 → 영문 슬러그 (2026-04-26 마이그레이션)
  //   2. /etf/{code} → /etf/{slug} (2026-04-27 슬러그 마이그레이션 1095건)
  async redirects() {
    const legacy = [
      { source: '/flow/flow-20260423-조선', destination: '/flow/flow-20260423-shipbuilding', permanent: true },
      { source: '/flow/flow-20260424-조선', destination: '/flow/flow-20260424-shipbuilding', permanent: true },
      { source: '/flow/flow-20260425-조선', destination: '/flow/flow-20260425-shipbuilding', permanent: true },
      { source: '/surge/0080g0-kodex-방산top10-surge', destination: '/surge/0080g0-kodex-defense-top10-surge', permanent: true },
      { source: '/surge/449450-kodex-방산top10-surge', destination: '/surge/449450-kodex-defense-top10-surge', permanent: true },
    ];

    // 1095종 코드 URL → SEO 슬러그 URL 영구 이동.
    // 슬러그가 코드 자체와 동일하면(매핑 누락 fallback) skip — self-redirect 회피.
    const slugMap = loadEtfSlugMap();
    const etfRedirects = Object.entries(slugMap)
      .filter(([code, slug]) => slug && slug !== code.toLowerCase())
      .map(([code, slug]) => ({
        source: `/etf/${code.toLowerCase()}`,
        destination: `/etf/${slug}`,
        permanent: true,
      }));

    return [...legacy, ...etfRedirects];
  },

  // ⚠️ Cloudflare Pages 배포 참고:
  //   - 현재 모드: Node 런타임 (Vercel·자체 서버 친화).
  //     Cloudflare Pages로 배포하려면 아래 둘 중 하나 선택 필요 (DEPLOY.md 참고):
  //     (A) @cloudflare/next-on-pages 어댑터 추가 + API 라우트를 edge runtime으로 변환
  //     (B) output: 'export' 로 정적 빌드 (API 라우트 제거/우회 필요)
  //   - Vercel 배포는 별도 설정 없이 즉시 동작.
};

export default nextConfig;
