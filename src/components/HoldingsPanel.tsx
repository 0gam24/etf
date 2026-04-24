import Link from 'next/link';
import { getEtfHoldings } from '@/lib/data';
import { findStockPostByTicker } from '@/lib/posts';

interface HoldingsPanelProps {
  /** ETF 종목코드 (KRX 6자리) */
  code: string;
  /** 섹션 라벨 (기본: "이 ETF에 담긴 기업 TOP 5") */
  label?: string;
  /** 표시할 종목 수 (기본 5) */
  limit?: number;
  /** variant: "home"은 가로 2컬럼 내부용, "detail"은 독립 섹션용 */
  variant?: 'home' | 'detail';
  /** 표시용 기준일 덮어쓰기 — KRX baseDate(YYYYMMDD 또는 YYYY-MM-DD) 등을 전달해 전 페이지 일관성 확보 */
  asOfOverride?: string;
}

/** "20260423" · "2026-04-23" · "20260423T..." 형태를 "2026-04-23"로 정규화 */
function normalizeAsOf(s?: string): string {
  if (!s) return '';
  const digits = s.replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length === 8) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  return s;
}

export default function HoldingsPanel({
  code,
  label = '이 ETF에 담긴 기업 TOP 5',
  limit = 5,
  variant = 'home',
  asOfOverride,
}: HoldingsPanelProps) {
  const data = getEtfHoldings(code);
  const displayAsOf = normalizeAsOf(asOfOverride) || data?.asOf || '';

  if (!data || data.holdings.length === 0) {
    if (variant === 'home') {
      return (
        <div className="holdings-panel holdings-panel-empty">
          <span className="holdings-panel-label">이 ETF에 담긴 기업</span>
          <p className="holdings-empty-text">구성종목 데이터가 곧 업데이트됩니다.</p>
        </div>
      );
    }
    return null;
  }

  const items = data.holdings.slice(0, limit);
  const wrapClass = variant === 'detail' ? 'holdings-panel holdings-panel-detail' : 'holdings-panel';

  return (
    <div className={wrapClass}>
      <div className="holdings-panel-head">
        <span className="holdings-panel-label">{label}</span>
        {displayAsOf && <span className="holdings-panel-asof">{displayAsOf} 기준</span>}
      </div>
      <ol className="holdings-list">
        {items.map((h, i) => {
          const linkedPost = h.ticker ? findStockPostByTicker(h.ticker) : null;
          return (
            <li
              key={`${h.ticker || h.name}-${i}`}
              className={`holdings-row ${linkedPost ? 'holdings-row-clickable' : ''}`}
            >
              <span className="holdings-rank">{i + 1}</span>
              <span className="holdings-name">
                {linkedPost ? (
                  <Link
                    href={`/stock/${linkedPost.meta.slug}`}
                    prefetch={false}
                    className="holdings-row-link"
                  >
                    {h.name}
                  </Link>
                ) : (
                  h.name
                )}
              </span>
              <span className="holdings-weight-bar" aria-hidden>
                <span
                  className="holdings-weight-fill"
                  style={{ width: `${Math.min(h.weight * 3, 100)}%` }}
                />
              </span>
              <span className="holdings-weight-num">{h.weight.toFixed(1)}%</span>
            </li>
          );
        })}
      </ol>
      <div className="holdings-panel-foot">
        출처: {data.source} · 비중은 정기 갱신
      </div>
    </div>
  );
}
