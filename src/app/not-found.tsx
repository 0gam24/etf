import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-page-code">404</div>
      <h1 className="error-page-title">이 페이지는 발행되지 않았습니다</h1>
      <p className="error-page-desc">
        요청하신 리포트가 아직 생성되지 않았거나, 주소가 변경되었을 수 있습니다.
        Daily ETF Pulse는 매일 오전 9시 전에 새 분석을 발행합니다.
      </p>
      <Link href="/" className="error-page-back">
        <ArrowLeft size={16} strokeWidth={2.5} />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
