import { Database, ShieldAlert } from 'lucide-react';

interface Props {
  /** 마지막 ETF 데이터 갱신 ISO 또는 날짜 문자열 */
  etfFetchedAt?: string;
  /** 마지막 경제지표 갱신 */
  ecoFetchedAt?: string;
  /** 분석 종목 수 */
  etfCount?: number;
}

function formatStamp(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export default function DataFooter({ etfFetchedAt, ecoFetchedAt, etfCount }: Props) {
  return (
    <section className="data-footer" aria-label="데이터 출처">
      <div className="data-footer-inner">
        <div className="data-footer-left">
          <div className="data-footer-title">
            <Database size={14} strokeWidth={2.4} aria-hidden /> 데이터 출처
          </div>
          <ul className="data-footer-list">
            <li><strong>KRX 한국거래소</strong> · ETF 일별 시세 (공공데이터포털 · 30분 캐시)</li>
            <li><strong>한국은행 ECOS</strong> · 기준금리·환율·소비자물가</li>
            <li><strong>DART 금융감독원</strong> · 운용사 공시 (구성종목·분배 일정)</li>
          </ul>
        </div>
        <div className="data-footer-right">
          <div className="data-footer-stamps">
            <div className="data-footer-stamp">
              <span className="data-footer-stamp-label">ETF 시세 갱신</span>
              <span className="data-footer-stamp-value">{formatStamp(etfFetchedAt)}</span>
            </div>
            <div className="data-footer-stamp">
              <span className="data-footer-stamp-label">경제지표 갱신</span>
              <span className="data-footer-stamp-value">{formatStamp(ecoFetchedAt)}</span>
            </div>
            {typeof etfCount === 'number' && (
              <div className="data-footer-stamp">
                <span className="data-footer-stamp-label">분석 종목</span>
                <span className="data-footer-stamp-value">{etfCount}+</span>
              </div>
            )}
          </div>
          <p className="data-footer-disclaimer">
            <ShieldAlert size={13} strokeWidth={2.4} aria-hidden />
            정보 제공 목적의 분석이며, 투자 판단·손익에 대한 책임은 투자자 본인에게 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}
