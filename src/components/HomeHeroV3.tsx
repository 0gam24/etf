import Link from 'next/link';
import { ArrowRight, Zap, Radio } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { extractPulseBullets, freshnessLabel } from '@/lib/pulse';
import { getEtfHoldings } from '@/lib/data';

interface TopEtf {
  code: string;
  name: string;
  price: number;
  change: number;
  changeRate?: number;
  volume: number;
}

interface CatalystNews {
  title: string;
  source: string;
}

interface Props {
  latestPulse: Post | null;
  topEtf: TopEtf | null;
  /** 오늘의 도화선 — topEtf 관련 속보 첫 헤드라인. breaking 포스트에서 추출. */
  catalystNews?: CatalystNews | null;
  /** 속보 포스트로 이동할 링크 (클릭 시 /breaking/{slug}) */
  catalystHref?: string;
}

export default function HomeHeroV3({ latestPulse, topEtf, catalystNews, catalystHref }: Props) {
  const bullets = latestPulse ? extractPulseBullets(latestPulse, 3) : [];
  const holdings = topEtf ? getEtfHoldings(topEtf.code) : null;
  const top3 = holdings?.holdings.slice(0, 3) ?? [];
  const isUp = (topEtf?.change ?? 0) > 0;
  const isDown = (topEtf?.change ?? 0) < 0;

  return (
    <section className="home-hero-v3">
      <div className="home-hero-v3-bg" aria-hidden />
      <div className="home-hero-v3-inner">
        {/* 좌측: 오늘의 브리핑 */}
        <div className="home-hero-v3-left">
          <div className="home-hero-v3-meta">
            <span className="home-hero-v3-pill">
              <Zap size={13} strokeWidth={3} aria-hidden /> DAILY ETF PULSE
            </span>
            {latestPulse && (
              <span className="home-hero-v3-fresh">
                {new Date(latestPulse.meta.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                <span className="home-hero-v3-dot" aria-hidden />
                {freshnessLabel(latestPulse.meta.date)} 발행
              </span>
            )}
          </div>

          <h1 className="home-hero-v3-title">
            오늘 뜨는 ETF, <span className="gradient">왜 오르는지</span>까지<br />
            <span className="accent">맥락과 근거</span>로 설명합니다.
          </h1>

          {bullets.length > 0 ? (
            <ol className="home-hero-v3-bullets">
              {bullets.map((b, i) => (
                <li key={i}>
                  <span className="home-hero-v3-bullet-num">{i + 1}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="home-hero-v3-sub">
              거래량 1위 종목의 <strong>급등 사유</strong>, 섹터별 <strong>자금 흐름</strong>,
              커버드콜·<strong>월배당 전략</strong>까지. 4050 세대의 은퇴 자산을 지키는
              실시간 투자 의사결정 플랫폼.
            </p>
          )}

          {latestPulse && (
            <Link href={`/${latestPulse.meta.category}/${latestPulse.meta.slug}`} className="home-hero-v3-cta">
              전체 브리핑 읽기 <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {/* 우측: 오늘 거래량 1위 ETF + holdings TOP3 */}
        {topEtf && (
          <aside className="home-hero-v3-right">
            <div className="home-hero-v3-right-head">
              <span className="home-hero-v3-right-label">오늘 거래량 1위</span>
              <span className="home-hero-v3-right-code">{topEtf.code}</span>
            </div>
            <div className="home-hero-v3-etf-name">{topEtf.name}</div>

            <div className="home-hero-v3-price-row">
              <div className="home-hero-v3-price">
                {topEtf.price.toLocaleString()}<small>원</small>
              </div>
              <div className={`home-hero-v3-change ${isUp ? 'is-up' : isDown ? 'is-down' : ''}`}>
                <span className="home-hero-v3-change-arrow">{isUp ? '▲' : isDown ? '▼' : '–'}</span>
                {Math.abs(topEtf.change).toLocaleString()}원
                {typeof topEtf.changeRate === 'number' && (
                  <span className="home-hero-v3-change-pct">
                    ({isUp ? '+' : ''}{topEtf.changeRate.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>

            <div className="home-hero-v3-volume">
              거래량 <strong>{topEtf.volume.toLocaleString()}</strong>주
            </div>

            {catalystNews && (
              catalystHref ? (
                <Link href={catalystHref} prefetch={false} className="home-hero-v3-catalyst is-link">
                  <span className="home-hero-v3-catalyst-label">
                    <Radio size={12} strokeWidth={2.6} aria-hidden /> 오늘의 도화선
                  </span>
                  <span className="home-hero-v3-catalyst-text">{catalystNews.title}</span>
                  {catalystNews.source && (
                    <span className="home-hero-v3-catalyst-source">— {catalystNews.source}</span>
                  )}
                </Link>
              ) : (
                <div className="home-hero-v3-catalyst">
                  <span className="home-hero-v3-catalyst-label">
                    <Radio size={12} strokeWidth={2.6} aria-hidden /> 오늘의 도화선
                  </span>
                  <span className="home-hero-v3-catalyst-text">{catalystNews.title}</span>
                  {catalystNews.source && (
                    <span className="home-hero-v3-catalyst-source">— {catalystNews.source}</span>
                  )}
                </div>
              )
            )}

            {top3.length > 0 && (
              <div className="home-hero-v3-holdings">
                <div className="home-hero-v3-holdings-label">담긴 기업 TOP 3</div>
                <ol className="home-hero-v3-holdings-list">
                  {top3.map((h, i) => (
                    <li key={`${h.ticker || h.name}-${i}`}>
                      <span className="home-hero-v3-h-rank">{i + 1}</span>
                      <span className="home-hero-v3-h-name">{h.name}</span>
                      <span className="home-hero-v3-h-weight">{h.weight.toFixed(1)}%</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
