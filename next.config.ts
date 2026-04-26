import type { NextConfig } from "next";

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

  // 한글 슬러그 → 영문 슬러그 영구 redirect (2026-04-26 마이그레이션)
  // 백링크·검색엔진 인덱스 보존을 위해 301 영구.
  // Next.js는 source 패턴에서 한글을 그대로 인식 (raw 입력 매칭). 인코딩된 URL은 Next가 디코딩 후 매칭.
  async redirects() {
    return [
      { source: '/flow/flow-20260423-조선', destination: '/flow/flow-20260423-shipbuilding', permanent: true },
      { source: '/flow/flow-20260424-조선', destination: '/flow/flow-20260424-shipbuilding', permanent: true },
      { source: '/flow/flow-20260425-조선', destination: '/flow/flow-20260425-shipbuilding', permanent: true },
      { source: '/surge/0080g0-kodex-방산top10-surge', destination: '/surge/0080g0-kodex-defense-top10-surge', permanent: true },
      { source: '/surge/449450-kodex-방산top10-surge', destination: '/surge/449450-kodex-defense-top10-surge', permanent: true },
    ];
  },

  // ⚠️ Cloudflare Pages 배포 참고:
  //   - 현재 모드: Node 런타임 (Vercel·자체 서버 친화).
  //     Cloudflare Pages로 배포하려면 아래 둘 중 하나 선택 필요 (DEPLOY.md 참고):
  //     (A) @cloudflare/next-on-pages 어댑터 추가 + API 라우트를 edge runtime으로 변환
  //     (B) output: 'export' 로 정적 빌드 (API 라우트 제거/우회 필요)
  //   - Vercel 배포는 별도 설정 없이 즉시 동작.
};

export default nextConfig;
