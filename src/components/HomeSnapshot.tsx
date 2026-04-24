import Link from 'next/link';
import { Flame, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

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
}

function formatVolume(v: number): string {
  if (v >= 10000000) return (v / 10000000).toFixed(1) + '천만';
  if (v >= 10000) return (v / 10000).toFixed(0) + '만';
  return v.toLocaleString();
}

export default function HomeSnapshot({ topVolume, topGainer, topLoser, marketAvg, totalCount }: Props) {
  const cards: Array<{
    cls: string;
    icon: React.ReactNode;
    label: string;
    big: string;
    name: string;
    sub: string;
    href?: string;
  }> = [];

  if (topVolume) cards.push({
    cls: 'snap-volume',
    icon: <Flame size={15} strokeWidth={2.4} aria-hidden />,
    label: '거래량 1위',
    big: `${formatVolume(topVolume.volume)}주`,
    name: topVolume.name,
    sub: topVolume.sector || topVolume.code,
  });

  if (topGainer) cards.push({
    cls: 'snap-up',
    icon: <ArrowUpRight size={15} strokeWidth={2.4} aria-hidden />,
    label: '상승 1위',
    big: `+${topGainer.changeRate.toFixed(2)}%`,
    name: topGainer.name,
    sub: topGainer.sector || topGainer.code,
  });

  if (topLoser) cards.push({
    cls: 'snap-down',
    icon: <ArrowDownRight size={15} strokeWidth={2.4} aria-hidden />,
    label: '하락 1위',
    big: `${topLoser.changeRate.toFixed(2)}%`,
    name: topLoser.name,
    sub: topLoser.sector || topLoser.code,
  });

  cards.push({
    cls: marketAvg >= 0 ? 'snap-market-up' : 'snap-market-down',
    icon: <Activity size={15} strokeWidth={2.4} aria-hidden />,
    label: '시장 평균',
    big: `${marketAvg >= 0 ? '+' : ''}${marketAvg.toFixed(2)}%`,
    name: `분석 종목 ${totalCount}개`,
    sub: marketAvg >= 0 ? '자금 유입 우세' : '자금 유출 우세',
  });

  if (cards.length === 0) return null;

  return (
    <section className="home-snap" aria-label="5초 시장 스냅샷">
      <div className="home-snap-grid">
        {cards.map((c, i) => {
          const inner = (
            <>
              <div className="home-snap-head">
                <span className="home-snap-icon" aria-hidden>{c.icon}</span>
                <span className="home-snap-label">{c.label}</span>
              </div>
              <div className="home-snap-big">{c.big}</div>
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
