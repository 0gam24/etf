import Link from 'next/link';
import { ShieldCheck, Database, Clock, Users } from 'lucide-react';

interface Props {
  authorCount: number;
  etfCount: number;
}

export default function TrustBar({ authorCount, etfCount }: Props) {
  return (
    <div className="trust-bar" role="contentinfo" aria-label="사이트 신뢰 정보">
      <div className="trust-bar-inner">
        <span className="trust-item">
          <Database size={13} strokeWidth={2.4} aria-hidden />
          KRX · 한국은행 · DART 공공데이터 기반
        </span>
        <span className="trust-divider" aria-hidden>·</span>
        <span className="trust-item">
          <Clock size={13} strokeWidth={2.4} aria-hidden />
          매일 오전 9시 자동 발행
        </span>
        <span className="trust-divider" aria-hidden>·</span>
        <Link href="/author/pb_kim" className="trust-item trust-item-link">
          <Users size={13} strokeWidth={2.4} aria-hidden />
          저자 {authorCount}명 (前 PB·애널리스트·실전 투자자)
        </Link>
        <span className="trust-divider" aria-hidden>·</span>
        <span className="trust-item">
          <ShieldCheck size={13} strokeWidth={2.4} aria-hidden />
          분석 종목 {etfCount}+
        </span>
      </div>
    </div>
  );
}
