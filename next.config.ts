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

  // ⚠️ Cloudflare Pages 배포 참고:
  //   - 현재 모드: Node 런타임 (Vercel·자체 서버 친화).
  //     Cloudflare Pages로 배포하려면 아래 둘 중 하나 선택 필요 (DEPLOY.md 참고):
  //     (A) @cloudflare/next-on-pages 어댑터 추가 + API 라우트를 edge runtime으로 변환
  //     (B) output: 'export' 로 정적 빌드 (API 라우트 제거/우회 필요)
  //   - Vercel 배포는 별도 설정 없이 즉시 동작.
};

export default nextConfig;
