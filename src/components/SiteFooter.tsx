import { Fragment, type CSSProperties } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

const H4_STYLE: CSSProperties = {
  color: 'var(--text-primary)',
  fontSize: 'var(--fs-sm)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-4)',
};
const COLUMN_STYLE: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' };
const LINK_STYLE: CSSProperties = { color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' };

const CATEGORY_LINKS = [
  { href: '/guide', label: 'ETF 가이드' },
  { href: '/etf', label: 'ETF 종목 사전' },
  { href: '/compare', label: '같은 지수 ETF 비교' },
  { href: '/income', label: '월배당·커버드콜' },
  { href: '/tools/dividend-calculator', label: 'ETF 분배금 계산기' },
];

// 테마·계좌·도구 진입점 — 이 페이지들은 어디서도 링크되지 않아 고아 상태였다.
//   (2026-08-11 SEO 감사: /theme/* 4개·/account/* 3개·/tools/tax-compare)
const THEME_ACCOUNT_LINKS = [
  { href: '/theme/defense', label: '방산 테마 ETF' },
  { href: '/theme/semi', label: '반도체 테마 ETF' },
  { href: '/theme/ai', label: 'AI 테마 ETF' },
  { href: '/theme/shipbuilding', label: '조선 테마 ETF' },
  { href: '/account/irp', label: 'IRP ETF 가이드' },
  { href: '/account/isa', label: 'ISA ETF 가이드' },
  { href: '/account/pension', label: '연금저축 ETF 가이드' },
  { href: '/tools/tax-compare', label: '계좌별 세후 수익률 비교' },
];

// 데이터 출처는 실제 기관 사이트로 잇는다 (2026-10-14). 글자만 있던 출처 목록은 확인할 길이 없었다.
//   시세 원천은 공공데이터포털의 금융위원회 증권상품시세정보(한국거래소 자료)라 데이터셋 주소를 그대로 밝힌다.
const SOURCE_LINKS = [
  { href: 'https://data.krx.co.kr', label: '한국거래소(KRX) 정보데이터시스템' },
  { href: 'https://www.data.go.kr/data/15094806/openapi.do', label: '공공데이터포털 증권상품시세정보' },
  { href: 'https://dart.fss.or.kr', label: '금융감독원 전자공시(DART)' },
  { href: 'https://dis.kofia.or.kr', label: '금융투자협회 전자공시' },
  { href: 'https://ecos.bok.or.kr', label: '한국은행 경제통계(ECOS)' },
];

const POLICY_LINKS = [
  { href: '/about', label: '리서치팀 소개' },
  { href: '/feeds', label: '구독 · 피드' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/disclaimer', label: '면책조항' },
  { href: '/contact', label: '연락처' },
];

/**
 * 사이트 공통 푸터.
 *
 * 2026-10-14
 *   - 링크 사이에 공백을 넣었다. 화면(플렉스 세로 배치)은 같고, 태그만 지우는 추출기에서
 *     "ETF 가이드ETF 종목 사전…" 처럼 링크 이름이 붙어 읽히던 문제를 막는다.
 *   - 모든 페이지에 붙던 제휴 추천 자료 카드를 뺐다. 같은 날 추천 자료실(/resources)도 닫아
 *     사이트 어디에도 상품 판매(제휴) 링크를 두지 않는다.
 *   - 유의사항은 출처·기준일·발행 책임·투자 책임만 적는다 (2026-10-14 운영자 지시로 작성 도구 언급은 사이트에 두지 않는다).
 */
export default function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 'var(--space-24)',
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border-color)',
        padding: 'var(--space-16) 0 var(--space-8)',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 var(--space-6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-12)',
        }}
      >
        <div>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              marginBottom: 'var(--space-4)',
            }}
          >
            <Zap size={22} strokeWidth={2.5} aria-hidden />
            <span>DAILY ETF PULSE</span>
          </Link>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)', lineHeight: 1.6 }}>
            KRX 상장 ETF 종목 사전과 같은 지수 ETF 비교,<br />
            1차 출처로 답하는 ETF·연금·세금 가이드.
          </p>
        </div>

        <nav aria-label="카테고리">
          <h4 style={H4_STYLE}>카테고리</h4>
          <div style={COLUMN_STYLE}>
            {CATEGORY_LINKS.map(l => (
              <Fragment key={l.href}>
                <Link href={l.href} style={LINK_STYLE}>{l.label}</Link>{' '}
              </Fragment>
            ))}
          </div>
        </nav>

        <nav aria-label="테마와 계좌">
          <h4 style={H4_STYLE}>테마 · 계좌</h4>
          <div style={COLUMN_STYLE}>
            {THEME_ACCOUNT_LINKS.map(l => (
              <Fragment key={l.href}>
                <Link href={l.href} style={LINK_STYLE}>{l.label}</Link>{' '}
              </Fragment>
            ))}
          </div>
        </nav>

        <div>
          <h4 style={H4_STYLE}>데이터 출처</h4>
          <div style={COLUMN_STYLE}>
            {SOURCE_LINKS.map(s => (
              <Fragment key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>{s.label}</a>{' '}
              </Fragment>
            ))}
            <span style={LINK_STYLE}>각 운용사 상품 페이지·투자설명서</span>{' '}
            <Link href="/about" style={{ color: 'var(--accent-gold)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-2)' }}>발행 원칙 →</Link>
          </div>
        </div>

        <div>
          <h4 style={H4_STYLE}>유의사항</h4>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-xs)', lineHeight: 1.7 }}>
            이 사이트의 수치와 제도 설명은 한국거래소·금융감독원·국세청·운용사 공시 같은 1차 출처를 근거로 하고, 글마다 기준일과 출처를 밝힙니다. 발행·정정 책임은 Daily ETF Pulse 리서치팀에 있습니다. 정보 제공 목적의 자료이고 투자 판단과 그 결과의 책임은 투자자 본인에게 있습니다.
          </p>
        </div>
      </div>

      {/* 정책 링크 — AdSense 형식 요건 (모든 페이지 일관 노출) */}
      <nav
        aria-label="사이트 정책"
        style={{
          maxWidth: '80rem',
          margin: 'var(--space-12) auto 0',
          padding: 'var(--space-6) var(--space-6) 0',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          fontSize: 'var(--fs-sm)',
        }}
      >
        {POLICY_LINKS.map((l, i) => (
          <Fragment key={l.href}>
            {i > 0 && (
              <>
                {' '}
                <span style={{ color: 'var(--text-muted)' }} aria-hidden>·</span>{' '}
              </>
            )}
            <Link href={l.href} style={{ color: 'var(--text-secondary)' }}>{l.label}</Link>
          </Fragment>
        ))}
      </nav>

      <div
        style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          textAlign: 'center',
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-muted)',
        }}
      >
        © {new Date().getFullYear()} DAILY ETF PULSE. All rights reserved.
      </div>
    </footer>
  );
}
