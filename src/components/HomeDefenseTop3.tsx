import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import type { IncomeEtf } from '@/lib/income';
import { GRADE_META } from '@/lib/income';

interface Props {
  /** S 등급 ETF만 (없으면 A 등급까지 폴백) */
  defenseEtfs: IncomeEtf[];
}

const FREQ_LABEL: Record<string, string> = {
  monthly: '월',
  quarterly: '분기',
  'semi-annual': '반기',
  annual: '연',
};

/**
 * Chapter 5 — 위험을 직시한 뒤 곧바로 "방어선"을 보여주는 섹션.
 *   안정성 S 등급(기초자산 변동성이 낮고 분배가 가장 안정적인) ETF 상위 3종을
 *   원금이 흔들릴 때 가장 먼저 떠올릴 만한 대안으로 노출.
 *
 *   클릭 시 /income으로 이동 → 거기서 분배 캘린더·세후 계산 등 풀 도구로 연결.
 */
export default function HomeDefenseTop3({ defenseEtfs }: Props) {
  if (!defenseEtfs.length) return null;
  const top = defenseEtfs.slice(0, 3);

  return (
    <section className="home-defense" aria-label="원금 방어 — 안정성 최상위">
      <div className="home-defense-head">
        <div className="home-defense-eyebrow">
          <Shield size={14} strokeWidth={2.6} aria-hidden /> RISK · 원금이 흔들리는 날에는
        </div>
        <h2 className="home-defense-title">
          가장 먼저 떠올릴 <span className="accent">방어 라인업</span>
        </h2>
        <p className="home-defense-sub">
          과거 12개월 분배·기초자산 변동성이 가장 낮은 S 등급 종목.
          공격형 포트폴리오의 헤지로, 또는 은퇴 자산의 안전 코어로.
        </p>
      </div>

      <ul className="home-defense-list">
        {top.map((e, i) => {
          const grade = GRADE_META[e.stabilityGrade];
          return (
            <li key={e.code} className="home-defense-card">
              <div className="home-defense-card-head">
                <span className="home-defense-rank">#{i + 1}</span>
                <span className={`home-defense-grade ${grade.cls}`} title={grade.desc}>
                  {grade.label} 등급
                </span>
              </div>
              <div className="home-defense-name">{e.name}</div>
              <div className="home-defense-issuer">{e.issuer} · {e.code}</div>
              <div className="home-defense-stats">
                <div className="home-defense-yield">
                  <span className="home-defense-yield-num">{e.yield.toFixed(2)}</span>
                  <span className="home-defense-yield-unit">%</span>
                  <span className="home-defense-yield-label">연 분배율</span>
                </div>
                <div className="home-defense-meta">
                  <div>{FREQ_LABEL[e.frequency] || e.frequency} 지급</div>
                  <div className="home-defense-under">{e.underlying}</div>
                </div>
              </div>
              {e.note && <p className="home-defense-note">{e.note}</p>}
            </li>
          );
        })}
      </ul>

      <Link href="/income" className="home-defense-cta" prefetch={false}>
        분배 캘린더와 세후 수령액 도구 보기 <ArrowRight size={14} strokeWidth={2.5} />
      </Link>
    </section>
  );
}
