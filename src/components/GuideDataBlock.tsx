import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getIncomeRegistry } from '@/lib/income-server';
import { buildMonthlyMatrix, GRADE_META, type IncomeEtf } from '@/lib/income';
import { getLatestEtfData } from '@/lib/data';
import { getPostsByCategory } from '@/lib/posts';
import IncomeTaxCompare from './IncomeTaxCompare';
import IncomeCalendar from './IncomeCalendar';

interface Props {
  block: NonNullable<import('@/lib/guides').GuideSection['dataBlock']>;
}

const FREQ_LABEL: Record<string, string> = {
  monthly: '월',
  quarterly: '분기',
  'semi-annual': '반기',
  annual: '연',
};

/**
 * 가이드 페이지 본문에 dataBlock 키가 있을 때 동적 데이터 블록을 렌더.
 *  - income-* : registry → 표/캘린더/세후비교
 *  - covered-call-comparison: 등록 ETF 중 커버드콜 표기 종목 비교
 *  - theme-etf-list:{섹터}: 오늘 시세 + 등락률
 *  - related-posts:{카테고리}: 최근 글 6편
 *  - top-volume-snapshot: 오늘 거래량 1위 + holdings
 */
export default function GuideDataBlock({ block }: Props) {
  // ── income-* ──
  if (block.startsWith('income-')) {
    const registry = getIncomeRegistry();
    if (!registry) {
      return <div className="guide-block-empty">데이터를 불러오지 못했습니다.</div>;
    }

    if (block === 'income-stability-table') {
      const order: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
      const sorted = [...registry.etfs].sort(
        (a, b) => order[a.stabilityGrade] - order[b.stabilityGrade] || b.yield - a.yield,
      );
      return <StabilityTable etfs={sorted} />;
    }

    if (block === 'income-monthly-calendar') {
      const cells = buildMonthlyMatrix(registry.etfs);
      return <IncomeCalendar cells={cells} etfs={registry.etfs} />;
    }

    if (block === 'income-tax-compare') {
      // 안정성 상위 3종을 비교 대상으로
      const order: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };
      const top3 = [...registry.etfs]
        .sort((a, b) => order[a.stabilityGrade] - order[b.stabilityGrade] || b.yield - a.yield)
        .slice(0, 3);
      return <IncomeTaxCompare etfs={top3} />;
    }

    if (block === 'income-yield-ranking') {
      const sorted = [...registry.etfs].sort((a, b) => b.yield - a.yield).slice(0, 8);
      return <YieldRanking etfs={sorted} />;
    }
  }

  // ── covered-call-comparison ──
  if (block === 'covered-call-comparison') {
    const registry = getIncomeRegistry();
    if (!registry) return <div className="guide-block-empty">데이터를 불러오지 못했습니다.</div>;
    // 커버드콜 키워드 매칭 (이름·기초자산 기반)
    const cc = registry.etfs.filter(
      e => /커버드콜|covered\s*call|JEPI|QYLD|XYLD|JEPQ/i.test(`${e.name} ${e.underlying} ${e.note || ''}`),
    );
    return <StabilityTable etfs={cc.length ? cc : registry.etfs} />;
  }

  // ── theme-etf-list:{sector} ──
  if (block.startsWith('theme-etf-list:')) {
    const sector = block.replace('theme-etf-list:', '');
    const etfData = getLatestEtfData();
    const list = (etfData?.etfList || []) as Array<{
      code: string; name: string; price: number; change: number; changeRate: number;
      volume: number; sector?: string;
    }>;
    const matched = list.filter(e => (e.sector || '').includes(sector)).slice(0, 8);
    if (!matched.length) {
      return <div className="guide-block-empty">{sector} 섹터 ETF 데이터가 아직 수집되지 않았습니다.</div>;
    }
    return <ThemeEtfList etfs={matched} />;
  }

  // ── related-posts:{category} ──
  if (block.startsWith('related-posts:')) {
    const category = block.replace('related-posts:', '');
    const posts = getPostsByCategory(category).slice(0, 6);
    if (!posts.length) {
      return <div className="guide-block-empty">관련 분석이 아직 없습니다.</div>;
    }
    return (
      <ul className="guide-block-related">
        {posts.map(p => (
          <li key={p.meta.slug}>
            <Link href={`/${p.meta.category}/${p.meta.slug}`} prefetch={false}>
              <span className="guide-block-related-date">
                {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </span>
              <span className="guide-block-related-title">{p.meta.title}</span>
              <ArrowRight size={12} strokeWidth={2.5} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

function StabilityTable({ etfs }: { etfs: IncomeEtf[] }) {
  return (
    <div className="guide-block-table-wrap">
      <table className="guide-block-table">
        <thead>
          <tr>
            <th>ETF</th>
            <th>운용사</th>
            <th>안정성</th>
            <th>분배율</th>
            <th>지급</th>
            <th>기초자산</th>
          </tr>
        </thead>
        <tbody>
          {etfs.map(e => {
            const grade = GRADE_META[e.stabilityGrade];
            return (
              <tr key={e.code}>
                <td className="guide-block-table-name">
                  <strong>{e.name}</strong>
                  <span className="guide-block-table-code">{e.code}</span>
                </td>
                <td>{e.issuer}</td>
                <td><span className={`guide-grade ${grade.cls}`}>{grade.label}</span></td>
                <td className="guide-block-table-num">{e.yield.toFixed(2)}%</td>
                <td>{FREQ_LABEL[e.frequency] || e.frequency}</td>
                <td className="guide-block-table-under">{e.underlying}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function YieldRanking({ etfs }: { etfs: IncomeEtf[] }) {
  return (
    <ul className="guide-yield-ranking">
      {etfs.map((e, i) => (
        <li key={e.code}>
          <span className="guide-yield-rank">#{i + 1}</span>
          <span className="guide-yield-name">{e.name}</span>
          <span className="guide-yield-num">{e.yield.toFixed(2)}%</span>
        </li>
      ))}
    </ul>
  );
}

function ThemeEtfList({ etfs }: {
  etfs: Array<{ code: string; name: string; price: number; change: number; changeRate: number; volume: number; sector?: string }>;
}) {
  return (
    <ul className="guide-theme-list">
      {etfs.map(e => {
        const isUp = e.changeRate >= 0;
        return (
          <li key={e.code} className="guide-theme-row">
            <Link href={`/stock/${e.code}`} prefetch={false}>
              <div className="guide-theme-name">
                <strong>{e.name}</strong>
                <span className="guide-theme-code">{e.code}</span>
              </div>
              <div className="guide-theme-stats">
                <div className={`guide-theme-change ${isUp ? 'is-up' : 'is-down'}`}>
                  {isUp ? '+' : ''}{e.changeRate.toFixed(2)}%
                </div>
                <div className="guide-theme-volume">거래 {(e.volume / 10000).toFixed(0)}만주</div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
