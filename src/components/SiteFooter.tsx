import Link from 'next/link';
import { Zap } from 'lucide-react';

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
            저자
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Link href="/author/pb_kim" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>김성훈 (前 PB)</Link>
            <Link href="/author/analyst_han" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>한혜린 (애널리스트)</Link>
            <Link href="/author/data_lee" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>이재환 (데이터)</Link>
            <Link href="/author/mom_park" style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-sm)' }}>박미라 (워킹맘)</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--fs-sm)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            유의사항
          </h4>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--fs-xs)', lineHeight: 1.7 }}>
            본 콘텐츠는 투자 참고 자료이며, 투자 권유가 아닙니다. 모든 투자 결정의 책임은 투자자 본인에게 있습니다. 출처: KRX · 한국은행 · DART.
          </p>
        </div>
      </div>

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
