import { ExternalLink } from 'lucide-react';

/**
 * MainBackrefBox — smartdatashop network 자매 backref.
 *
 *   본 사이트(iknowhowinfo / Daily ETF Pulse)는 smartdatashop.kr (한국 정부·공공기관
 *   1차 출처 데이터 저널)의 ETF·시장 분석 자매. 본 컴포넌트는 독자가 메인 사이트
 *   원 데이터·검증·해설로 자연 funnel 되도록 안내한다.
 *
 *   디자인 원칙 (NETWORK.md v0.6 dual-brand 인정):
 *     - 자매 자율 디자인은 dark theme 그대로 유지
 *     - 본 박스만 메인 토큰 wheat(#faf7f0) + accent(#8b1538) 적용
 *     - 7 author accent (gold/pink/blue/green/amber/violet/red) 와 색 분리
 *
 *   YMYL 안전:
 *     - "smartdatashop.kr" 문자열 변경 금지
 *     - rel="noopener noreferrer" + target="_blank"
 *     - "검증·해설"은 매수 권유 표현 아님 (BANNED_PHRASES 통과 확인 — 2026-05-07)
 */

export type BackrefAccent = 'gold' | 'pink' | 'blue' | 'green' | 'amber' | 'violet' | 'red';

interface MainBackrefBoxProps {
  /** 메인 펄스 직접 link (있으면 우선) */
  mainPulseUrl?: string;
  /** 메인 카테고리 link (펄스 없으면 카테고리 fallback) */
  mainCategoryUrl?: string;
  /** 메인 펄스/카테고리 제목 (있으면 표시) */
  pulseTitle?: string;
  /** 박스 제목 — 기본 "본 데이터 출처" */
  title?: string;
  /** 위치별 스타일 */
  variant?: 'inline' | 'sidebar' | 'footer';
  /** 7 author 페르소나별 보조 accent (선택 — 메인 accent 와 분리해서 우측 상단 작은 점으로만 표시) */
  agentAccent?: BackrefAccent;
}

const MAIN_ACCENT = '#8b1538';
const MAIN_BG = '#faf7f0';
const MAIN_BG_BORDER = '#e8dfc7';
const MAIN_HOME = 'https://smartdatashop.kr/';

const AGENT_ACCENT_MAP: Record<BackrefAccent, string> = {
  gold:   '#D4AF37',
  pink:   '#F472B6',
  blue:   '#60A5FA',
  green:  '#34D399',
  amber:  '#F59E0B',
  violet: '#A78BFA',
  red:    '#EF4444',
};

export default function MainBackrefBox({
  mainPulseUrl,
  mainCategoryUrl,
  pulseTitle,
  title = '본 데이터 출처',
  variant = 'inline',
  agentAccent,
}: MainBackrefBoxProps) {
  const targetUrl = mainPulseUrl || mainCategoryUrl || MAIN_HOME;
  const subtitle = pulseTitle || '한국 정부·공공기관 1차 출처 데이터 저널';

  const containerStyle: React.CSSProperties = {
    background: MAIN_BG,
    borderLeft: `4px solid ${MAIN_ACCENT}`,
    borderTop: `1px solid ${MAIN_BG_BORDER}`,
    borderRight: `1px solid ${MAIN_BG_BORDER}`,
    borderBottom: `1px solid ${MAIN_BG_BORDER}`,
    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
    padding: 'var(--space-4) var(--space-5)',
    fontFamily: 'inherit',
    color: '#1f2937',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    position: 'relative',
    ...(variant === 'inline'  ? { margin: 'var(--space-8) 0', maxWidth: '40rem' }
      : variant === 'sidebar' ? { position: 'sticky', top: 'var(--space-4)', maxWidth: '20rem' }
      : /* footer */            { margin: 'var(--space-12) auto 0', maxWidth: '64rem', width: '100%' }),
  };

  const eyebrowStyle: React.CSSProperties = {
    color: MAIN_ACCENT,
    fontSize: 'var(--fs-xs)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
    marginBottom: 'var(--space-1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: 'var(--fs-sm)',
    lineHeight: 1.6,
    color: '#374151',
    margin: 0,
    marginBottom: 'var(--space-2)',
  };

  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: 'var(--fs-sm)',
    fontWeight: 700,
    color: MAIN_ACCENT,
    textDecoration: 'none',
    borderBottom: `1px solid ${MAIN_ACCENT}33`,
    paddingBottom: '1px',
  };

  return (
    <aside
      style={containerStyle}
      role="complementary"
      aria-label="메인 사이트 출처 — smartdatashop.kr"
      data-network="smartdatashop"
      data-network-variant={variant}
    >
      {agentAccent && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            width: '0.5rem',
            height: '0.5rem',
            borderRadius: '50%',
            background: AGENT_ACCENT_MAP[agentAccent],
            opacity: 0.65,
          }}
        />
      )}

      <p style={eyebrowStyle}>
        <span aria-hidden>📊</span>
        {title}
      </p>
      <p style={subtitleStyle}>{subtitle}</p>
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
      >
        <span>검증·해설 →&nbsp;</span>
        <strong style={{ fontWeight: 800 }}>smartdatashop.kr</strong>
        <ExternalLink size={13} strokeWidth={2.4} aria-hidden />
      </a>
    </aside>
  );
}

/**
 * iknowhowinfo 카테고리 → 메인 backref 카테고리 매핑.
 *   CATEGORY_MAP.md §3.4 기준. 메인이 frontmatter category 필드를 지원하지 않을 때 사용.
 */
export const CATEGORY_BACKREF_MAP: Record<string, string> = {
  pulse:    'https://smartdatashop.kr/category/market/',
  surge:    'https://smartdatashop.kr/category/market/',
  flow:     'https://smartdatashop.kr/category/market/',
  income:   'https://smartdatashop.kr/category/market/',
  breaking: 'https://smartdatashop.kr/category/market/',
  stock:    'https://smartdatashop.kr/category/market/',
  etf:      'https://smartdatashop.kr/category/market/',
};

export function getBackrefUrlForCategory(category?: string): string {
  if (!category) return MAIN_HOME;
  const top = category.split('/')[0];
  return CATEGORY_BACKREF_MAP[top] || MAIN_HOME;
}
