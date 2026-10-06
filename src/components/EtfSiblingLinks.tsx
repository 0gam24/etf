import Link from 'next/link';
import type { EtfSiblingInfo, EtfSiblingRow } from '@/lib/etf-siblings';

/**
 * /etf/[ticker] "같은 지수 이름의 다른 ETF" 블록.
 *   같은 묶음 상품(현재 상품 포함)의 같은 날 종가·괴리율·시가총액·거래대금 표,
 *   괄호 표기(H·합성 등)만 다른 상품 링크, 1:1 비교 페이지 링크를 한 섹션에 둔다.
 *   데이터 묶음 규칙은 src/lib/etf-siblings.ts 참고. 표기 문구는 "같은 지수를 따른다"고 단정하지 않는다.
 */

interface Props {
  info: EtfSiblingInfo;
  /** 페이지의 h2 순번 (렌더될 때만 page.tsx에서 매긴다) */
  sectionNo: number;
  /** 현재 페이지 상품명 */
  currentName: string;
}

function signedPct(v: number): string {
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
}

/** 원 → 억원. 1억 미만은 반올림하면 0이 되어 오해를 부르니 "1억 미만"으로 적는다. */
function formatEok(v: number | undefined): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '-';
  if (v < 1e8) return '1억 미만';
  return `${Math.round(v / 1e8).toLocaleString('ko-KR')}억`;
}

function PriceCell({ row, commonIsoDate }: { row: EtfSiblingRow; commonIsoDate: string | null }) {
  if (typeof row.price !== 'number') return <>-</>;
  const differs = !!row.priceIsoDate && row.priceIsoDate !== commonIsoDate;
  return (
    <>
      {row.price.toLocaleString('ko-KR')}원
      {differs && <span className="etf-sibling-date">{row.priceIsoDate}</span>}
    </>
  );
}

export default function EtfSiblingLinks({ info, sectionNo, currentName }: Props) {
  const { indexKey, rows, variants, extraPairs, commonIsoDate, groupSize, isActive } = info;
  const label = indexKey?.label || '';
  const baseLabel = indexKey?.baseLabel || label;
  const hasTable = rows.length >= 2;
  const othersShown = rows.filter(r => !r.isCurrent).length;
  const othersTotal = Math.max(0, groupSize - 1);

  // 괄호 표기 설명: 실제로 나온 표기만 풀어 쓴다 (신용등급 등 다른 표기만 있으면 일반 문구)
  const parenNames = [label, ...variants.map(v => v.name)];
  const hasHedge = parenNames.some(n => /\((?:[^)]*\s)?H\)/.test(n));
  const hasSynthetic = parenNames.some(n => n.includes('합성'));
  const variantNote = hasHedge && hasSynthetic
    ? '(H)는 환율 변동을 줄이는 환헤지형, (합성)은 스와프 계약으로 지수 수익률을 받는 구조라는 뜻입니다.'
    : hasHedge
      ? '(H)는 환율 변동을 줄이는 환헤지형이라는 뜻입니다.'
      : hasSynthetic
        ? '(합성)은 스와프 계약으로 지수 수익률을 받는 구조라는 뜻입니다.'
        : '괄호 안 표기(편입 채권 신용등급 등)만 다른 상품입니다.';

  const heading = hasTable
    ? `${label} ETF 운용사별 비교`
    : variants.length > 0
      ? `${baseLabel} 이름을 쓰는 다른 ETF`
      : `${currentName} 1:1 비교`;

  return (
    <section className="etf-dict-section etf-sibling" aria-labelledby="etf-sibling-heading">
      <h2 className="etf-dict-h2" id="etf-sibling-heading">{sectionNo}. {heading}</h2>

      {hasTable && (
        <>
          <p className="etf-sibling-lead">
            <strong>{label}</strong> 이름을 쓰는 ETF는 이 상품을 포함해 {groupSize}종입니다.
            {othersShown < othersTotal
              ? ` 다른 상품 ${othersTotal}종 가운데 시가총액 상위 ${othersShown}종을 함께 놓았습니다.`
              : ' 모두 표에 담았습니다.'}
            {' '}시가총액이 큰 순서이며, 이름을 누르면 그 상품의 종목 정보로 이동합니다.
          </p>
          <div className="etf-sibling-table-wrap">
            <table className="etf-sibling-table">
              <caption className="etf-sibling-caption">
                {label} ETF 운용사별 시세 비교{commonIsoDate ? ` (${commonIsoDate} 종가 기준)` : ''}
              </caption>
              <thead>
                <tr>
                  <th scope="col">상품</th>
                  <th scope="col" className="is-num">종가</th>
                  <th scope="col" className="is-num">괴리율</th>
                  <th scope="col" className="is-num">시가총액</th>
                  <th scope="col" className="is-num etf-sibling-col-opt">거래대금</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.code} className={r.isCurrent ? 'is-current' : undefined}>
                    <th scope="row">
                      {r.isCurrent ? (
                        <span className="etf-sibling-name">{r.name}</span>
                      ) : (
                        <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-sibling-name">{r.name}</Link>
                      )}
                      <span className="etf-sibling-meta">
                        {r.code}
                        {r.isCurrent && <span className="etf-sibling-here">이 페이지</span>}
                      </span>
                      {r.comparePairSlug && (
                        <Link href={`/compare/${r.comparePairSlug}`} prefetch={false} className="etf-sibling-compare">
                          1:1 비교 보기
                        </Link>
                      )}
                    </th>
                    <td className="is-num"><PriceCell row={r} commonIsoDate={commonIsoDate} /></td>
                    <td className="is-num">{typeof r.navGapPct === 'number' ? signedPct(r.navGapPct) : '-'}</td>
                    <td className="is-num">{formatEok(r.marketCap)}</td>
                    <td className="is-num etf-sibling-col-opt">{formatEok(r.tradeAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="etf-dict-source">
            출처: 한국거래소(KRX) 공공데이터
            {commonIsoDate ? ` · ${commonIsoDate} 종가 기준` : ' · 종가 옆 날짜가 그 상품의 시세 기준일'}
            {' '}· 괴리율 = (종가 - NAV) ÷ NAV × 100, 같은 날 종가와 NAV로 계산
          </p>
          <p className="etf-dict-note">
            운용사 브랜드를 뺀 상품명이 같은 ETF를 모았습니다. 이름이 같아도 기초지수 산출 기관, 분배 기준일, 총보수가 다를 수 있으니
            고르기 전에 각 운용사 투자설명서의 기초지수와 보수 항목을 확인하세요.
            {isActive
              ? ' 액티브 ETF는 비교지수를 기준으로 삼되 운용사가 종목과 비중을 조정하므로, 같은 이름이라도 성과가 갈릴 수 있습니다.'
              : ' 거래대금이 큰 상품일수록 매수·매도 호가 간격이 좁아 원하는 가격에 사고팔기 쉽고, 괴리율이 0에 가까울수록 순자산가치(NAV)에 가까운 가격에 거래됐다는 뜻입니다.'}
          </p>
        </>
      )}

      {variants.length > 0 && (
        <div className="etf-sibling-block">
          {hasTable && <h3 className="etf-sibling-h3">괄호 표기가 다른 {baseLabel} 상품</h3>}
          <p className="etf-sibling-sub">{variantNote} 시가총액이 큰 순서입니다.</p>
          <ul className="etf-sibling-chips">
            {variants.map(v => (
              <li key={v.code}>
                <Link href={`/etf/${v.slug}`} prefetch={false} className="etf-sibling-chip">
                  <span className="etf-sibling-chip-name">{v.name}</span>
                  <span className="etf-sibling-chip-meta">
                    {v.code}
                    {typeof v.marketCap === 'number' ? ` · 시가총액 ${formatEok(v.marketCap)}` : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {extraPairs.length > 0 && (
        <div className="etf-sibling-block">
          {(hasTable || variants.length > 0) && <h3 className="etf-sibling-h3">{currentName} 1:1 비교 페이지</h3>}
          <ul className="etf-sibling-pairs">
            {extraPairs.map(p => (
              <li key={p.slug}>
                <Link href={`/compare/${p.slug}`} prefetch={false} className="etf-sibling-pair-link">
                  {currentName} vs {p.partnerName}
                </Link>
                <span className="etf-sibling-pair-context">{p.context}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
