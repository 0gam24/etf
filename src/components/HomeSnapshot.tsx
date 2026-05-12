import Link from 'next/link';
import { Flame, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import CountUpNumber from './CountUpNumber';
import LiveDataBadge from './LiveDataBadge';

interface Etf {
  code: string;
  name: string;
  price?: number;
  change?: number;
  changeRate: number;
  volume: number;
  sector?: string;
}

interface Props {
  topVolume: Etf | null;
  topGainer: Etf | null;
  topLoser: Etf | null;
  marketAvg: number;
  totalCount: number;
  /** KRX baseDate (YYYYMMDD) — 데이터 출처·갱신 시점 표기용 */
  baseDate?: string;
}

interface BigValue {
  /** 정적 prefix (예: 빈 문자열) */
  prefix?: string;
  /** count-up 최종값 */
  value: number;
  /** 부호 (등락률용) */
  sign?: boolean;
  /** 소수점 자리수 */
  decimals?: number;
  /** 단위 (예: '%', '주', '만주') */
  suffix?: string;
  /** 천 단위 콤마 */
  comma?: boolean;
}

/**
 * 거래량은 너무 큰 숫자(수천만)를 카운트업하면 시각적으로 부담 → 단위 환산 후 카운트.
 *  - 1천만 이상: '0.0천만주' 단위
 *  - 1만 이상:   '0만주' 단위
 *  - 그 외:      그대로
 */
function buildVolumeBig(v: number): BigValue {
  if (v >= 10000000) return { value: +(v / 10000000).toFixed(1), decimals: 1, suffix: '천만주' };
  if (v >= 10000) return { value: Math.round(v / 10000), decimals: 0, suffix: '만주' };
  return { value: v, decimals: 0, suffix: '주' };
}

export default function HomeSnapshot({ topVolume, topGainer, topLoser, marketAvg, totalCount, baseDate }: Props) {
  const cards: Array<{
    cls: string;
    icon: React.ReactNode;
    label: string;
    big: BigValue;
    name: string;
    sub: string;
    href?: string;
  }> = [];

  if (topVolume) cards.push({
    cls: 'snap-volume',
    icon: <Flame size={15} strokeWidth={2.4} aria-hidden />,
    label: '거래량 1위',
    big: buildVolumeBig(topVolume.volume),
    name: topVolume.name,
    sub: topVolume.sector || topVolume.code,
  });

  if (topGainer) cards.push({
    cls: 'snap-up',
    icon: <ArrowUpRight size={15} strokeWidth={2.4} aria-hidden />,
    label: '상승 1위',
    big: { value: topGainer.changeRate, decimals: 2, suffix: '%', sign: true },
    name: topGainer.name,
    sub: topGainer.sector || topGainer.code,
  });

  if (topLoser) cards.push({
    cls: 'snap-down',
    icon: <ArrowDownRight size={15} strokeWidth={2.4} aria-hidden />,
    label: '하락 1위',
    big: { value: topLoser.changeRate, decimals: 2, suffix: '%' },
    name: topLoser.name,
    sub: topLoser.sector || topLoser.code,
  });

  cards.push({
    cls: marketAvg >= 0 ? 'snap-market-up' : 'snap-market-down',
    icon: <Activity size={15} strokeWidth={2.4} aria-hidden />,
    label: '시장 평균',
    big: { value: marketAvg, decimals: 2, suffix: '%', sign: true },
    name: `분석 종목 ${totalCount}개`,
    sub: marketAvg >= 0 ? '자금 유입 우세' : '자금 유출 우세',
  });

  if (cards.length === 0) return null;

  return (
    <section className="home-snap" aria-label="5초 시장 스냅샷">
      {baseDate && (
        <div style={{ maxWidth: '80rem', margin: '0 auto var(--space-3)', padding: '0 var(--space-5)', display: 'flex', justifyContent: 'flex-end' }}>
          <LiveDataBadge source="krx" baseDate={baseDate} compact />
        </div>
      )}
      <div className="home-snap-grid">
        {cards.map((c, i) => {
          const inner = (
            <>
              <div className="home-snap-head">
                <span className="home-snap-icon" aria-hidden>{c.icon}</span>
                <span className="home-snap-label">{c.label}</span>
              </div>
              <div className="home-snap-big">
                <CountUpNumber
                  value={c.big.value}
                  decimals={c.big.decimals}
                  suffix={c.big.suffix}
                  sign={c.big.sign}
                  comma={c.big.comma}
                />
              </div>
              <div className="home-snap-name">{c.name}</div>
              <div className="home-snap-sub">{c.sub}</div>
            </>
          );
          return c.href ? (
            <Link key={i} href={c.href} className={`home-snap-card ${c.cls}`}>{inner}</Link>
          ) : (
            <div key={i} className={`home-snap-card ${c.cls}`}>{inner}</div>
          );
        })}
      </div>
    </section>
  );
}
