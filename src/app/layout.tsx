import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import TickerStrip from "@/components/TickerStrip";
import SiteFooter from "@/components/SiteFooter";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import SiteLiveBar from "@/components/SiteLiveBar";

// Google Analytics 4 — 사이트 트래픽·HelpfulFeedback·Threads UTM 추적
const GA4_ID = 'G-LRB1GBGQDN';

// Google AdSense 자동 광고 — publisher ID (ads.txt에 공개된 값, 비밀 아님).
//   자동 광고를 사용하므로 본문에 수동 광고 슬롯을 넣지 않는다(구글이 위치·밀도 자동 최적화).
//   이 스니펫 자체가 애드센스 사이트 소유권 확인·승인 심사의 전제.
const ADSENSE_PUB_ID = 'ca-pub-7830821732287404';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://iknowhowinfo.com'),
  title: {
    default: "Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유",
    template: "%s | Daily ETF Pulse",
  },
  description: "거래량 1위 ETF의 급등 사유, 섹터별 자금 흐름, 월배당·커버드콜 전략까지. 매일 오전 9시 전 업데이트되는 실시간 ETF 투자 의사결정 플랫폼.",
  keywords: ["ETF 추천", "거래량 ETF", "방위산업 ETF", "커버드콜", "월배당 ETF", "IRP ETF", "ISA 필수 종목", "자금 흐름"],
  authors: [{ name: "Daily ETF Pulse" }],
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Daily ETF Pulse",
    url: '/',
    // 명시적 width/height — Facebook·Slack·Threads 미리보기 최적화. 누락 시 일부 플랫폼은 SVG 이미지 skip.
    images: [{
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: 'Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유',
    description: '거래량 1위 ETF의 급등 사유, 섹터별 자금 흐름, 월배당·커버드콜 전략. 매일 아침 9시 갱신.',
    images: [{
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: 'Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유',
    }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // 검색엔진 사이트 소유 확인 (Naver Search Advisor + Bing Webmaster Tools)
  verification: {
    other: {
      'naver-site-verification': 'c80bf43073cfdf2dd0a8056b3f3c62a914bcbd66',
      'msvalidate.01': '3FFCB7BA4AF3D296367F2023230FD9E6',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = process.env.SITE_URL || 'https://iknowhowinfo.com';

// Organization 강화 — Google E-E-A-T 신뢰 신호. NewsMediaOrganization으로 publisher type 일관화.
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: 'Daily ETF Pulse',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-logo.png`,
    width: 600,
    height: 60,
  },
  description: '거래량 1위 ETF의 급등 사유, 섹터별 자금 흐름, 월배당·커버드콜 전략까지. 매일 오전 9시 전 업데이트되는 실시간 ETF 투자 의사결정 플랫폼.',
  inLanguage: 'ko-KR',
  // E-E-A-T 정책 페이지 (Google 권장)
  publishingPrinciples: `${SITE_URL}/about`,
  correctionsPolicy: `${SITE_URL}/about`,
  diversityPolicy: `${SITE_URL}/about`,
  actionableFeedbackPolicy: `${SITE_URL}/about`,
  // sameAs — 같은 entity의 외부 채널 명시 (Knowledge Panel 자격 신호)
  // RSS는 항상 활성, Threads는 토큰 등록 후 자동 발행
  sameAs: [
    `${SITE_URL}/rss.xml`,
  ] as string[],
  // smartdatashop network 자매 — 메인(1차 출처 데이터 저널) parentOrganization
  parentOrganization: {
    '@type': 'Organization',
    name: '스마트데이터샵',
    url: 'https://smartdatashop.kr',
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Daily ETF Pulse',
  url: SITE_URL,
  inLanguage: 'ko-KR',
  publisher: { '@type': 'NewsMediaOrganization', name: 'Daily ETF Pulse', url: SITE_URL },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Analytics 4 — afterInteractive 전략으로 LCP 영향 최소화 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
        </Script>
        {/* Google AdSense 자동 광고 로더 — head에 1줄. 자동 광고가 위치·밀도를 최적화.
            애드센스 사이트 승인 심사 + 소유권 확인의 전제이기도 함. */}
        <Script
          id="adsense-auto-ads"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        <SiteLiveBar />
        <TickerStrip />
        <Header />
        <main className="main">{children}</main>
        <SiteFooter />
        <ScrollRevealProvider />
      </body>
    </html>
  );
}
