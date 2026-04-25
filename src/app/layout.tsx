import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import TickerStrip from "@/components/TickerStrip";
import SiteFooter from "@/components/SiteFooter";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

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
};

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = process.env.SITE_URL || 'https://iknowhowinfo.com';

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Daily ETF Pulse',
  url: SITE_URL,
  logo: `${SITE_URL}/og-logo.png`,
  description: '거래량 1위 ETF의 급등 사유, 섹터별 자금 흐름, 월배당·커버드콜 전략까지. 매일 오전 9시 전 업데이트되는 실시간 ETF 투자 의사결정 플랫폼.',
  sameAs: [] as string[],
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Daily ETF Pulse',
  url: SITE_URL,
  inLanguage: 'ko-KR',
  publisher: { '@type': 'Organization', name: 'Daily ETF Pulse' },
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
