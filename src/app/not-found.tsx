import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// 404 화면 메타. 2026-10-30 전에는 layout 기본값(접은 시황 코너 제목, canonical '/')을 그대로 물려받아
//   noindex 와 index 가 함께 나갔다. 구글 get-started-developers.md "모든 페이지에는 구체적인 제목과 메타 설명"
export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '주소가 바뀌었거나 없는 페이지입니다. ETF 가이드나 종목 사전에서 찾아보세요.',
  robots: { index: false, follow: true },
  // 레이아웃 기본값('/')을 물려받으면 없는 주소의 대표 주소가 홈으로 나간다 (구글 canonicalization-troubleshooting.md)
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-page-code">404</div>
      <h1 className="error-page-title">요청하신 페이지를 찾을 수 없습니다</h1>
      <p className="error-page-desc">
        주소가 바뀌었거나 없는 페이지일 수 있습니다.
        <Link href="/guide">ETF 가이드</Link>나 <Link href="/etf">ETF 종목 사전</Link>에서 찾아보세요.
      </p>
      <Link href="/" className="error-page-back">
        <ArrowLeft size={16} strokeWidth={2.5} />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
