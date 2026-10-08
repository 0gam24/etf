import {
  getAllEtfSlugs,
  slugToCode,
  getEtfPageFacts,
} from '@/lib/data';

/**
 * Daily ETF Pulse — /etf/{slug} 전 종목 전용 sitemap.
 *
 *   메인 sitemap.ts에서 분리 (크롤링 효율 + Naver Yeti 안정성):
 *     - 전 종목 URL을 별도 XML로 분리해 변경 신호 명확화 (종목 수는 data/etf-slug-map.json 기준)
 *     - 포함 여부는 page.tsx의 robots와 같은 getEtfPageFacts().indexable (noindex URL은 넣지 않는다)
 *     - lastmod는 종목별 max(시세 기준일, 분배 정보 기준일). 실제 데이터 날짜만 쓰고,
 *       날짜가 없으면 lastmod 태그를 생략한다(빌드 시각 같은 가짜 날짜 금지).
 *     - 시세 기준일이 오래됐으면(ETF_STALE_DAYS 초과) changefreq를 weekly로 낮춘다.
 *
 *   Google: priority/changefreq 무시 (lastmod만 사용). Naver Yeti는 사용.
 *   sitemap-index.xml에서 함께 노출.
 */

const SITE = process.env.SITE_URL || 'https://iknowhowinfo.com';

// ★ 빌드타임 정적 생성 강제 — Cloudflare Workers 런타임에선 fs.readdirSync(data/raw)가
//   빈 배열을 반환해(번들 미포함) 런타임 생성 시 0건이 됨. 빌드 시점엔 data/ 가 정상 접근되므로
//   force-static 으로 구워서 배포한다(sitemap.ts 가 정적으로 정상 동작하는 것과 동일 원리).
//   콘텐츠는 매일 push→재빌드로 갱신됨.
export const dynamic = 'force-static';

function ymdToIso(ymd?: string): string | null {
  if (!ymd || ymd.length !== 8) return null;
  const iso = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T00:00:00+09:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET() {
  const slugs = getAllEtfSlugs();
  const entries: string[] = [];

  for (const slug of slugs) {
    const code = slugToCode(slug);
    if (!code) continue;
    const facts = getEtfPageFacts(code);

    // 색인 제외 종목은 sitemap에서도 뺀다 (SSoT: getEtfPageFacts → shouldIndexEtf).
    //   noindex URL을 sitemap에 두면 GSC 'submitted but noindex' 경고. page.tsx robots와 같은 판정.
    if (!facts.indexable) continue;

    // lastmod: 종목별 max(시세 기준일, 분배 기준일). 전 종목이 같은 날짜로 찍혀도 그게 사실이면 그대로 둔다.
    const lastmod = ymdToIso(facts.lastModified?.split('-').join(''));
    // 시세 기준일이 오래됐으면 갱신 주기 신호를 낮춘다.
    const changefreq = facts.age && !facts.age.isStale ? 'daily' : 'weekly';
    // 2026-10-08 우선순위: 가이드 0.9 > 비교 0.8 > 종목 사전. 상품 개요가 있는 종목은 0.8, 나머지 0.6.
    //   예전에는 1,170쪽 전부 0.9 daily 라 가이드(0.85)보다 높게 신고됐다. 네이버 Yeti 는 이 값을 참고한다.
    const priority = facts.profile ? '0.8' : '0.6';

    entries.push(`  <url>
    <loc>${SITE}/etf/${escapeXml(slug)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
