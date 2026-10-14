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
  if (!iso) return '-';
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
          {/* 2026-10-14: 출처를 실제 기관 사이트로 잇는다. 지금 쓰지 않는 경제지표(기준금리·물가) 항목은 뺐다 */}
          <ul className="data-footer-list">
            <li>
              <a href="https://www.data.go.kr/data/15094806/openapi.do" target="_blank" rel="noopener noreferrer"><strong>공공데이터포털 증권상품시세정보</strong></a>
              {' '}· ETF 일별 종가·NAV (한국거래소 자료, 기준일 표기)
            </li>
            <li>
              <a href="https://data.krx.co.kr" target="_blank" rel="noopener noreferrer"><strong>한국거래소(KRX) 정보데이터시스템</strong></a>
              {' '}· 상장 종목코드·표준코드
            </li>
            <li>
              <a href="https://dart.fss.or.kr" target="_blank" rel="noopener noreferrer"><strong>금융감독원 전자공시(DART)</strong></a>
              {' '}· 운용사 투자설명서
            </li>
            <li>
              <a href="https://dis.kofia.or.kr" target="_blank" rel="noopener noreferrer"><strong>금융투자협회 전자공시</strong></a>
              {' '}· 총보수·총비용 공시
            </li>
          </ul>
        </div>
        <div className="data-footer-right">
          <div className="data-footer-stamps">
            <div className="data-footer-stamp">
              <span className="data-footer-stamp-label">ETF 시세 수집</span>{' '}
              <span className="data-footer-stamp-value">{formatStamp(etfFetchedAt)}</span>
            </div>
            {ecoFetchedAt && (
              <div className="data-footer-stamp">
                <span className="data-footer-stamp-label">경제지표 갱신</span>{' '}
                <span className="data-footer-stamp-value">{formatStamp(ecoFetchedAt)}</span>
              </div>
            )}
            {typeof etfCount === 'number' && (
              <div className="data-footer-stamp">
                <span className="data-footer-stamp-label">상장 ETF</span>{' '}
                <span className="data-footer-stamp-value">{etfCount.toLocaleString('ko-KR')}종</span>
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
