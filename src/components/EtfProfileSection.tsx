import type { EtfProfile } from '@/lib/etf-profiles';

/**
 * 종목 사전 상품 개요 (src/lib/etf-profiles.ts 에 확인된 설명이 있는 종목만).
 *   상품명 검색에 먼저 답하도록 시세 표보다 위에 둔다. 사실표 → 본문 → 비슷한 상품 비교 → 자주 묻는 질문 → 출처.
 */
export default function EtfProfileSection({ profile, name }: { profile: EtfProfile; name: string }) {
  const updated = new Date(`${profile.updatedAt}T00:00:00+09:00`).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <section className="etf-dict-section etf-profile" aria-labelledby="etf-profile-heading">
      <h2 className="etf-dict-h2" id="etf-profile-heading">{name} 상품 개요</h2>
      <p className="etf-profile-summary">{profile.summary}</p>

      {profile.facts.length > 0 && (
        <dl className="etf-profile-facts">
          {profile.facts.map(f => (
            <div key={f.label} className="etf-profile-fact">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {profile.sections.map(s => (
        <div key={s.heading} className="etf-profile-block">
          <h3 className="etf-profile-h3">{s.heading}</h3>
          {s.paragraphs.map((p, i) => (
            <p key={i} className="etf-profile-p">{p}</p>
          ))}
        </div>
      ))}

      {profile.comparison && profile.comparison.rows.length > 0 && (
        <div className="etf-sibling-table-wrap">
          <table className="etf-sibling-table">
            <caption className="etf-sibling-caption">{profile.comparison.caption}</caption>
            <thead>
              <tr>
                {profile.comparison.columns.map(c => (
                  <th key={c} scope="col">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {profile.comparison.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {profile.faq && profile.faq.length > 0 && (
        <div className="etf-profile-block">
          <h3 className="etf-profile-h3">{name} 자주 묻는 질문</h3>
          {profile.faq.map(f => (
            <details key={f.question} className="etf-profile-faq" open>
              <summary>{f.question}</summary>
              <p className="etf-profile-p">{f.answer}</p>
            </details>
          ))}
        </div>
      )}

      {profile.sources.length > 0 && (
        <div className="etf-profile-sources">
          <span>확인한 자료 ({updated} 기준)</span>
          <ul>
            {profile.sources.map(s => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
