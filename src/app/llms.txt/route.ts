import { getPostsByCategory, CATEGORY_NAMES, TOP_LEVEL_CATEGORIES } from '@/lib/posts';
import { GUIDES, GUIDE_PUBLISHED_AT, getGuideClusters } from '@/lib/guides';
import { COMPARE_PAIRS } from '@/lib/etf-compare-pairs';
import { ALL_PERSONAS } from '@/lib/personas-config';
import { getAllEtfSlugs, getKrxEtfMeta, getLatestEtfData } from '@/lib/data';

/**
 * /llms.txt — AI 검색·요약 엔진(GEO)용 사이트 안내서.
 *
 *   표준: https://llmstxt.org/  (Markdown 형식, 루트 경로 노출)
 *   목적: ChatGPT Search·Perplexity·Gemini·Claude 등이 사이트 구조를 빠르게 이해하고
 *         정확한 페이지를 인용(citation)하도록 유도. robots.ts 가 이미 AI 봇을 명시 허용 →
 *         llms.txt 로 "무엇을, 어디서 인용해야 하는가"의 지도를 제공.
 *
 *   원칙:
 *     - SSoT(guides·compare-pairs·personas·posts·etf-slug-map) 직접 import → 새 콘텐츠 자동 반영
 *     - 운영자 메타(모델명·크롤링·파이프라인·글자수) 노출 금지, 시청자 가치 표현만
 *     - 지킬 수 있는 약속만: 실시간 시세 없음, 종목 사전은 KRX 일별 종가 기준,
 *       일일 시황(pulse·surge·flow·income·breaking)은 아카이브로 표시
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';

// ★ 빌드타임 정적 생성 강제 (2026-09-30)
//   이 설정이 없어서 Cloudflare Workers 런타임에서 요청마다 실행되고 있었다. 워커에서는
//   content/·data/ 를 fs 로 읽지 못해 getAllPosts() 가 빈 배열을 돌려주고, 그 결과
//   '카테고리'·'최신 분석' 섹션이 헤딩만 남은 채 비어 있었다(최종 갱신일도 요청 시각).
//   rss.xml·sitemap-index.xml·sitemap-etf.xml 이 같은 이유로 이미 이 설정을 쓴다.
//   콘텐츠는 push 마다 재빌드되므로 정적 생성으로 갱신에 문제가 없다.
export const dynamic = 'force-static';

/** '최신 분석'에 싣는 최근 가이드 수 */
const LATEST_GUIDE_COUNT = 15;
/** '최신 분석' 한 줄 설명 길이 (description 앞부분) */
const LATEST_DESC_CHARS = 80;

/** 시황 아카이브로 표시할 카테고리 (전용 인덱스 페이지가 있는 것만) */
const ARCHIVE_CATEGORIES: string[] = [...TOP_LEVEL_CATEGORIES, 'weekly'];

/** 계산 도구 (sitemap.ts 의 tools 배열과 같은 두 페이지) */
const TOOLS: { slug: string; title: string; note: string }[] = [
  {
    slug: 'portfolio',
    title: 'ETF 포트폴리오 손익 계산기',
    note: '보유 ETF 코드와 수량을 넣으면 KRX 일별 종가 기준으로 손익과 등락률을 계산합니다. 입력값은 브라우저에만 저장됩니다.',
  },
  {
    slug: 'tax-compare',
    title: '계좌별 세후 수익률 비교',
    note: '같은 ETF를 IRP·ISA·연금저축·일반계좌에 담았을 때 기간별 세후 수익률 차이를 비교합니다.',
  },
];

/**
 * 시청자 가시 텍스트 규칙(CLAUDE.md): 긴 줄표(—, –) 금지.
 *   기존 발행분 제목·설명에 남아 있는 것은 소급 수정하지 않고, 이 안내서에 옮길 때만 바꾼다.
 *   숫자 사이 en dash 는 범위 표기라 물결로, 나머지는 쉼표로.
 */
function plain(text: string): string {
  return (text || '')
    .replace(/(\d)\s*–\s*(\d)/g, '$1~$2')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/^[,\s]+|[,\s]+$/g, '');
}

/** 앞 max 글자만 남기고, 잘렸으면 말줄임표를 붙인다. */
function clip(text: string, max: number): string {
  const s = plain(text);
  const chars = Array.from(s);
  if (chars.length <= max) return s;
  return chars.slice(0, max).join('').replace(/[\s,.·:(]+$/, '') + '…';
}

/** ISO 시각 → KST 기준 YYYY-MM-DD (글 date 는 UTC 로 저장되어 있어 날짜가 하루 밀려 보일 수 있다) */
function kstDate(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return (iso || '').slice(0, 10);
  return new Date(t + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 'YYYYMMDD' → 'YYYY-MM-DD' (형식이 다르면 빈 문자열) */
function ymd(v: unknown): string {
  return typeof v === 'string' && /^\d{8}$/.test(v)
    ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`
    : '';
}

export async function GET() {
  // ── 가이드 (매일 아침 새 글이 추가되는 살아 있는 축) ──────────────────
  const guideBySlug = new Map(GUIDES.map((g) => [g.slug, g]));
  const publishedAt = (slug: string) => GUIDE_PUBLISHED_AT[slug] || '';

  // 발행일 내림차순. 같은 날짜는 GUIDE_PUBLISHED_AT 기재 순서(최근 기재가 위)를 유지(안정 정렬).
  const datedGuides = Object.entries(GUIDE_PUBLISHED_AT)
    .filter(([slug]) => guideBySlug.has(slug))
    .sort((a, b) => b[1].localeCompare(a[1]));

  const latestGuideLines = datedGuides
    .slice(0, LATEST_GUIDE_COUNT)
    .map(([slug, date]) => {
      const g = guideBySlug.get(slug)!;
      return `- [${plain(g.title)}](${SITE}/guide/${g.slug}): ${date} · ${clip(g.description, LATEST_DESC_CHARS)}`;
    })
    .join('\n');

  const clusterLines = getGuideClusters()
    .map((c) => {
      const newest = [...c.guides].sort((a, b) =>
        publishedAt(b.slug).localeCompare(publishedAt(a.slug)),
      )[0];
      const recent = newest
        ? ` 최근 글: [${plain(newest.title)}](${SITE}/guide/${newest.slug})`
        : '';
      return `  - ${plain(c.title)} (가이드 ${c.guides.length}편): ${plain(c.description)}${recent}`;
    })
    .join('\n');

  const guideLines = GUIDES.map(
    (g) => `- [${plain(g.title)}](${SITE}/guide/${g.slug}): ${plain(g.description)}`,
  ).join('\n');

  // ── 종목 사전 (KRX 일별 종가 스냅샷) ─────────────────────────────────
  const etfCount = getAllEtfSlugs().length;
  const etfData = getLatestEtfData() as { baseDate?: string } | null;
  const etfBaseDate = ymd(etfData?.baseDate);
  const etfCountLabel = etfCount ? ` ${etfCount.toLocaleString('en-US')}종` : '';
  const etfDateLabel = etfBaseDate ? `(현재 기준일 ${etfBaseDate})` : '';

  // ── 1:1 비교 — 종목 정보가 있는 페어만 페이지가 생성되므로 같은 조건으로 거른다 ──
  const comparePairs = COMPARE_PAIRS.map((c) => ({
    c,
    a: getKrxEtfMeta(c.codeA),
    b: getKrxEtfMeta(c.codeB),
  })).filter((x) => x.a && x.b);

  const compareLines = comparePairs
    .map(
      ({ c, a, b }) =>
        `- [${plain(a!.name)} vs ${plain(b!.name)}](${SITE}/compare/${c.slug}): ${plain(c.searchIntent)}. ${plain(c.context)}`,
    )
    .join('\n');

  // ── 상황별 시작점·도구 ────────────────────────────────────────────────
  const personaLines = ALL_PERSONAS.map(
    (p) => `  - [${plain(p.displayName)}](${SITE}/for/${p.slug}): ${plain(p.scenario)}`,
  ).join('\n');

  const toolLines = TOOLS.map(
    (t) => `  - [${t.title}](${SITE}/tools/${t.slug}): ${t.note}`,
  ).join('\n');

  // ── 일일 시황 아카이브 (새 글 없음, 최신 1건만 안내) ───────────────────
  const archived = ARCHIVE_CATEGORIES.map((cat) => {
    const latest = getPostsByCategory(cat)[0];
    return latest ? { cat, latest, date: kstDate(latest.meta.date) } : null;
  }).filter((x): x is NonNullable<typeof x> => !!x);

  const archiveUntil = archived.map((x) => x.date).sort().pop() || '';

  const archiveLines = archived
    .map(
      ({ cat, latest, date }) =>
        `  - [${plain(CATEGORY_NAMES[cat] || cat)}](${SITE}/${cat}) (아카이브): 마지막 글 [${plain(latest.meta.title)}](${SITE}/${cat}/${latest.meta.slug}) (${date})`,
    )
    .join('\n');

  const archiveBlock = archived.length
    ? `- 일일 시황 아카이브: ${archiveUntil}까지 발행된 시황 기록입니다. 이후로는 새 글이 올라오지 않으니, 최신 내용은 가이드와 종목 사전을 참고하세요.
${archiveLines}`
    : '';

  // 최종 갱신: 가이드 발행일과 아카이브 글 날짜 중 늦은 쪽 (빌드 시각이 아니라 실제 콘텐츠 기준)
  const lastmod =
    [datedGuides[0]?.[1] || '', archiveUntil].sort().pop() || '';

  const categorySection = [
    `- [ETF 가이드](${SITE}/guide): 입문·세금·배당·해외·전략을 주제별로 묶은 가이드 허브입니다. 새 가이드는 매일 아침 추가되며, 발행일순 전체 목록은 [최신 가이드 모아보기](${SITE}/guide/latest)에 있습니다.`,
    clusterLines,
    `- [ETF 종목 사전](${SITE}/etf): 한국거래소(KRX) 상장 ETF${etfCountLabel}의 코드·운용사·섹터·구성종목·분배 정보를 정리했습니다. 가격·등락률·거래량은 KRX 일별 종가 기준${etfDateLabel}이며 실시간 시세는 제공하지 않습니다.`,
    `  - 종목별 페이지는 \`${SITE}/etf/{슬러그}\` 형식이고, 코드 주소(\`${SITE}/etf/{코드}\`)는 슬러그 주소로 이동합니다. 전체 목록은 [sitemap-etf.xml](${SITE}/sitemap-etf.xml)에 있습니다.`,
    `- [ETF 1:1 비교](${SITE}/compare): 같은 지수나 같은 테마를 따르는 ETF 두 개의 총보수·구성종목·분배를 나란히 비교합니다. 개별 비교 페이지는 아래 'ETF 1:1 비교' 목록에 있습니다.`,
    `- 상황별 시작점: 투자 상황에 맞는 가이드와 도구를 한 페이지에 모았습니다.`,
    personaLines,
    `- 계산 도구:`,
    toolLines,
    archiveBlock,
  ]
    .filter(Boolean)
    .join('\n');

  const body = `# Daily ETF Pulse

> 국내 상장 ETF와 ISA·연금저축·IRP 같은 절세 계좌, 해외주식 세금, 배당·분배금을 투자자들이 실제로 묻는 질문을 기준으로 풀어 쓰는 금융 정보 사이트입니다. 매일 아침 새 가이드가 올라오고, ETF 종목 사전은 한국거래소(KRX) 일별 종가를 기준으로 정리합니다.

수치와 제도 설명은 한국거래소(KRX) 공공데이터, 국세청·금융감독원·국민연금공단 등 관할 기관 안내, 운용사 공시를 근거로 합니다. 분석 콘텐츠는 데이터 기반 AI 분석 에이전트가 작성했으며, 실존 인물이 아닙니다. 발행·검수 책임은 Daily ETF Pulse 편집팀에 있습니다. 모든 내용은 정보 제공 목적이며 투자 판단과 책임은 본인에게 있습니다.

최종 갱신: ${lastmod} · 사이트: ${SITE}

## 카테고리
${categorySection}

## 최신 분석 (최근 발행)
${latestGuideLines}

## 필러 가이드 (검색 의도별 정답 페이지)
${guideLines}

## ETF 1:1 비교 (A vs B)
${compareLines}

## 데이터·피드
- [RSS 피드](${SITE}/rss.xml)
- [사이트맵 인덱스](${SITE}/sitemap-index.xml)
- [편집 원칙·운영 주체](${SITE}/about)
- [면책 고지](${SITE}/disclaimer)

## 인용 안내
- 인용할 때는 "${SITE}"의 해당 가이드·종목·비교 페이지 주소를 출처로 표기해 주세요.
- 세율·한도·기한 같은 제도 수치는 개정될 수 있습니다. 가이드 주소와 함께 인용하고, 최신 여부는 국세청·금융감독원 등 관할 기관 안내에서 확인해 주세요.
- 종목 사전의 가격·등락률·거래량은 KRX 일별 종가 기준이며, 시세가 있는 종목 페이지에는 기준일이 표시됩니다. 인용할 때 기준일을 함께 적어 주세요.
- 분배금·세후 수익률·계좌별(IRP·ISA·연금저축) 비교는 '배당·인컴'과 '세금·절세 계좌' 주제의 가이드에 정리되어 있습니다.
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
