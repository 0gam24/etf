import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Waves, Coins } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { extractPulseBullets } from '@/lib/pulse';
import { getKrxEtfMeta } from '@/lib/data';
import IncomeMiniCalculator from './IncomeMiniCalculator';

interface Props {
  latestPulse: Post | null;
  latestSurge: Post | null;
  latestFlow: Post | null;
  /** 가장 안정적인 income ETF (S급 1순위) */
  topIncomeEtf: { name: string; yield: number } | null;
}

export default function HomeScenarioRouter({
  latestPulse,
  latestSurge,
  latestFlow,
  topIncomeEtf,
}: Props) {
  const pulseFirstBullet = latestPulse ? extractPulseBullets(latestPulse, 1)[0] : null;

  return (
    <section className="scenario-router">
      <div className="scenario-router-head">
        <div className="scenario-router-eyebrow">WHY NOW · 왜 지금</div>
        <h2 className="scenario-router-title">
          오늘 당신이 봐야 할 <span className="accent">단 하나</span>는?
        </h2>
        <p className="scenario-router-sub">
          오늘의 시장이 던진 4가지 질문. 본인의 상황과 가장 가까운 한 칸을 고르세요.
        </p>
      </div>

      <div className="scenario-grid">
        {/* 1. PULSE */}
        <Link href="/pulse" className="scenario-card scenario-pulse">
          <div className="scenario-card-icon"><Zap size={20} strokeWidth={2.4} aria-hidden /></div>
          <div className="scenario-card-meta">PULSE · 매일 9시</div>
          <h3 className="scenario-card-q">&ldquo;오늘 뭘 봐야 하지?&rdquo;</h3>
          <p className="scenario-card-promise">
            출근 전 5분, 오늘 시장의 무게중심을 한 호흡에 잡습니다.
          </p>
          {latestPulse && (
            <div className="scenario-card-preview">
              <div className="scenario-card-preview-label">오늘의 포커스</div>
              <div className="scenario-card-preview-line">
                {pulseFirstBullet || latestPulse.meta.description}
              </div>
            </div>
          )}
          <div className="scenario-card-cta">
            오늘의 관전포인트 보기 <ArrowRight size={14} strokeWidth={2.5} />
          </div>
        </Link>

        {/* 2. SURGE */}
        <Link href="/surge" className="scenario-card scenario-surge">
          <div className="scenario-card-icon"><TrendingUp size={20} strokeWidth={2.4} aria-hidden /></div>
          <div className="scenario-card-meta">SURGE · 급등 ETF 분석</div>
          <h3 className="scenario-card-q">&ldquo;이 ETF, 사도 되나?&rdquo;</h3>
          <p className="scenario-card-promise">
            오늘 거래량 1위가 왜 올랐고, 내일도 갈 수 있는지 근거를 따집니다.
          </p>
          {latestSurge && (
            <div className="scenario-card-preview">
              <div className="scenario-card-preview-label">최신 분석</div>
              <div className="scenario-card-preview-line">{latestSurge.meta.title}</div>
              {latestSurge.meta.tickers && latestSurge.meta.tickers[0] && (
                <div className="scenario-card-tickers">
                  {latestSurge.meta.tickers.slice(0, 3).map(t => {
                    const name = getKrxEtfMeta(t)?.name;
                    return (
                      <span key={t} className="scenario-ticker-chip" title={name || undefined}>
                        {name ? (
                          <>
                            <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>
                            <span style={{ opacity: 0.7, marginLeft: '0.25rem' }}>· {t}</span>
                          </>
                        ) : t}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="scenario-card-cta">
            급등 테마 들여다보기 <ArrowRight size={14} strokeWidth={2.5} />
          </div>
        </Link>

        {/* 3. FLOW */}
        <Link href="/flow" className="scenario-card scenario-flow">
          <div className="scenario-card-icon"><Waves size={20} strokeWidth={2.4} aria-hidden /></div>
          <div className="scenario-card-meta">FLOW · 주간 자금 흐름</div>
          <h3 className="scenario-card-q">&ldquo;큰 흐름은 어디로?&rdquo;</h3>
          <p className="scenario-card-promise">
            기관·외국인의 손이 일주일째 어느 섹터로 옮겨가고 있는지 한눈에.
          </p>
          {latestFlow && (
            <div className="scenario-card-preview">
              <div className="scenario-card-preview-label">이번 주 리포트</div>
              <div className="scenario-card-preview-line">{latestFlow.meta.title}</div>
            </div>
          )}
          <div className="scenario-card-cta">
            자금 흐름 리포트 <ArrowRight size={14} strokeWidth={2.5} />
          </div>
        </Link>

        {/* 4. INCOME — 미니 계산기 임베드 */}
        <div className="scenario-card scenario-income">
          <div className="scenario-card-icon"><Coins size={20} strokeWidth={2.4} aria-hidden /></div>
          <div className="scenario-card-meta">INCOME · 월배당·커버드콜</div>
          <h3 className="scenario-card-q">&ldquo;월 OO만원 받으려면?&rdquo;</h3>
          <p className="scenario-card-promise">
            은퇴 자산이 매달 통장에 꽂히려면 얼마가 필요한지 즉시 계산합니다.
          </p>
          {topIncomeEtf ? (
            <IncomeMiniCalculator
              defaultEtfName={topIncomeEtf.name}
              defaultYield={topIncomeEtf.yield}
            />
          ) : (
            <Link href="/income" className="scenario-card-cta">
              월배당 도구 열기 <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
