import {
  getLatestEtfData,
  getAllEtfSlugs,
  getKrxEtfMeta,
  getEtfHoldings,
  slugToCode,
  shouldIndexEtf,
} from '@/lib/data';
import { getAllPosts } from '@/lib/posts';

/**
 * Daily ETF Pulse — /etf/{slug} 1095종 전용 sitemap.
 *
 *   메인 sitemap.ts에서 분리 (크롤링 효율 + Naver Yeti 안정성):
 *     - 1095+ URL을 별도 XML로 분리해 변경 신호 명확화
 *     - data-rich (시세 있는 100종): priority 0.9 daily — 최신성 강조
 *     - minimal (시세 없는 995종): priority 0.6 weekly — 크롤 budget 보호
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
  const etfData = getLatestEtfData();
  const lastmod = ymdToIso(etfData?.baseDate) || new Date().toISOString();

  // 시세 있는 코드 set (data-rich로 priority 분화 기준)
  const priceCodes = new Set<string>(
    (etfData?.etfList || []).map((e: { code: string }) => e.code.toUpperCase()),
  );

  // 티커별 관련 분석글 개수 (색인 판정용 — page.tsx와 동일 SSoT)
  const postCountByTicker = new Map<string, number>();
  for (const p of getAllPosts()) {
    for (const t of p.meta.tickers || []) {
      const u = t.toUpperCase();
      postCountByTicker.set(u, (postCountByTicker.get(u) || 0) + 1);
    }
  }

  const slugs = getAllEtfSlugs();
  const entries: string[] = [];

  for (const slug of slugs) {
    // KRX 매핑 → 시세 유무 확인
    const code = slugToCode(slug);
    const meta = code ? getKrxEtfMeta(code) : null;
    const upperCode = code?.toUpperCase() || '';
    const hasPrice = priceCodes.has(upperCode);
    const hasHoldings = code ? (getEtfHoldings(code)?.holdings?.length || 0) > 0 : false;
    const relatedPostCount = postCountByTicker.get(upperCode) || 0;

    // thin content 제외 (SSoT: shouldIndexEtf) — noindex 종목은 sitemap 에서도 제외
    //   (noindex URL 을 sitemap 에 두면 GSC 'submitted but noindex' 경고). page.tsx 와 동일 기준.
    if (!shouldIndexEtf({ hasPrice, hasHoldings, relatedPostCount })) continue;

    // Priority + changefreq 분화 (시세 有 0.9 / 그 외 색인 종목 0.5)
    const priority = hasPrice ? '0.9' : '0.5';
    const changefreq = hasPrice ? 'daily' : 'weekly';

    entries.push(`  <url>
    <loc>${SITE}/etf/${escapeXml(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
    void meta; // 향후 imageObject 추가 시 사용
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
