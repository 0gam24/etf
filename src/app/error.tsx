'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-page-code">500</div>
      <h1 className="error-page-title">일시적 오류가 발생했습니다</h1>
      <p className="error-page-desc">
        시장 데이터를 불러오는 중 문제가 있었습니다. 잠시 후 다시 시도해주세요.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
        <button onClick={reset} className="error-page-back">
          <RefreshCw size={16} strokeWidth={2.5} />
          다시 시도
        </button>
        <Link href="/" className="error-page-back" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
          <ArrowLeft size={16} strokeWidth={2.5} />
          홈으로
        </Link>
      </div>
    </div>
  );
}
