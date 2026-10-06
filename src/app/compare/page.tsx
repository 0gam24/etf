import Link from 'next/link';
import type { Metadata } from 'next';
import { COMPARE_PAIRS, type ComparePair } from '@/lib/etf-compare-pairs';
import { getKrxEtfMeta, codeToSlug, type KrxEtfCode } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildItemListSchema, jsonLd } from '@/lib/schema';
import { buildPageMetadata } from '@/lib/site-meta';

// 2026-10-06: 설명·소개 문구가 "보수·구성종목"을 약속했지만 비교 페이지에는 총보수가 없고 구성종목은 일부 쌍뿐이다.
//   실제로 모든 비교 페이지에 있는 같은 날 종가·괴리율·시가총액·거래대금만 말한다.
//   카드마다 두 상품의 종목 사전(/etf) 링크를 더해 비교 허브와 종목 사전을 서로 잇는다.
export const metadata: Metadata = buildPageMetadata({
  title: 'ETF 1:1 비교: KODEX vs TIGER · SCHD 한국판',
  description:
    '같은 지수나 같은 테마의 ETF 두 개를 1:1로 견줘 봤습니다. KODEX 200 vs TIGER 200, 미국배당다우존스 운용사별 비교처럼 자주 찾는 조합의 종가·괴리율·시가총액·거래대금을 같은 날 기준으로 나란히 놓았습니다.',
  url: '/compare',
  keywords: ['ETF 비교', 'KODEX vs TIGER', 'ETF 1:1 비교', '같은 지수 ETF 비교', 'ETF 괴리율 비교'],
});

export default function CompareIndexPage() {
  // KRX 목록에 없는 코드가 든 쌍은 상세 페이지가 prerender되지 않으므로(404) 목록에서도 뺀다.
  const pairs: Array<{ p: ComparePair; a: KrxEtfCode; b: KrxEtfCode }> = [];
  for (const p of COMPARE_PAIRS) {
    const a = getKrxEtfMeta(p.codeA);
    const b = getKrxEtfMeta(p.codeB);
    if (a && b) pairs.push({ p, a, b });
  }

  const itemListSchema = buildItemListSchema(
    pairs.map(({ p, a, b }) => ({
      url: `/compare/${p.slug}`,
      name: `${a.name} vs ${b.name}`,
    })),
    `ETF 1:1 비교 ${pairs.length}쌍`,
  );

  return (
    <article className="compare-index animate-fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '비교', href: '/compare' },
      ]} />

      <header className="compare-index-hero">
        <div className="compare-index-eyebrow">⚖️ ETF 1:1 비교</div>
        <h1 className="compare-index-title">
          같은 지수·같은 섹터, 어떤 ETF를 골라야 할까
        </h1>
        <p className="compare-index-tagline">
          KODEX vs TIGER, SCHD 한국판, 환헤지와 비헤지처럼 자주 검색되는 조합을 1:1로 견줬습니다.
          종가·괴리율·시가총액·거래대금을 같은 날 기준으로 보고, 상품별 종목 정보로 바로 넘어갈 수 있습니다.
        </p>
      </header>

      <section className="compare-index-section">
        {/* H1 다음 단계 헤딩이 없어 h1 → (없음) 구조였다. 검색 의도 키워드를 담아 H2 추가. */}
        <h2 className="compare-index-h2">자주 비교되는 ETF {pairs.length}쌍</h2>
        <ul className="compare-index-list">
          {pairs.map(({ p, a, b }) => (
            <li key={p.slug}>
              <div className="compare-index-card">
                <Link href={`/compare/${p.slug}`} className="compare-index-card-main">
                  <div className="compare-index-card-pair">
                    <strong>{a.name}</strong>
                    <span className="compare-index-vs">vs</span>
                    <strong>{b.name}</strong>
                  </div>
                  <div className="compare-index-card-context">{p.context}</div>
                  <span className="compare-index-card-cta">1:1 비교 보기 →</span>
                </Link>
                <div className="compare-index-card-etfs" aria-label="상품별 종목 정보">
                  <Link href={`/etf/${codeToSlug(a.shortcode)}`} prefetch={false} className="compare-index-etf-link">
                    {a.name} <span>{a.shortcode}</span>
                  </Link>
                  <Link href={`/etf/${codeToSlug(b.shortcode)}`} prefetch={false} className="compare-index-etf-link">
                    {b.name} <span>{b.shortcode}</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="compare-index-more">
          다른 상품의 시세와 괴리율은 <Link href="/etf">ETF 종목 사전</Link>에서 이름이나 종목코드로 찾을 수 있습니다.
          같은 지수 이름을 쓰는 상품이 여럿이면 종목 정보 페이지에서 운용사별로 나란히 볼 수 있습니다.
        </p>
      </section>
    </article>
  );
}
