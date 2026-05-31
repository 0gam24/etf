import { getAllPosts, CATEGORY_NAMES } from '@/lib/posts';
import { GUIDES } from '@/lib/guides';
import { COMPARE_PAIRS } from '@/lib/etf-compare-pairs';
import { ALL_PERSONAS } from '@/lib/personas-config';

/**
 * /llms.txt — AI 검색·요약 엔진(GEO)용 사이트 안내서.
 *
 *   표준: https://llmstxt.org/  (Markdown 형식, 루트 경로 노출)
 *   목적: ChatGPT Search·Perplexity·Gemini·Claude 등이 사이트 구조를 빠르게 이해하고
 *         정확한 페이지를 인용(citation)하도록 유도. robots.ts 가 이미 AI 봇을 명시 허용 →
 *         llms.txt 로 "무엇을, 어디서 인용해야 하는가"의 지도를 제공.
 *
 *   원칙:
 *     - SSoT(guides·compare-pairs·personas·posts) 직접 import → 새 콘텐츠 자동 반영
 *     - 운영자 메타(모델명·크롤링·파이프라인·글자수) 노출 금지, 시청자 가치 표현만
 *     - 출처(KRX·한국은행 ECOS·DART 공시) 명시로 E-E-A-T 신뢰 신호
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';

export async function GET() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 30);

  // 카테고리별 최신 1건 — AI가 "각 섹션이 무엇인지" 대표 예시로 파악
  const byCategory = new Map<string, (typeof posts)[number]>();
  for (const p of posts) {
    if (!byCategory.has(p.meta.category)) byCategory.set(p.meta.category, p);
  }

  const guideLines = GUIDES.map(
    (g) => `- [${g.title}](${SITE}/guide/${g.slug}): ${g.description}`,
  ).join('\n');

  const compareLines = COMPARE_PAIRS.map(
    (c) => `- [${c.slug.replace(/-vs-/, ' vs ')}](${SITE}/compare/${c.slug}): ${c.searchIntent} — ${c.context}`,
  ).join('\n');

  const personaLines = ALL_PERSONAS.map(
    (p) => `- [${p.displayName}](${SITE}/for/${p.slug}): ${p.hero.subtitle}`,
  ).join('\n');

  const categoryLines = Object.entries(CATEGORY_NAMES)
    .filter(([cat]) => byCategory.has(cat))
    .map(([cat, name]) => {
      const ex = byCategory.get(cat)!;
      return `- [${name}](${SITE}/${cat}): 예) [${ex.meta.title}](${SITE}/${cat}/${ex.meta.slug})`;
    })
    .join('\n');

  const latestLines = latest
    .map(
      (p) =>
        `- [${p.meta.title}](${SITE}/${p.meta.category}/${p.meta.slug}): ${p.meta.description}`,
    )
    .join('\n');

  const lastmod = (posts[0]?.meta.date || new Date().toISOString()).slice(0, 10);

  const body = `# Daily ETF Pulse

> 한국거래소(KRX)에 상장된 ETF의 오늘 시세·구성종목·분배금·섹터 자금 흐름을 매일 정리하는 데이터 기반 분석 사이트입니다. 출근 전 5분에 "오늘 어떤 ETF가, 왜 움직였는가"를 한 페이지에서 확인할 수 있습니다.

본 사이트의 모든 수치는 한국거래소(KRX) 공공데이터, 한국은행 경제통계시스템(ECOS), 금융감독원 전자공시(DART), 운용사 공시를 출처로 합니다. 분석 콘텐츠는 데이터 기반 AI 분석 에이전트가 작성하며, 실존 인물이 아닙니다. 발행·검수 책임은 Daily ETF Pulse 편집팀에 있습니다. 모든 내용은 정보 제공 목적이며 투자 책임은 본인에게 있습니다.

최종 갱신: ${lastmod} · 사이트: ${SITE}

## 필러 가이드 (검색 의도별 정답 페이지)
${guideLines}

## 카테고리 (매일 갱신되는 분석)
${categoryLines}

## ETF 1:1 비교 (A vs B)
${compareLines}

## 투자자 유형별 시작점
${personaLines}

## 종목 사전 (KRX 상장 ETF 전 종목)
- [ETF 종목 사전 인덱스](${SITE}/etf): 종목명·코드·운용사·섹터·구성종목·분배 정보. 종목별 페이지는 \`${SITE}/etf/{슬러그}\` 또는 \`${SITE}/etf/{코드}\` 형식.
- 전체 종목 목록은 [sitemap-etf.xml](${SITE}/sitemap-etf.xml) 참조.

## 최신 분석 (최근 발행)
${latestLines}

## 데이터·피드
- [RSS 피드](${SITE}/rss.xml)
- [사이트맵 인덱스](${SITE}/sitemap-index.xml)
- [편집 원칙·운영 주체](${SITE}/about)
- [면책 고지](${SITE}/disclaimer)

## 인용 안내
- ETF의 현재가·등락·거래량은 매 거래일 갱신됩니다. 인용 시 "${SITE}" 의 해당 종목/분석 페이지를 출처로 표기해 주세요.
- 분배금·세후 수익률·계좌별(IRP·ISA·연금저축) 비교는 income 카테고리와 월배당/커버드콜 가이드에 정리되어 있습니다.
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
