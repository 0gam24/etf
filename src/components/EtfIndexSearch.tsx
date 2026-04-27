'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

interface EtfRow {
  shortcode: string;
  slug: string;
  name: string;
  sector?: string;
  issuer?: string;
  hasPrice: boolean;
}

interface Props {
  /** SSR에서 미리 계산된 전체 row + 슬러그 (codeToSlug 결과 포함) */
  rows: EtfRow[];
  /** 섹터 옵션 (선택지) */
  sectors: string[];
  /** 운용사 옵션 (선택지) */
  issuers: string[];
}

/**
 * /etf 인덱스 검색·필터 — 1095종 client-side 필터.
 *
 *   - 텍스트 검색 (이름·코드 양쪽)
 *   - 섹터 facet (단일 선택)
 *   - 운용사 facet (단일 선택)
 *   - 시세 있는 종목만 toggle
 *   - URL hash로 상태 보존 (브라우저 뒤로가기 친화)
 */
export default function EtfIndexSearch({ rows, sectors, issuers }: Props) {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [issuer, setIssuer] = useState('');
  const [pricedOnly, setPricedOnly] = useState(false);

  // URL hash 동기화 (간단 GET 파라미터)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const _q = params.get('q') || '';
    const _s = params.get('sector') || '';
    const _i = params.get('issuer') || '';
    const _p = params.get('priced') === '1';
    if (_q) setQ(_q);
    if (_s) setSector(_s);
    if (_i) setIssuer(_i);
    if (_p) setPricedOnly(_p);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (sector) params.set('sector', sector);
    if (issuer) params.set('issuer', issuer);
    if (pricedOnly) params.set('priced', '1');
    const next = params.toString();
    const current = window.location.hash.slice(1);
    if (next !== current) {
      window.history.replaceState(null, '', next ? `#${next}` : window.location.pathname);
    }
  }, [q, sector, issuer, pricedOnly]);

  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return rows.filter(r => {
      if (sector && r.sector !== sector) return false;
      if (issuer && r.issuer !== issuer) return false;
      if (pricedOnly && !r.hasPrice) return false;
      if (qLower) {
        const matches = r.name.toLowerCase().includes(qLower) ||
                        r.shortcode.toLowerCase().includes(qLower);
        if (!matches) return false;
      }
      return true;
    });
  }, [q, sector, issuer, pricedOnly, rows]);

  const reset = () => {
    setQ(''); setSector(''); setIssuer(''); setPricedOnly(false);
  };

  return (
    <section className="etf-search" aria-label="ETF 검색·필터">
      <div className="etf-search-bar">
        <Search size={16} strokeWidth={2.5} aria-hidden className="etf-search-icon" />
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="종목명·코드 검색 (예: KODEX 200, 0080G0)"
          className="etf-search-input"
          aria-label="ETF 이름 또는 코드 검색"
        />
        {(q || sector || issuer || pricedOnly) && (
          <button type="button" onClick={reset} className="etf-search-reset" aria-label="필터 초기화">
            <X size={14} strokeWidth={2.5} /> 초기화
          </button>
        )}
      </div>

      <div className="etf-search-facets">
        <label className="etf-search-facet">
          <span className="etf-search-facet-label">섹터</span>
          <select value={sector} onChange={e => setSector(e.target.value)} className="etf-search-select">
            <option value="">전체</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="etf-search-facet">
          <span className="etf-search-facet-label">운용사</span>
          <select value={issuer} onChange={e => setIssuer(e.target.value)} className="etf-search-select">
            <option value="">전체</option>
            {issuers.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </label>

        <label className="etf-search-facet etf-search-facet-toggle">
          <input
            type="checkbox"
            checked={pricedOnly}
            onChange={e => setPricedOnly(e.target.checked)}
          />
          <span>시세 있는 종목만</span>
        </label>
      </div>

      <div className="etf-search-result-count" role="status" aria-live="polite">
        {filtered.length === rows.length
          ? `전체 ${rows.length.toLocaleString()}종`
          : `${filtered.length.toLocaleString()}종 매칭 (전체 ${rows.length.toLocaleString()}종 중)`}
      </div>

      {filtered.length === 0 ? (
        <div className="etf-search-empty">
          <p>매칭되는 ETF가 없습니다. 검색어·필터를 조정해 보세요.</p>
        </div>
      ) : (
        <ul className="etf-index-grid etf-search-results">
          {filtered.slice(0, 60).map(r => (
            <li key={r.shortcode}>
              <a href={`/etf/${r.slug}`} className="etf-index-card">
                <div className="etf-index-card-head">
                  <span className="etf-index-card-code">{r.shortcode}</span>
                  {r.issuer && <span className="etf-index-card-issuer">{r.issuer}</span>}
                </div>
                <div className="etf-index-card-name">{r.name}</div>
                {r.sector && (
                  <div className="etf-index-card-meta etf-index-card-meta-pending">
                    {r.sector}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > 60 && (
        <p className="etf-search-more">
          상위 60종 표시 — 검색 결과 좁히려면 필터를 추가하세요.
        </p>
      )}
    </section>
  );
}
