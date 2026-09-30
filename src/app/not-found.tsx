import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-page-code">404</div>
      <h1 className="error-page-title">요청하신 페이지를 찾을 수 없습니다</h1>
      <p className="error-page-desc">
        주소가 바뀌었거나 없는 페이지일 수 있습니다.
        새 글은 매일 아침 <Link href="/guide">ETF 가이드</Link>에 올라옵니다.
      </p>
      <Link href="/" className="error-page-back">
        <ArrowLeft size={16} strokeWidth={2.5} />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
