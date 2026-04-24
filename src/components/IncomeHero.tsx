import { Coins } from 'lucide-react';

interface Props {
  etfCount: number;
  topYield: number;
  monthlyCount: number;
  asOf: string;
}

export default function IncomeHero({ etfCount, topYield, monthlyCount, asOf }: Props) {
  return (
    <section className="income-hero">
      <div className="income-hero-bg" aria-hidden />
      <div className="income-hero-inner">
        <span className="income-hero-badge">
          <Coins size={14} strokeWidth={3} aria-hidden /> INCOME · 월배당·커버드콜
        </span>
        <h1 className="income-hero-title">
          내 노후 통장은 <span className="income-hero-accent">매월 들어와야</span> 합니다.
        </h1>
        <p className="income-hero-sub">
          커버드콜·월배당 ETF의 실제 분배금, 계좌별 세후 수익률, 월 목표 현금흐름 역산까지.
          <br />4050·은퇴자가 현금흐름을 설계하는 데 필요한 수치를 한 페이지에.
        </p>
        <div className="income-hero-stats">
          <div className="income-hero-stat">
            <div className="income-hero-stat-value">{etfCount}종</div>
            <div className="income-hero-stat-label">등록된 월배당·커버드콜 ETF</div>
          </div>
          <div className="income-hero-stat">
            <div className="income-hero-stat-value">매월 {monthlyCount}종</div>
            <div className="income-hero-stat-label">월 단위 분배 지급</div>
          </div>
          <div className="income-hero-stat">
            <div className="income-hero-stat-value">최대 {topYield.toFixed(1)}%</div>
            <div className="income-hero-stat-label">연 분배율 (세전)</div>
          </div>
        </div>
        <div className="income-hero-asof">출처: 각 운용사 공시 · {asOf} 기준</div>
      </div>
    </section>
  );
}
