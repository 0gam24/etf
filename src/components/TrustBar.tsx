import { ShieldCheck, Database, Clock } from 'lucide-react';

interface Props {
  etfCount: number;
}

export default function TrustBar({ etfCount }: Props) {
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
          매일 아침 9시 갱신
        </span>
        <span className="trust-divider" aria-hidden>·</span>
        <span className="trust-item">
          <ShieldCheck size={13} strokeWidth={2.4} aria-hidden />
          분석 ETF {etfCount}+
        </span>
      </div>
    </div>
  );
}
