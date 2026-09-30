import Link from 'next/link';
import { Zap, BookOpen } from 'lucide-react';
import { getAllProducts } from '@/lib/products';

export default function SiteFooter() {
  // 추천 자료 미니 — 상위 4개 (이미 visible 필터됨)
  const featured = getAllProducts().slice(0, 4);

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
            ETF·연금·세금 궁금증에 1차 출처로 답하는<br />
            가이드를 매일 아침 새로 올립니다.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            카테고리
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {/* 매일 새 글이 올라오는 곳을 맨 위에 둔다 (일일 시황 코너는 지난 기록) */}
            <Link href="/guide" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>ETF 가이드</Link>
            <Link href="/pulse" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>오늘의 관전포인트</Link>
            <Link href="/surge" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>급등 테마 분석</Link>
            <Link href="/flow" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>자금 흐름 리포트</Link>
            <Link href="/income" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>월배당·커버드콜</Link>
            <Link href="/today" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>오늘의 종합 리포트</Link>
            <Link href="/weekly" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>주간 펄스 리포트</Link>
          </div>
        </div>

        {/* 테마·계좌·도구 진입점 — 이 페이지들은 어디서도 링크되지 않아 고아 상태였다.
            (2026-08-11 SEO 감사: /theme/* 4개·/account/* 3개·/today·/tools/tax-compare) */}
        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            테마 · 계좌
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Link href="/theme/defense" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>방산 테마 ETF</Link>
            <Link href="/theme/semi" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>반도체 테마 ETF</Link>
            <Link href="/theme/ai" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>AI 테마 ETF</Link>
            <Link href="/theme/shipbuilding" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>조선 테마 ETF</Link>
            <Link href="/account/irp" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>IRP ETF 가이드</Link>
            <Link href="/account/isa" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>ISA ETF 가이드</Link>
            <Link href="/account/pension" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>연금저축 ETF 가이드</Link>
            <Link href="/tools/tax-compare" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>계좌별 세후 수익률 비교</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            데이터 출처
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>한국거래소(KRX) 공공데이터</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>한국은행 ECOS</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>DART 금융감독원</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>운용사 공식 공시</span>
            <Link href="/about" style={{ color: 'var(--accent-gold)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-2)' }}>발행 원칙 →</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            유의사항
          </h4>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-xs)', lineHeight: 1.7 }}>
            본 사이트의 글은 KRX·국세청·금융감독원 등 1차 출처 자료를 바탕으로 데이터 기반 AI 분석 에이전트가 작성하며, 발행·검수 책임은 Daily ETF Pulse 편집팀에 있습니다. 투자 참고 자료이며, 모든 투자 결정의 책임은 투자자 본인에게 있습니다. 출처: KRX · 한국은행 · DART.
          </p>
        </div>
      </div>

      {/* 자매 사이트(smartdatashop.kr) 백링크 상자는 2026-09-30 제거. 모든 페이지 푸터에
          붙는 전역 자매 링크는 형제 사이트가 AdSense 거절 원인(doorway 네트워크)으로 기록한 패턴. */}

      {/* 추천 자료 미니 섹션 — 사이트 전체 푸터에 가벼운 큐레이션 */}
      {featured.length > 0 && (
        <div
          style={{
            maxWidth: '80rem',
            margin: 'var(--space-10) auto 0',
            padding: '0 var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={13} strokeWidth={2.4} aria-hidden /> 추천 자료
            </h4>
            <Link href="/resources" style={{ color: 'var(--accent-gold)', fontSize: 'var(--fs-xs)', fontWeight: 600 }}>
              전체 자료실 →
            </Link>
          </div>
          {/* 제휴 고지 — 공정위 지침: 카드 바로 위, 본문 이상 가시성(text-secondary·0.86rem·옅은 골드 박스). 회색·작은 글씨 금지 */}
          <p className="affiliate-disclaimer-line">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 'var(--space-3) 0 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {featured.map(p => (
              <li key={p.id}>
                {p.deeplink ? (
                  <a
                    href={p.deeplink}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: 'var(--space-3)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--fs-xs)',
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                      {p.tone === 'book' ? '도서' : '학습 도구'}
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.title}</div>
                    {p.subtitle && <div style={{ color: 'var(--text-dim)', marginTop: '0.2rem' }}>{p.subtitle}</div>}
                  </a>
                ) : (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '0.5rem',
                      fontSize: 'var(--fs-xs)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>[준비 중]</div>
                    <div style={{ color: 'var(--text-dim)', fontWeight: 600 }}>{p.title}</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 정책 링크 — AdSense·공정위 형식 요건 충족 (모든 페이지 일관 노출) */}
      <div
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
        <Link href="/about" style={{ color: 'var(--text-secondary)' }}>편집팀 소개</Link>
        <span style={{ color: 'var(--text-muted)' }} aria-hidden>·</span>
        <Link href="/feeds" style={{ color: 'var(--text-secondary)' }}>구독 · 피드</Link>
        <span style={{ color: 'var(--text-muted)' }} aria-hidden>·</span>
        <Link href="/privacy" style={{ color: 'var(--text-secondary)' }}>개인정보처리방침</Link>
        <span style={{ color: 'var(--text-muted)' }} aria-hidden>·</span>
        <Link href="/disclaimer" style={{ color: 'var(--text-secondary)' }}>면책조항</Link>
        <span style={{ color: 'var(--text-muted)' }} aria-hidden>·</span>
        <Link href="/contact" style={{ color: 'var(--text-secondary)' }}>연락처</Link>
      </div>

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
