import Link from 'next/link';
import { Radio, ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { findEtfByCode, type RawEtf } from '@/lib/surge';
import { getEtfHoldings, getKrxEtfMeta } from '@/lib/data';

interface Props {
  posts: Post[];
  etfs: RawEtf[];
}

/**
 * 최신 속보 발행 시점 → '오늘 / 어제 / N일 전' KST 기준 라벨.
 * publish date를 ISO timestamp 로 받아 ISR 5분마다 SSR 재계산.
 */
function freshnessFor(isoDate?: string): { label: string; tone: 'fresh' | 'stale' } {
  if (!isoDate) return { label: '발행일 미상', tone: 'stale' };
  const pub = new Date(isoDate);
  if (isNaN(pub.getTime())) return { label: '발행일 미상', tone: 'stale' };
  const now = new Date();
  const pubKst = new Date(pub.getTime() + 9 * 3600 * 1000);
  const nowKst = new Date(now.getTime() + 9 * 3600 * 1000);
  const pubDay = pubKst.toISOString().slice(0, 10);
  const nowDay = nowKst.toISOString().slice(0, 10);
  if (pubDay === nowDay) return { label: '🔴 오늘 발행', tone: 'fresh' };
  // 일 단위 차이
  const diff = Math.floor((nowKst.getTime() - pubKst.getTime()) / 86400000);
  if (diff === 1) return { label: '📅 어제 발행', tone: 'stale' };
  return { label: `📅 ${diff}일 전 발행`, tone: 'stale' };
}

/**
 * Hero 직후 가로 3카드 스트립. /breaking 랜딩의 breaking-card를 축소한 형태.
 *   - 최근 속보 최대 3건을 순위·티커·등락률·제목·CTA로 표시
 *   - Hero의 "왜 오르는지" 카피를 구체화하는 역할
 */
export default function HomeBreakingStrip({ posts, etfs }: Props) {
  if (posts.length === 0) return null;

  const top = posts.slice(0, 3);
  const fresh = freshnessFor(top[0]?.meta.date);

  return (
    <section className="home-breaking-strip" aria-label="오늘의 ETF 속보">
      <div className="home-breaking-strip-head">
        <span className="home-breaking-strip-eyebrow">
          <Radio size={13} strokeWidth={2.6} aria-hidden /> TODAY&apos;S BREAKING · 오늘의 ETF 속보
          <span style={{
            marginLeft: '0.5rem',
            padding: '0.1rem 0.45rem',
            borderRadius: '0.3rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            background: fresh.tone === 'fresh' ? 'rgba(239,68,68,0.18)' : 'rgba(96,165,250,0.15)',
            color: fresh.tone === 'fresh' ? '#EF4444' : '#60A5FA',
          }}>{fresh.label}</span>
        </span>
        <Link href="/breaking" className="home-breaking-strip-more" prefetch={false}>
          전체 속보 보기 <ArrowRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="home-breaking-strip-grid">
        {top.map((p, i) => {
          const ticker = p.meta.tickers?.[0];
          const etf = ticker ? findEtfByCode(etfs, ticker) : null;
          // 시세에 없는 종목도 KRX 매핑으로 정식명 노출
          const krxName = ticker ? getKrxEtfMeta(ticker)?.name : null;
          const displayName = etf?.name || krxName || p.meta.title;
          const isUp = (etf?.changeRate ?? 0) >= 0;
          const holdings = ticker ? getEtfHoldings(ticker) : null;
          const top3 = holdings?.holdings?.slice(0, 3) ?? [];

          return (
            <Link
              key={p.meta.slug}
              href={`/${p.meta.category}/${p.meta.slug}`}
              className="home-breaking-strip-card"
              data-rank={i + 1}
              prefetch={false}
            >
              <div className="hbs-head">
                <span className="hbs-rank">#{i + 1}</span>
                {ticker && <span className="hbs-ticker" title={displayName}>{ticker}</span>}
                {etf?.sector && <span className="hbs-sector">{etf.sector}</span>}
              </div>
              <div className="hbs-name">{displayName}</div>
              {etf && (
                <div className={`hbs-change ${isUp ? 'is-up' : 'is-down'}`}>
                  {isUp ? '+' : ''}{etf.changeRate.toFixed(2)}%
                  <span className="hbs-volume">거래량 {(etf.volume / 10000).toFixed(0)}만주</span>
                </div>
              )}
              <div className="hbs-title">{p.meta.title}</div>
              {top3.length > 0 && (
                <div className="hbs-holdings" aria-label="구성 상위 3종목">
                  <div className="hbs-holdings-label">담긴 기업 TOP 3</div>
                  <ol className="hbs-holdings-list">
                    {top3.map((h, hi) => (
                      <li key={`${h.ticker || h.name}-${hi}`}>
                        <span className="hbs-h-rank">{hi + 1}</span>
                        <span className="hbs-h-name">{h.name}</span>
                        <span className="hbs-h-weight">{h.weight.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div className="hbs-cta">
                속보 전문 <ArrowRight size={12} strokeWidth={2.5} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
