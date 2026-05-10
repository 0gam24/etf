import Link from 'next/link';
import { Zap, BookOpen } from 'lucide-react';
import { getAllProducts } from '@/lib/products';
import MainBackrefBox from './MainBackrefBox';

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
            오늘 뜨는 ETF의 진짜 이유를<br />
            매일 오전 9시 전 업데이트.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            카테고리
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Link href="/pulse" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>오늘의 관전포인트</Link>
            <Link href="/surge" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>급등 테마 분석</Link>
            <Link href="/flow" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>자금 흐름 리포트</Link>
            <Link href="/income" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>월배당·커버드콜</Link>
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
            본 사이트의 분석은 KRX 공공데이터를 기반으로 자동 생성되며, 발행·검수 책임은 Daily ETF Pulse 편집팀에 있습니다. 투자 참고 자료이며, 모든 투자 결정의 책임은 투자자 본인에게 있습니다. 출처: KRX · 한국은행 · DART.
          </p>
        </div>
      </div>

      {/* smartdatashop network 자매 backref — 메인(1차 출처 데이터 저널)으로 자연 funnel */}
      <div
        style={{
          maxWidth: '80rem',
          margin: 'var(--space-10) auto 0',
          padding: '0 var(--space-6)',
        }}
      >
        <MainBackrefBox variant="footer" />
      </div>

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
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
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
          <p style={{ marginTop: 'var(--space-3)', color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', lineHeight: 1.6 }}>
            이 영역은 쿠팡 파트너스 활동의 일환으로, 클릭 후 24시간 내 발생한 구매에 대해 일정 수수료를 받습니다.
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: 'var(--space-12)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-color)',
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
