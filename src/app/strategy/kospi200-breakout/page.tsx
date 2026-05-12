import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import { buildBreadcrumbSchema, jsonLd } from '@/lib/schema';

interface BreakoutSignal {
  code: string;
  name?: string;
  date?: string;
  atr5?: number;
  volRatio?: number;
  open?: number;
  longTrigger?: number;
  shortTrigger?: number;
  longStop?: number;
  longTarget?: number;
  shortStop?: number;
  shortTarget?: number;
  trend?: 'up' | 'down' | 'flat';
  volPass?: boolean;
  status: string;
  summary?: string;
  historyDays?: number;
}

interface SignalFile {
  generatedAt: string;
  baseDate: string;
  strategy: string;
  params: { N: number; K_TRIGGER: number; K_STOP: number; K_TARGET: number; VOL_MIN: number };
  disclaimer: string;
  signals: BreakoutSignal[];
}

function loadLatest(): SignalFile | null {
  try {
    const file = path.join(process.cwd(), 'data', 'signals', 'breakout-latest.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  title: '코스피200 변동성 breakout 시그널 — Daily ETF Pulse',
  description: 'Andrea Unger 변동성 돌파 공식을 KOSPI200 4종(KODEX 200·인버스·레버리지)에 매일 적용한 시그널. 정보 제공 목적이며 매매 권유 아님.',
  alternates: { canonical: '/strategy/kospi200-breakout' },
};

export default function Kospi200BreakoutPage() {
  const data = loadLatest();
  const breadcrumb = buildBreadcrumbSchema([
    { name: '홈', href: '/' },
    { name: '시그널', href: '/strategy/kospi200-breakout' },
    { name: '코스피200 변동성 돌파', href: '/strategy/kospi200-breakout' },
  ]);

  return (
    <article style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />

      <Breadcrumbs items={[
        { name: '홈', href: '/' },
        { name: '시그널', href: '/strategy/kospi200-breakout' },
      ]} />

      <header style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          SIGNAL · KOSPI200
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-4)' }}>
          코스피200 변동성 돌파 시그널
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Andrea Unger 의 변동성 돌파 공식 (시초가 ± 0.5×ATR_5) 을 KOSPI200 4종에 매일 적용. 추세 필터 (20일 SMA) + 변동성 필터 (ATR/Open ≥ 0.8%) 통과 시 진입 가능 시그널 emit. 매매 권유 X — 본인 판단·책임.
        </p>
      </header>

      {data ? (
        <>
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--fs-h2)', marginBottom: 'var(--space-4)' }}>
              오늘의 시그널 ({data.baseDate})
            </h2>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {data.signals.map(s => <SignalCard key={s.code} signal={s} />)}
            </div>
          </section>

          <section style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-5)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
            <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-3)' }}>공식 파라미터</h3>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li><strong>N (ATR look-back)</strong>: {data.params.N}일</li>
              <li><strong>K_TRIGGER (진입 배수)</strong>: {data.params.K_TRIGGER} — Long {data.params.K_TRIGGER}×ATR 위 / Short {data.params.K_TRIGGER}×ATR 아래</li>
              <li><strong>K_STOP (손절 배수)</strong>: {data.params.K_STOP}</li>
              <li><strong>K_TARGET (익절 배수)</strong>: {data.params.K_TARGET}</li>
              <li><strong>VOL_MIN (최소 변동성)</strong>: {(data.params.VOL_MIN * 100).toFixed(1)}%</li>
            </ul>
          </section>
        </>
      ) : (
        <section style={{ padding: 'var(--space-8)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)' }}>
            오늘의 시그널 데이터를 준비 중입니다. 매 영업일 16:00 KST cron 이 시그널을 생성합니다.
            <br />
            <small>OHLC 시계열 축적 후 첫 시그널 발행 — 약 3주 소요</small>
          </p>
        </section>
      )}

      <section style={{ padding: 'var(--space-5)', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)' }}>
        <h3 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-3)', color: 'var(--red-400)' }}>⚠️ 면책 조항</h3>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
          <li>본 시그널은 <strong>기술적 분석 정보 제공</strong>이며 매수·매도 권유가 아닙니다.</li>
          <li>변동성 돌파 공식은 과거 데이터 기반 — 미래 성과 보장 없음.</li>
          <li>실 매매 결정과 손익의 책임은 투자자 본인에게 있습니다.</li>
          <li>실제 매매 시 슬리피지·수수료·세금 고려 필수.</li>
          <li>본 사이트는 자동 매매 기능을 제공하지 않습니다.</li>
        </ul>
      </section>
    </article>
  );
}

function SignalCard({ signal }: { signal: BreakoutSignal }) {
  const status = signal.status;
  const isReady = status === 'LONG_READY' || status === 'SHORT_READY' || status === 'BOTH_READY';
  const statusColor =
    status === 'BOTH_READY' ? 'var(--accent-gold)' :
    status === 'LONG_READY' ? 'var(--red-400)' :
    status === 'SHORT_READY' ? 'var(--blue-500)' :
    'var(--text-dim)';
  const statusKo =
    status === 'BOTH_READY' ? '양방향 가능' :
    status === 'LONG_READY' ? '매수 진입 가능' :
    status === 'SHORT_READY' ? '매도 진입 가능' :
    status === 'WAIT' ? '대기' :
    status === 'INSUFFICIENT_HISTORY' ? `데이터 축적 중 (${signal.historyDays || 0}일)` :
    '데이터 미수집';

  return (
    <div style={{
      padding: 'var(--space-5)',
      background: 'var(--bg-card)',
      border: `1px solid ${isReady ? statusColor : 'var(--border-color)'}`,
      borderRadius: 'var(--radius)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
            {signal.code}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{signal.name || signal.code}</h3>
        </div>
        <div style={{
          padding: '0.3rem 0.75rem',
          background: `${statusColor}22`,
          color: statusColor,
          borderRadius: '0.375rem',
          fontSize: '0.8rem',
          fontWeight: 700,
        }}>
          {statusKo}
        </div>
      </div>

      {signal.summary && (
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)', fontSize: '0.95rem' }}>
          {signal.summary}
        </p>
      )}

      {isReady && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)', fontSize: '0.85rem' }}>
          <Stat label="시초가" value={signal.open?.toLocaleString() + '원'} />
          <Stat label="ATR_5" value={signal.atr5?.toLocaleString()} />
          <Stat label="Long 진입" value={signal.longTrigger?.toLocaleString() + '원'} color="var(--red-400)" />
          <Stat label="Long 손절 / 익절" value={`${signal.longStop?.toLocaleString()} / ${signal.longTarget?.toLocaleString()}원`} />
          <Stat label="Short 진입" value={signal.shortTrigger?.toLocaleString() + '원'} color="var(--blue-500)" />
          <Stat label="Short 손절 / 익절" value={`${signal.shortStop?.toLocaleString()} / ${signal.shortTarget?.toLocaleString()}원`} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value?: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontVariantNumeric: 'tabular-nums', color: color || 'var(--text-primary)', fontWeight: 600 }}>
        {value || '-'}
      </div>
    </div>
  );
}
