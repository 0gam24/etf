import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';
import { FEED_CATEGORIES, SITE_URL } from '@/lib/feed';

// 전체 URL 링크 스타일 — 클릭하면 피드로 연결, 주소가 그대로 보이고 복사하기 쉬움
const feedUrlStyle: CSSProperties = {
  display: 'inline-block',
  marginTop: '0.35rem',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontSize: '0.9em',
  color: 'var(--accent-gold, #b8860b)',
  wordBreak: 'break-all',
};

export const metadata: Metadata = {
  title: '구독 · 피드 (RSS·Atom·JSON)',
  description:
    'Daily ETF Pulse의 매일 새 분석을 RSS·Atom·JSON Feed로 구독하세요. 카테고리별 RSS와 AI 답변 엔진·검색 엔진용 llms.txt·사이트맵·robots 안내까지 한 페이지에 정리했습니다.',
  alternates: {
    canonical: '/feeds',
    types: {
      'application/rss+xml': '/rss.xml',
      'application/atom+xml': '/atom.xml',
      'application/feed+json': '/feed.json',
    },
  },
  openGraph: {
    title: '구독 · 피드 (RSS)',
    description: 'Daily ETF Pulse의 매일 새 분석을 RSS로 구독하고, AI·검색 엔진용 파일을 한 곳에서 확인하세요.',
    url: 'https://iknowhowinfo.com/feeds',
    type: 'website',
  },
};

interface FeedLink {
  href: string;
  label: string;
  desc: string;
}

// 전체 피드 — 우리가 실제로 제공하는 구독 채널
const SUBSCRIBE_FEEDS: FeedLink[] = [
  {
    href: '/rss.xml',
    label: 'RSS 피드 (전체)',
    desc: '오늘의 관전포인트·급등 분석·자금 흐름·월배당·속보와 일별 종합 리포트까지, 매일 발행되는 새 글이 모두 담깁니다. 가장 널리 쓰이는 표준입니다.',
  },
  {
    href: '/atom.xml',
    label: 'Atom 피드 (전체)',
    desc: 'RSS와 같은 콘텐츠를 Atom 1.0 형식으로 제공합니다. Atom을 선호하는 피드 리더에서 쓰세요.',
  },
  {
    href: '/feed.json',
    label: 'JSON Feed (전체)',
    desc: 'RSS와 같은 콘텐츠를 JSON Feed 1.1 형식으로 제공합니다. JSON 기반 리더나 직접 파싱에 편리합니다.',
  },
];

// AI · 검색 엔진용 파일 — 사이트를 정확히 읽고 인용하도록 돕는 공개 파일
const AI_SEARCH_FILES: FeedLink[] = [
  {
    href: '/llms.txt',
    label: 'llms.txt',
    desc: 'AI 답변 엔진이 사이트 구조와 핵심 페이지를 정확히 이해하고 인용하도록 돕는 안내 파일입니다.',
  },
  {
    href: '/sitemap-index.xml',
    label: 'sitemap-index.xml',
    desc: '검색 엔진용 전체 URL 목록(사이트맵)입니다. 글·종목 사전·가이드·일별 리포트가 모두 포함됩니다.',
  },
  {
    href: '/sitemap-news.xml',
    label: 'sitemap-news.xml',
    desc: '최근 발행 글을 모은 뉴스 사이트맵으로, 네이버·다음·구글 뉴스 색인에 쓰입니다.',
  },
  {
    href: '/robots.txt',
    label: 'robots.txt',
    desc: '크롤러 접근 규칙과 사이트맵 위치를 안내합니다.',
  },
];

export default function FeedsPage() {
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '구독 · 피드', href: '/feeds' },
  ]);

  return (
    <article className="about-page animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />

      <Breadcrumbs items={[{ name: '홈', href: '/' }, { name: '구독 · 피드', href: '/feeds' }]} />

      <header className="about-hero">
        <div className="about-eyebrow">FEEDS · 구독</div>
        <h1 className="about-title">구독 · 피드 (RSS·Atom·JSON)</h1>
        <p className="about-tagline">
          Daily ETF Pulse의 매일 새 분석을 RSS·Atom·JSON Feed로 받아보세요. 즐겨 쓰는 피드 리더에 주소만 등록하면 새 글이 자동으로 도착합니다. 원하는 주제만 받는 카테고리별 RSS와, AI·검색 엔진이 사이트를 정확히 읽도록 돕는 공개 파일도 함께 정리했습니다.
        </p>
      </header>

      <section className="about-section">
        <h2 className="about-h2">전체 피드</h2>
        <ul className="about-list">
          {SUBSCRIBE_FEEDS.map(f => (
            <li key={f.href}>
              <strong>{f.label}</strong>{' — '}{f.desc}
              <br />
              <a href={f.href} target="_blank" rel="noopener noreferrer" style={feedUrlStyle}>{`${SITE_URL}${f.href}`}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">카테고리별 RSS</h2>
        <p className="about-desc">
          원하는 주제만 골라 구독하세요. 해당 카테고리에 새 글이 올라올 때만 받아볼 수 있습니다.
        </p>
        <ul className="about-list">
          {FEED_CATEGORIES.map(c => (
            <li key={c.slug}>
              <strong>{c.name}</strong>
              <br />
              <a href={`/rss/${c.slug}.xml`} target="_blank" rel="noopener noreferrer" style={feedUrlStyle}>{`${SITE_URL}/rss/${c.slug}.xml`}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">AI · 검색 엔진</h2>
        <p className="about-desc">
          검색 엔진과 AI 답변 엔진이 사이트를 정확히 색인·인용하도록 공개하는 표준 파일입니다.
        </p>
        <ul className="about-list">
          {AI_SEARCH_FILES.map(f => (
            <li key={f.href}>
              <strong>{f.label}</strong>{' — '}{f.desc}
              <br />
              <a href={f.href} target="_blank" rel="noopener noreferrer" style={feedUrlStyle}>{`${SITE_URL}${f.href}`}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section">
        <h2 className="about-h2">피드를 어떻게 쓰나요?</h2>
        <ul className="about-list">
          <li><strong>1) 피드 리더 준비</strong> — Feedly·Inoreader 같은 무료 RSS 리더 앱이나 웹 서비스를 준비합니다.</li>
          <li><strong>2) 주소 등록</strong> — 리더의 &quot;구독 추가&quot;에 위 RSS 주소(<code>/rss.xml</code>)를 붙여 넣습니다.</li>
          <li><strong>3) 자동 수신</strong> — 새 글이 올라오면 리더가 자동으로 받아오므로, 매일 사이트를 직접 확인하지 않아도 됩니다.</li>
        </ul>
        <p className="about-desc" style={{ marginTop: '0.75rem' }}>
          이메일로 받아보고 싶다면 <a href="/newsletter"><strong>뉴스레터 구독</strong></a>을, 사이트 전반이 궁금하다면 <a href="/about"><strong>편집팀 소개</strong></a>를 참고하세요. 모든 콘텐츠는 정보 제공 목적이며 투자 권유가 아닙니다.
        </p>
      </section>
    </article>
  );
}
