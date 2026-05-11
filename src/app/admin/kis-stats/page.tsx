import type { Metadata } from 'next';
import StatsClient from './StatsClient';

export const metadata: Metadata = {
  title: 'KIS API 호출량 통계 — 운영자 대시보드',
  description: '한국투자증권 OpenAPI 일별 호출량·성공률·폴백률 모니터링.',
  robots: { index: false, follow: false }, // 검색 색인 회피
};

/**
 * /admin/kis-stats — 한투 OpenAPI 호출량 모니터링 페이지 (운영자용).
 *
 *   - 최근 7일 일별 통계 표시 (총 호출·성공·폴백·mock)
 *   - 분당 호출량 추정 + 한투 한도 (20/min) 대비 안전 여백
 *   - KV 활성 여부 + 토큰 발급 1일 1회 원칙 준수 여부
 *
 *   robots noindex 처리됨. URL 알면 누구나 접근 가능하나 통계만 노출 (민감 정보 X).
 */
export default function KisStatsPage() {
  return (
    <article style={{ maxWidth: '60rem', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          ADMIN · MONITORING
        </div>
        <h1 style={{ fontSize: 'var(--fs-h1)', marginBottom: 'var(--space-3)' }}>
          KIS API 호출량 통계
        </h1>
        <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
          한국투자증권 OpenAPI 호출 추적. 분당 한도 20회 / 1일 토큰 발급 1회 원칙 모니터링.
          데이터는 /api/kis/stats 에서 실시간 fetch.
        </p>
      </header>

      <StatsClient />

      <section style={{ marginTop: 'var(--space-10)', padding: 'var(--space-5)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}>
        <h2 style={{ fontSize: 'var(--fs-h3)', marginBottom: 'var(--space-3)' }}>안전 한도 가이드</h2>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '1.25rem' }}>
          <li><strong>한투 분당 한도</strong>: ~20호출 (시세 endpoint)</li>
          <li><strong>일일 토큰 발급</strong>: 1회 원칙 (KV 캐시로 자동 준수)</li>
          <li><strong>edge 캐시</strong>: 장중 30s / 마감 30min / 휴장 24h</li>
          <li><strong>위험 신호</strong>: 분당 평균 15 초과, fallback 비율 5% 초과, 24h 토큰 발급 2회 이상</li>
        </ul>
      </section>
    </article>
  );
}
