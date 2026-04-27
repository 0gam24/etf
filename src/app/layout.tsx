import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import TickerStrip from "@/components/TickerStrip";
import SiteFooter from "@/components/SiteFooter";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

// Google Analytics 4 — 사이트 트래픽·HelpfulFeedback·Threads UTM 추적
const GA4_ID = 'G-LRB1GBGQDN';

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
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily ETF Pulse — 오늘 뜨는 ETF의 진짜 이유',
    description: '거래량 1위 ETF의 급등 사유, 섹터별 자금 흐름, 월배당·커버드콜 전략. 매일 아침 9시 갱신.',
    images: ['/api/og'],
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
  // 검색엔진 사이트 소유 확인 (Naver Search Advisor)
  verification: {
    other: {
      'naver-site-verification': 'c80bf43073cfdf2dd0a8056b3f3c62a914bcbd66',
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
        <TickerStrip />
        <Header />
        <main className="main">{children}</main>
        <SiteFooter />
        <ScrollRevealProvider />
      </body>
    </html>
  );
}
