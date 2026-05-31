/**
 * AnswerBox — AEO(답변엔진 최적화) 정답블록.
 *
 *   글 최상단(H1 직후, above the fold)에 노출해 AI Overview·피처드스니펫·
 *   생성형 검색(Perplexity·ChatGPT Search)이 "직답 + 핵심 수치"를 그대로 인용하도록 구조화.
 *
 *   원칙 (에이전트 패널 심의 2026-05-31 + 리스크 심판 가드레일):
 *     - 직답(summary)은 "무엇이 일어났나(사실 서술)"만. 매수/매도 권유·수익 보장 톤 금지(YMYL).
 *     - 핵심 수치는 <dl><dt>/<dd> 정의 리스트 → "X의 현재가는?" 음성·스니펫 질의에 직접 응답.
 *     - 모든 수치에 출처·기준일 인접 표기 → 인용 가능성(citability)·최신성 신호.
 *     - frontmatter에 summary 없으면 graceful 미표시(기존 글 빌드 안전성).
 *     - speakable 스키마는 1차 보류(본문-마크업 일치 검증 후 도입).
 *
 *   FAQPage JSON-LD는 글 frontmatter schemas[] 또는 본문 "## FAQ" 로 이미 처리되므로
 *   여기서 중복 발행하지 않는다(마크업-콘텐츠 불일치 회피).
 */

interface KeyStat {
  label: string;
  value: string;
  sub?: string;
}

interface Props {
  /** 직답 1문장 (≤55자 권장, 사실 서술형) */
  summary?: string;
  /** 핵심 수치 (보통 3개: 현재가·등락률·거래량 등) */
  keyStats?: KeyStat[];
  /** 데이터 기준일 — "2026-05-31 KRX 기준" 같은 최신성 신호 */
  asOf?: string;
  /** 출처 라벨 (기본: KRX 공공데이터) */
  source?: string;
}

export default function AnswerBox({ summary, keyStats, asOf, source }: Props) {
  // 직답이 없으면 통째로 미표시 (graceful)
  if (!summary && (!keyStats || keyStats.length === 0)) return null;

  const stats = (keyStats || []).slice(0, 4);

  return (
    <aside
      className="answer-box"
      aria-label="핵심 요약"
      style={{
        margin: 'var(--space-6) 0 var(--space-8)',
        padding: 'var(--space-5) var(--space-6)',
        background: 'var(--bg-card, #fff)',
        border: '1px solid var(--border-color)',
        borderLeft: '4px solid var(--accent-gold)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: 'var(--accent-gold)',
          marginBottom: '0.4rem',
        }}
      >
        한 줄 요약
      </div>

      {summary && (
        <p
          style={{
            fontSize: '1.06rem',
            fontWeight: 700,
            lineHeight: 1.55,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {summary}
        </p>
      )}

      {stats.length > 0 && (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, minmax(0, 1fr))`,
            gap: 'var(--space-4)',
            margin: 'var(--space-5) 0 0',
            padding: 0,
          }}
        >
          {stats.map((s, i) => (
            <div key={i} style={{ minWidth: 0 }}>
              <dt
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-dim)',
                  fontWeight: 600,
                  marginBottom: '0.2rem',
                }}
              >
                {s.label}
              </dt>
              <dd
                style={{
                  margin: 0,
                  fontSize: '1.18rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  wordBreak: 'keep-all',
                }}
              >
                {s.value}
                {s.sub && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-dim)',
                      marginTop: '0.15rem',
                    }}
                  >
                    {s.sub}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {(asOf || source) && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
          }}
        >
          {asOf && <span>{asOf} 기준</span>}
          {asOf && source && <span> · </span>}
          {source && <span>출처: {source}</span>}
        </div>
      )}
    </aside>
  );
}
