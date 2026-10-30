import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import NaverAnalytics from "@/components/NaverAnalytics";
// Google AdSense 자동 광고 — publisher ID는 src/lib/ads.ts 단일 소스. 광고는 자동 광고만 쓴다(2026-10-14 운영자 지시).
//   자동 광고를 사용하므로 본문에 수동 광고 슬롯을 넣지 않는다(구글이 위치·밀도 자동 최적화).
//   이 스니펫 자체가 애드센스 사이트 소유권 확인·승인 심사의 전제.
import { ADSENSE_PUB_ID } from "@/lib/ads";

// Google Analytics 4 — 사이트 트래픽·HelpfulFeedback·Threads UTM 추적
//   iknowhowinfo.com 전용 GA4 속성(2026-06 신설).
const GA4_ID = 'G-P2ZYD31B29';

// 사이트 전역 소개 문구 — 기본 description·Twitter·Organization 스키마가 공유.
//   2026-09-30: 일일 시황 코너가 멈춘 뒤에도 '매일 오전 9시 전 업데이트'를 약속하고 있어
//   실제로 매일 올라오는 가이드 기준으로 교체. 정확한 시각은 적지 않는다.
//   2026-10-06: 운영 사양 v2.0(PUBLISHING.md)부터 새 가이드는 매일이 아니라 주 2개 이하라
//   "가이드를 매일 아침 새로 발행"도 지킬 수 없는 약속이 됐다. 사이트가 실제로 거래일마다
//   새로 고치는 것(ETF 종목 사전의 종가·괴리율)을 앞에 두고 빈도 약속은 빼는 쪽으로 교체.
//   네이버 콘텐츠 마크업 가이드(searchadvisor.naver.com/guide/markup-content)의 "키워드 2회 이상
//   반복 금지"에 맞춰 ETF·KRX를 한 번씩만 쓴다. 피드 채널 소개(src/lib/feed.ts SITE_DESC)도 같은 문구로 맞출 것.
//   2026-10-30: 시세 수집이 10-02 로 멈춰 "최근 거래일 기준"·"종가"는 지킬 수 없는 약속이 됐다. 구글 helpful content
//   "쉽게 검증할 수 있는 사실 정보 오류", 네이버 "가격… 최신 상태로". 시세를 약속하지 않는 문장으로 바꿨다.
const SITE_DESCRIPTION =
  'KRX 상장 ETF를 종목코드로 찾는 종목 사전과 같은 지수 상품 1:1 비교, 월배당·커버드콜 분배 정보, ISA·연금저축 절세 가이드를 국세청·금감원 같은 1차 출처와 함께 정리했습니다.';
// 기본 제목. 예전 "오늘 뜨는 ETF의 진짜 이유"는 접은 일일 시황 코너의 문구라 404 등 제목 없는 화면에 그대로 나갔다 (2026-10-30)
const SITE_DEFAULT_TITLE = 'Daily ETF Pulse, 종목 사전·같은 지수 비교·절세 가이드';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://iknowhowinfo.com'),
  title: {
    default: SITE_DEFAULT_TITLE,
    template: "%s | Daily ETF Pulse",
  },
  description: SITE_DESCRIPTION,
  // ⚠️ 여기에 keywords를 두지 않는다.
  //   Next.js는 자식이 keywords를 정의하지 않으면 layout 값을 그대로 물려준다. 그 결과
  //   /privacy·/contact·/disclaimer 같은 페이지까지 "월배당 ETF·IRP ETF·커버드콜"을
  //   선언하고 있었고, 43쪽이 동일한 8개 키워드를 공유해 서로 잠식하는 상태였다.
  //   (2026-08-12 키워드 감사). 네이버는 meta keywords를 참고하므로 페이지별로
  //   자기 주제에 맞는 키워드를 직접 지정한다.
  authors: [{ name: "Daily ETF Pulse" }],
  // 피드 자동 발견 링크(application/rss+xml 등)는 여기 두지 않고 아래 <head>에 직접 넣는다.
  //   Next.js 메타데이터는 얕게 병합돼서, 모든 페이지가 alternates.canonical을 정의하는 순간
  //   이 alternates 객체 전체(types 포함)가 교체된다. 2026-10-06 운영 HTML 실측(/, /etf/kodex-200,
  //   /guide/china-etf, /compare, /income)에서 rel="alternate" 피드 링크가 한 쪽도 없었다.
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Daily ETF Pulse",
    url: '/',
    // 명시적 width/height — Facebook·Slack·Threads 미리보기 최적화. 누락 시 일부 플랫폼은 SVG 이미지 skip.
    images: [{
      url: '/og/default.png',
      width: 1200,
      height: 630,
      alt: SITE_DEFAULT_TITLE,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [{
      url: '/og/default.png',
      width: 1200,
      height: 630,
      alt: SITE_DEFAULT_TITLE,
    }],
  },
  robots: {
    index: true,
    follow: true,
    // 일반 robots 메타에도 명시 — Naver Yeti 등 googleBot 전용 메타를 읽지 않는
    // 크롤러의 이미지 대형 미리보기·스니펫 제한 해제 (googleBot 하위만으론 불충분)
    'max-image-preview': 'large',
    'max-snippet': -1,
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

// Organization — 발행처 엔티티. 2026-10-30 NewsMediaOrganization → Organization (뉴스 매체가 아닌 정보 사이트,
//   구글 organization.md "가장 구체적인 하위유형"). src/lib/schema.ts 의 publisher 와 같은 유형·로고를 쓴다.
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  // @id — 사이트 전역에서 동일 entity 참조용 anchor (Article publisher 등과 상호참조 가능)
  '@id': `${SITE_URL}/#organization`,
  name: 'Daily ETF Pulse',
  // 한글 표기·도메인으로 검색하는 경우도 같은 사이트로 묶이게 (2026-10-14)
  alternateName: ['데일리 ETF 펄스', 'iknowhowinfo.com'],
  url: SITE_URL,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'smartdatashop@gmail.com',
    availableLanguage: ['Korean'],
  },
  // 정사각형 180x180 (구글 로고 최소 112x112). 예전 og-logo.png 는 600x60 이었다
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/logo-square.png`,
    width: 180,
    height: 180,
  },
  description: SITE_DESCRIPTION,
  inLanguage: 'ko-KR',
  // E-E-A-T 정책 페이지 (Google 권장)
  publishingPrinciples: `${SITE_URL}/about`,
  correctionsPolicy: `${SITE_URL}/about#corrections`,
  actionableFeedbackPolicy: `${SITE_URL}/contact`,
  // sameAs 는 실제로 운영하는 외부 채널(블로그·유튜브 등)만 넣는다. 자기 사이트 RSS 는 채널이 아니라 2026-10-30 뺐다
  //   (네이버 "사이트 연관채널" 마크업, 구글 organization.md "다른 웹사이트의 페이지 URL"). 피드 안내는 <link rel="alternate"> 가 맡는다.
  // parentOrganization(smartdatashop.kr)은 2026-09-30 제거. 형제 사이트가 '사이트 전역
  //   자매 링크 네트워크'를 AdSense 거절 원인으로 기록했다. 운영 주체 표기는 /about에 있다.
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Daily ETF Pulse',
  alternateName: ['데일리 ETF 펄스', 'iknowhowinfo.com'],
  url: SITE_URL,
  inLanguage: 'ko-KR',
  publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Daily ETF Pulse', url: SITE_URL },
  potentialAction: {
    '@type': 'SearchAction',
    // 2026-10-14: 홈(/?q=)은 검색을 받지 않아 실제로 검색되는 ETF 사전 검색으로 바꿨다 (EtfIndexSearch 가 ?q= 를 읽는다).
    target: `${SITE_URL}/etf?q={search_term_string}`,
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
        {/* 피드 자동 발견 링크, 모든 페이지에 한 번씩. 위 metadata.alternates 주석 참고.
            네이버 서치어드바이저는 RSS를 제출로 받지만, 피드 리더·다음 등은 이 링크로 피드를 찾는다. */}
        <link rel="alternate" type="application/rss+xml" title="Daily ETF Pulse" href={`${SITE_URL}/rss.xml`} />
        <link rel="alternate" type="application/atom+xml" title="Daily ETF Pulse" href={`${SITE_URL}/atom.xml`} />
        <link rel="alternate" type="application/feed+json" title="Daily ETF Pulse" href={`${SITE_URL}/feed.json`} />
        {/* 네이버 검색 결과 파비콘 (2026-10-06)
            파일 규칙(src/app/favicon.ico·icon.svg)이 만드는 링크는 rel="icon"이 2개이고 상대 경로다.
            네이버 파비콘 가이드(searchadvisor.naver.com/guide/markup-favicon)는 절대 경로를 쓰고
            같은 rel 값은 하나만 두라고 하며, 여러 개면 반영이 안 될 수 있다고 적는다.
            네이버가 가장 먼저 보는 rel="shortcut icon"을 절대 경로로 하나 둬서 우선 적용되게 한다. */}
        <link rel="shortcut icon" href={`${SITE_URL}/favicon.ico`} />
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
            애드센스 사이트 승인 심사 + 소유권 확인의 전제이기도 함.
            2026-10-14: next/script(afterInteractive)를 걷어 내고 AdSense 안내 코드 그대로의 async 태그로 바꿨다.
            next/script 는 head 에 preload 링크를 따로 넣고 data-nscript 속성을 붙여, AdSense 가 콘솔에
            "AdSense head tag doesn't support data-nscript attribute" 경고를 냈다. async 라 렌더링을 막지 않고,
            서버 HTML 에 태그가 그대로 있어 애드센스 크롤러도 바로 읽는다. */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
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
        {/* 2026-10-08: 상단 시장 상태 띠(SiteLiveBar)와 흐르는 시세 띠(TickerStrip)를 뺐다.
            모바일 첫 화면 약 66px을 차지하고(그중 36px은 sticky로 늘 남음), SiteLiveBar는 서버에서 비어 있다가
            하이드레이션 뒤 나타나 모든 페이지에서 레이아웃이 밀렸다(CLS). TickerStrip은 페이지마다 /api/etf 전체(1,171행)를
            받아 14개만 보여 줬고, HTML 첫 텍스트가 "ETF 시세 불러오는 중…"이 되어 검색엔진이 본문보다 먼저 읽었다.
            시세 이용 조건이 정리되기 전에 모든 페이지에 시세 숫자를 띄우는 문제도 함께 없어진다. */}
        <Header />
        <main className="main">{children}</main>
        <SiteFooter />
        <ScrollRevealProvider />
        {/* 네이버 애널리틱스 — SPA 페이지 이동까지 집계 (wcslog + 라우트 변경 추적) */}
        <NaverAnalytics />
      </body>
    </html>
  );
}
