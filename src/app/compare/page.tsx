import Link from 'next/link';
import type { Metadata } from 'next';
import { COMPARE_PAIRS } from '@/lib/etf-compare-pairs';
import { getKrxEtfMeta } from '@/lib/data';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildItemListSchema, jsonLd } from '@/lib/schema';
import { buildPageMetadata } from '@/lib/site-meta';

export const metadata: Metadata = buildPageMetadata({
  title: 'ETF 1:1 비교: KODEX vs TIGER · SCHD 한국판',
  description:
    '같은 지수를 따라가는 ETF끼리 무엇이 다른지 1:1로 비교했습니다. KODEX 200 vs TIGER 200, 미국배당다우존스 운용사별 비교 등 자주 검색되는 조합의 시세·구성종목·보수 차이를 정리했습니다.',
  url: '/compare',
  keywords: ['ETF 비교', 'KODEX vs TIGER', 'ETF 1:1 비교', '같은 지수 ETF 비교', 'ETF 총보수 비교'],
});

export default function CompareIndexPage() {
  const itemListSchema = buildItemListSchema(
    COMPARE_PAIRS.map(p => {
      const a = getKrxEtfMeta(p.codeA);
      const b = getKrxEtfMeta(p.codeB);
      return {
        url: `/compare/${p.slug}`,
        name: a && b ? `${a.name} vs ${b.name}` : p.slug,
      };
    }),
    `ETF 1:1 비교 ${COMPARE_PAIRS.length}쌍`,
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
          KODEX vs TIGER · SCHD 한국판 비교 · 환헤지 vs 비헷지 등 자주 검색되는 1:1 비교를 한 페이지에 정리. 시세·구성종목·운용사 차이를 한눈에.
        </p>
      </header>

      <section className="compare-index-section">
        {/* H1 다음 단계 헤딩이 없어 h1 → (없음) 구조였다. 검색 의도 키워드를 담아 H2 추가. */}
        <h2 className="compare-index-h2">자주 비교되는 ETF {COMPARE_PAIRS.length}쌍</h2>
        <ul className="compare-index-list">
          {COMPARE_PAIRS.map(p => {
            const a = getKrxEtfMeta(p.codeA);
            const b = getKrxEtfMeta(p.codeB);
            if (!a || !b) return null;
            return (
              <li key={p.slug}>
                <Link href={`/compare/${p.slug}`} className="compare-index-card">
                  <div className="compare-index-card-pair">
                    <strong>{a.name}</strong>
                    <span className="compare-index-vs">vs</span>
                    <strong>{b.name}</strong>
                  </div>
                  <div className="compare-index-card-context">{p.context}</div>
                  <div className="compare-index-card-codes">
                    {a.shortcode} · {b.shortcode}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
