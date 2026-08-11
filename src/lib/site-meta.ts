import type { Metadata } from 'next';

/**
 * 사이트 공통 메타데이터 헬퍼
 *
 *   배경 (2026-08-11 SEO 감사):
 *     Next.js는 metadata를 **얕게(shallow) 병합**한다. 자식 세그먼트가 openGraph를
 *     정의하면 부모(layout)의 openGraph 객체가 통째로 **교체**된다.
 *     (node_modules/next/dist/docs/.../generate-metadata.md "Overwriting fields")
 *
 *     그 결과 openGraph를 직접 정의한 17개 라우트에서 og:site_name·og:locale이 전부
 *     사라졌고, 그중 10개(홈·/guide 포함)는 og:image까지 누락돼 공유 미리보기가
 *     빈 카드로 나갔다. 실제 prerender HTML(.next/server/app/index.html)에서 확인.
 *
 *   그래서 openGraph를 정의할 때는 항상 buildOg()를 거쳐 기본값(siteName·locale·image)을
 *   같이 실어 보낸다.
 */

export const SITE_URL = process.env.SITE_URL || 'https://iknowhowinfo.com';
export const SITE_NAME = 'Daily ETF Pulse';
export const SITE_LOCALE = 'ko_KR';

/** 동적 OG 이미지 경로 (1200x630) */
export function ogImageUrl(opts: { title?: string; category?: string; tickers?: string } = {}): string {
  const q = new URLSearchParams();
  if (opts.title) q.set('title', opts.title);
  if (opts.category) q.set('category', opts.category);
  if (opts.tickers) q.set('tickers', opts.tickers);
  const s = q.toString();
  return s ? `/api/og?${s}` : '/api/og';
}

type OgInput = {
  title: string;
  description: string;
  /** 페이지 경로 (예: '/pulse'). og:url이 홈으로 고정되는 문제 방지 */
  url: string;
  /** 'website' | 'article' */
  type?: 'website' | 'article';
  /** OG 이미지 URL. 생략 시 title 기반 동적 이미지 */
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

/**
 * openGraph 블록 생성 — siteName·locale·images를 항상 포함시켜
 * 부모 layout의 openGraph가 교체돼도 손실이 없게 한다.
 */
export function buildOg(input: OgInput): NonNullable<Metadata['openGraph']> {
  const image = input.image ?? ogImageUrl({ title: input.title });
  return {
    title: input.title,
    description: input.description,
    url: input.url,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: input.type ?? 'website',
    images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
  };
}

/** twitter 카드 블록 — og와 동일 소스에서 생성 */
export function buildTwitter(input: OgInput): NonNullable<Metadata['twitter']> {
  const image = input.image ?? ogImageUrl({ title: input.title });
  return {
    card: 'summary_large_image',
    title: input.title,
    description: input.description,
    images: [image],
  };
}

/** layout template(' | Daily ETF Pulse')이 자동으로 덧붙는 글자 수 */
const BRAND_SUFFIX_LEN = ' | Daily ETF Pulse'.length;

/**
 * 글 제목을 메타 title로 변환 (2026-08-11 SEO 감사 후속)
 *
 *   ① 중복 해소 — 같은 제목이 여러 날짜에 걸쳐 발행된 글이 있다(/income 18편·/flow 5편).
 *      제목·설명이 같으면 구글이 하나만 남기고 나머지를 색인에서 제외하므로, 중복일 때만
 *      기준일을 덧붙여 구분한다. 본문·H1·URL은 건드리지 않는다(발행분 소급 수정 금지 규칙).
 *   ② 60자 초과 시 브랜드 접미사 회수 — template이 붙이는 18자를 title.absolute로 끊는다.
 *      글 제목 자체는 한 글자도 바꾸지 않으면서 잘림만 줄인다.
 */
export function articleTitle(input: {
  title: string;
  date?: string;
  isDuplicate?: boolean;
  /** 같은 날짜에도 같은 제목이 겹칠 때 쓰는 2차 구분자 (보통 종목명) */
  discriminator?: string;
}): Metadata['title'] {
  let base = input.title;
  if (input.isDuplicate && input.date) {
    const d = new Date(input.date);
    if (!Number.isNaN(d.getTime())) {
      const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      base = input.discriminator ? `${base} (${ymd} · ${input.discriminator})` : `${base} (${ymd} 기준)`;
    }
  }
  return base.length + BRAND_SUFFIX_LEN > 60 ? { absolute: base } : base;
}

/** 설명이 다른 글과 겹칠 때만 기준일을 덧붙여 구분 */
export function articleDescription(input: {
  description: string;
  date?: string;
  isDuplicate?: boolean;
  discriminator?: string;
}): string {
  if (!input.isDuplicate || !input.date) return input.description;
  const d = new Date(input.date);
  if (Number.isNaN(d.getTime())) return input.description;
  const ymd = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  const lead = input.discriminator ? `${ymd} ${input.discriminator} 기준.` : `${ymd} 기준.`;
  return `${lead} ${input.description}`;
}

/**
 * 페이지 메타데이터 한 번에 생성 — title·description·canonical·og·twitter 일괄.
 *
 *   title은 layout의 template('%s | Daily ETF Pulse')이 자동으로 브랜드를 붙이므로
 *   **브랜드명을 넣지 않는다.** (넣으면 "제목 | Daily ETF Pulse | Daily ETF Pulse")
 */
export function buildPageMetadata(input: OgInput & { keywords?: string[] }): Metadata {
  const { keywords, ...og } = input;
  return {
    title: og.title,
    description: og.description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: og.url },
    openGraph: buildOg(og),
    twitter: buildTwitter(og),
  };
}
