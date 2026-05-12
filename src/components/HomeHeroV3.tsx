import Link from 'next/link';
import { ArrowRight, Zap, Radio } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { extractPulseBullets, freshnessLabel } from '@/lib/pulse';
import { getEtfHoldings } from '@/lib/data';
import LiveQuoteCard from './LiveQuoteCard';
import HeroFeaturedLabel from './HeroFeaturedLabel';

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
  /** KRX 마지막 거래일 (YYYYMMDD) — 시세 데이터 기준일 정직 표기용. */
  baseDate?: string;
  /** 사이드 카드 라벨 — '오늘 상승 1위' / '오늘 거래량 1위' 등 분기. 미지정 시 거래량 1위 기본 */
  rightLabel?: string;
  /** 사이드 라벨 강조 톤 — 'gainer' (상승 빨강) | 'volume' (골드) | 'auto' */
  rightTone?: 'gainer' | 'volume' | 'auto';
}

function formatBaseDate(ymd?: string): { display: string; isToday: boolean; weekdayLabel: string } | null {
  if (!ymd || ymd.length !== 8) return null;
  const y = ymd.slice(0, 4);
  const m = ymd.slice(4, 6);
  const d = ymd.slice(6, 8);
  const iso = `${y}-${m}-${d}T00:00:00+09:00`;
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return null;
  const todayKst = new Date(Date.now() + 9 * 3600 * 1000);
  const todayYmd = `${todayKst.getUTCFullYear()}${String(todayKst.getUTCMonth() + 1).padStart(2, '0')}${String(todayKst.getUTCDate()).padStart(2, '0')}`;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const wd = weekdays[dt.getUTCDay()];
  return {
    display: `${parseInt(m, 10)}월 ${parseInt(d, 10)}일(${wd})`,
    isToday: ymd === todayYmd,
    weekdayLabel: wd,
  };
}

export default function HomeHeroV3({ latestPulse, topEtf, catalystNews, catalystHref, baseDate, rightLabel, rightTone = 'auto' }: Props) {
  const bullets = latestPulse ? extractPulseBullets(latestPulse, 3) : [];
  const holdings = topEtf ? getEtfHoldings(topEtf.code) : null;
  const top3 = holdings?.holdings.slice(0, 3) ?? [];
  const isUp = (topEtf?.change ?? 0) > 0;
  const isDown = (topEtf?.change ?? 0) < 0;
  const baseDateInfo = formatBaseDate(baseDate);
  // 휴장일·과거 baseDate면 카피를 "오늘" 대신 "최근 거래일"로 정직 표기.
  const isStaleData = baseDateInfo ? !baseDateInfo.isToday : false;

  // 오늘 날짜 (KST) — ISR 5분마다 SSR 재계산 → 자정 후 자동 갱신
  const todayLabel = (() => {
    const kst = new Date(Date.now() + 9 * 3600 * 1000);
    const m = kst.getUTCMonth() + 1;
    const d = kst.getUTCDate();
    const wd = ['일', '월', '화', '수', '목', '금', '토'][kst.getUTCDay()];
    return `${m}월 ${d}일(${wd})`;
  })();

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
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.2rem 0.55rem',
              background: 'rgba(212,175,55,0.12)',
              color: 'var(--accent-gold)',
              borderRadius: '0.375rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}>
              📅 오늘 {todayLabel}
            </span>
            {baseDateInfo && (
              <span className="home-hero-v3-fresh" title="분석 글은 직전 거래일 KRX 마감 데이터 기반">
                📚 분석 베이스: KRX {baseDateInfo.display} 종가
                {latestPulse && (
                  <>
                    <span className="home-hero-v3-dot" aria-hidden />
                    {freshnessLabel(latestPulse.meta.date)} 발행
                  </>
                )}
                <span className="home-hero-v3-dot" aria-hidden />
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>실시간 시세는 우측 →</span>
              </span>
            )}
            {!baseDateInfo && latestPulse && (
              <span className="home-hero-v3-fresh">
                {new Date(latestPulse.meta.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                <span className="home-hero-v3-dot" aria-hidden />
                {freshnessLabel(latestPulse.meta.date)} 발행
              </span>
            )}
          </div>

          <h1 className="home-hero-v3-title">
            {isStaleData ? (
              <>이번 거래일 거래량 TOP, <span className="gradient">왜 움직였나</span><br /></>
            ) : (
              <>오늘 뜨는 ETF, <span className="gradient">왜 오르는지</span>까지<br /></>
            )}
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

        {/* 우측: HERO 종목 (상승 1위 OR 거래량 1위) + holdings TOP3 */}
        {topEtf && (
          <aside className="home-hero-v3-right">
            <div className="home-hero-v3-right-head">
              {rightTone === 'gainer' ? (
                <HeroFeaturedLabel
                  code={topEtf.code}
                  initialChangeRate={topEtf.changeRate ?? 0}
                  positiveLabel={rightLabel || '오늘 상승 1위'}
                  negativeLabel={`${topEtf.code} (라이브 약세)`}
                />
              ) : (
                <span className="home-hero-v3-right-label">
                  {rightLabel
                    ? rightLabel
                    : (isStaleData ? '최근 거래일 거래량 1위' : '오늘 거래량 1위')}
                </span>
              )}
              <span className="home-hero-v3-right-code">{topEtf.code}</span>
            </div>
            <div className="home-hero-v3-etf-name">{topEtf.name}</div>

            {/* 가격·거래량을 클라이언트 컴포넌트로 분리 — 장중 30초 polling 으로 실시간 갱신.
                서버사이드 SSR 로 initial 시세 1회 렌더 → 클라이언트가 hydration 후 한투 API 폴링 */}
            <LiveQuoteCard
              initial={{
                code: topEtf.code,
                name: topEtf.name,
                price: topEtf.price,
                change: topEtf.change,
                changeRate: topEtf.changeRate,
                volume: topEtf.volume,
              }}
            />

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
