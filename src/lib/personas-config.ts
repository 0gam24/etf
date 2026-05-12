/**
 * 페르소나 entry page 7종 메타 + 추천 자매 도구 + 관련 글 카테고리.
 *
 *   각 페이지는 src/app/for/[persona]/page.tsx 동적 라우트가 SSR.
 *   글 매칭은 frontmatter personas 태그 또는 카테고리 기반 fallback.
 */
import type { ToolSlug } from '@/components/ToolLinkCard';

export type PersonaSlug =
  | 'retiree'
  | 'newbie'
  | 'freelancer'
  | 'trader'
  | 'working-couple'
  | 'global'
  | 'early-retire';

export interface PersonaConfig {
  slug: PersonaSlug;
  displayName: string;          // "은퇴 후 분배 의존" 등
  hero: {
    eyebrow: string;            // "FOR · RETIREE"
    title: string;
    subtitle: string;
  };
  scenario: string;             // 시나리오 라우터에서 표시될 한 줄
  /** 자매 도구 추천 (1~3개) */
  tools: ToolSlug[];
  /** 글 매칭에 사용할 카테고리 우선순위 */
  categoryPriority: string[];
  /** 자체 사이트 강조 link (시그널·도구 페이지) */
  internalLinks: Array<{ href: string; label: string; description: string }>;
  /** 자매 카테고리 매핑 (MainBackrefBox 와 동일 패턴) */
  mainSiteCategoryUrl?: string;
}

export const PERSONAS: Record<PersonaSlug, PersonaConfig> = {
  retiree: {
    slug: 'retiree',
    displayName: '은퇴 후 분배 의존',
    hero: {
      eyebrow: 'FOR · RETIREE',
      title: '매월 분배금으로 생활하는 분들께',
      subtitle: '월 200만~500만 분배 현금흐름을 안정적으로 받으려면. 분배락일 캘린더 + 안정성 등급 + 인출 시뮬을 한 페이지에.',
    },
    scenario: '월 분배금으로 생활합니다',
    tools: ['dividend-goal', 'withdrawal', 'portfolio'],
    categoryPriority: ['income', 'flow'],
    internalLinks: [
      { href: '/income', label: '월배당·커버드콜 인덱스', description: '연간 분배 캘린더 + 안정성 등급 매트릭스' },
      { href: '/etf', label: '종목 사전', description: '1099 ETF 의 분배 정보·구성종목' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/tax-finance/',
  },

  newbie: {
    slug: 'newbie',
    displayName: '첫 ETF 투자자',
    hero: {
      eyebrow: 'FOR · NEWBIE',
      title: 'ETF 처음 시작하는 분들께',
      subtitle: '5만원·10만원·20만원으로 살 수 있는 ETF가 뭔지. 용어부터 안전한 종목까지.',
    },
    scenario: 'ETF 처음 시작합니다',
    tools: ['budget-etf', 'sip', 'portfolio'],
    categoryPriority: ['guide', 'pulse'],
    internalLinks: [
      { href: '/guide/monthly-dividend', label: '월배당 ETF 완전 가이드', description: '첫 ETF 로 추천하는 안정성 S 등급 5종' },
      { href: '/etf', label: '종목 사전', description: 'KRX 1099 ETF 검색·필터' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/market/',
  },

  freelancer: {
    slug: 'freelancer',
    displayName: '자영업·프리랜서',
    hero: {
      eyebrow: 'FOR · FREELANCER',
      title: '개인사업자·프리랜서의 절세 ETF',
      subtitle: '종합소득 한계세율 기반 노란우산·IRP·ISA 최적 조합. 연간 절세 효과 수백만원.',
    },
    scenario: '자영업이고 절세가 중요합니다',
    tools: ['tax-compare', 'portfolio'],
    categoryPriority: ['income'],
    internalLinks: [
      { href: '/income', label: '월배당·커버드콜 (계좌별)', description: 'IRP·ISA·연금저축 세후 수익률' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/tax-finance/',
  },

  trader: {
    slug: 'trader',
    displayName: '전문가·트레이더',
    hero: {
      eyebrow: 'FOR · TRADER',
      title: '장중 시그널·트랙 레코드 모니터링',
      subtitle: 'Unger 변동성 돌파 시그널 + 거래량 급증 알림 + transparent 백테스트 결과.',
    },
    scenario: '시그널·트래킹 중심으로 봅니다',
    tools: ['atr-calc', 'portfolio'],
    categoryPriority: ['surge', 'flow', 'breaking'],
    internalLinks: [
      { href: '/strategy/kospi200-breakout', label: '코스피200 변동성 돌파 시그널', description: '매일 시초가 기반 Long/Short Trigger 산출' },
      { href: '/strategy/track-record', label: '트랙 레코드', description: '시그널 결과 자동 검증 + 누적 통계' },
      { href: '/admin/kis-stats', label: '한투 API 호출량 (운영자)', description: '시세 endpoint 사용 통계 — 시청자 무관' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/market/',
  },

  'working-couple': {
    slug: 'working-couple',
    displayName: '맞벌이 부부',
    hero: {
      eyebrow: 'FOR · WORKING COUPLE',
      title: '시간 부족한 맞벌이 적립 자동화',
      subtitle: '본인·배우자 IRP·ISA 한도 활용 + 자녀 교육비 대비 + 매월 5분이면 충분한 관리.',
    },
    scenario: '맞벌이 + 아이가 있습니다',
    tools: ['sip', 'tax-compare', 'portfolio'],
    categoryPriority: ['income', 'pulse'],
    internalLinks: [
      { href: '/income', label: '월배당·커버드콜', description: '자녀 학자금·노후 대비 안정 등급' },
      { href: '/guide/retirement', label: '연금 가이드', description: 'IRP·ISA·연금저축 한도·세제 비교' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/tax-finance/',
  },

  global: {
    slug: 'global',
    displayName: '해외주식 비중·환헤지',
    hero: {
      eyebrow: 'FOR · GLOBAL',
      title: '미국 ETF·환율 영향 관리',
      subtitle: 'TIGER 미국S&P500 같은 해외주식 ETF 의 환율 영향. 헤지(H) vs 비헤지 차이.',
    },
    scenario: '해외주식 비중이 큽니다',
    tools: ['fx-impact', 'portfolio'],
    categoryPriority: ['flow', 'income'],
    internalLinks: [
      { href: '/etf', label: '종목 사전', description: 'TIGER 미국S&P500·KODEX 미국나스닥100 등' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/market/',
  },

  'early-retire': {
    slug: 'early-retire',
    displayName: '55세 이상 인출 준비',
    hero: {
      eyebrow: 'FOR · EARLY RETIRE',
      title: '55세 인출 시 세금·시점 결정',
      subtitle: '연금소득세 시점별 비교 + 분할 인출 vs 일시 인출 + 노후 자금 유지 기간 시뮬.',
    },
    scenario: '곧 연금 인출 시작합니다',
    tools: ['withdrawal', 'tax-compare', 'dividend-goal'],
    categoryPriority: ['income'],
    internalLinks: [
      { href: '/income', label: '월배당·커버드콜', description: '인출 단계 안정성 우선 종목' },
      { href: '/guide/retirement', label: '연금 가이드', description: '인출 시점·세율·분할 전략' },
    ],
    mainSiteCategoryUrl: 'https://smartdatashop.kr/category/tax-finance/',
  },
};

export const ALL_PERSONAS = Object.values(PERSONAS);
