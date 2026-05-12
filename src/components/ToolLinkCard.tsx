import { ExternalLink } from 'lucide-react';

export type ToolSlug =
  | 'portfolio'
  | 'tax-compare'
  | 'dividend-goal'
  | 'budget-etf'
  | 'fx-impact'
  | 'withdrawal'
  | 'sip'
  | 'atr-calc';

interface Props {
  tool: ToolSlug;
  title: string;
  description: string;
  icon?: string;
  /** 선택: 자매 도구 URL 직접 지정 (기본은 smartdatashop.kr/tools/{tool}) */
  url?: string;
}

const SISTER_BASE = 'https://smartdatashop.kr/tools';

/**
 * ToolLinkCard — 자매 사이트(smartdatashop.kr) 도구 link 카드.
 *
 *   iknowhowinfo 는 ETF 분석·시그널·콘텐츠에 집중하고,
 *   계산기·도구는 자매 사이트로 자연 funnel.
 *
 *   디자인: MainBackrefBox 와 동일한 wheat 톤 (네트워크 통일성).
 *   외부 link 표시: ExternalLink 아이콘 + target="_blank" + rel="sponsored noopener noreferrer".
 */
export default function ToolLinkCard({ tool, title, description, icon = '🧮', url }: Props) {
  const href = url || `${SISTER_BASE}/${tool}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      style={{
        display: 'block',
        padding: 'var(--space-4) var(--space-5)',
        background: '#faf7f0',
        border: '1px solid #e8dfc7',
        borderLeft: '4px solid #8b1538',
        borderRadius: '0 var(--radius) var(--radius) 0',
        color: '#1f2937',
        textDecoration: 'none',
        transition: 'all var(--t-base)',
      }}
      data-network="smartdatashop"
      data-tool={tool}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }} aria-hidden>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '0.3rem',
          }}>
            <strong style={{ fontSize: '0.95rem', color: '#1f2937' }}>{title}</strong>
            <ExternalLink size={12} strokeWidth={2.4} color="#8b1538" aria-hidden />
          </div>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5, color: '#4b5563', margin: 0 }}>
            {description}
          </p>
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#8b1538',
            fontWeight: 700,
          }}>
            smartdatashop.kr에서 사용 →
          </div>
        </div>
      </div>
    </a>
  );
}

// 자매 도구 메타 — 페르소나 페이지·시나리오 라우터에서 재사용
export const SISTER_TOOLS: Record<ToolSlug, { title: string; description: string; icon: string }> = {
  portfolio:      { title: '실시간 포트폴리오 시뮬레이션', description: 'ETF 코드·수량·평단가 입력 시 실시간 손익 자동 계산', icon: '📊' },
  'tax-compare':  { title: '계좌별 세후 수익률 비교',     description: 'IRP·ISA·연금저축·일반계좌 세후 누적 시뮬',          icon: '💰' },
  'dividend-goal':{ title: '목표 월 현금흐름 → 필요 원금', description: '월 100만 분배 받으려면 원금 얼마? 종목 조합 추천',    icon: '🎯' },
  'budget-etf':   { title: '예산별 매수 가능 ETF',         description: '5만원/10만원/20만원으로 살 수 있는 ETF 필터',          icon: '💳' },
  'fx-impact':    { title: '환율 영향 계산',                description: '환율 1% 변동 시 미국 ETF 평가액 영향',                icon: '🌐' },
  withdrawal:     { title: '인출 시뮬레이션',                description: '원금·월 인출액·수익률 → N년 유지 + 세금',              icon: '🏖️' },
  sip:            { title: '적립식 복리 시뮬',              description: '월 N만원 적립 → 10년 후 평가액·복리 곡선',             icon: '📈' },
  'atr-calc':     { title: 'ATR 손절·익절 계산기',         description: '종목 선택 → ATR 기반 손절·익절 자동 산출',             icon: '🎚️' },
};
