import { Plus, Minus, Repeat } from 'lucide-react';
import type { TickerDiff } from '@/lib/pulse';
import { getKrxEtfMeta } from '@/lib/data';

interface Props {
  diff: TickerDiff;
  hasYesterday: boolean;
}

export default function PulseDiff({ diff, hasYesterday }: Props) {
  if (!hasYesterday) {
    return (
      <section className="pulse-diff pulse-diff-empty">
        <h2 className="pulse-section-title">어제 대비 변화</h2>
        <p className="pulse-section-hint">
          내일부터 전일 대비 새로 등장한 종목·빠진 종목·유지되는 흐름이 여기에 표시됩니다.
        </p>
      </section>
    );
  }

  const cols: Array<{
    key: 'added' | 'continuing' | 'removed';
    title: string;
    hint: string;
    icon: React.ReactNode;
    items: string[];
  }> = [
    {
      key: 'added',
      title: '오늘 새로 등장',
      hint: '새 트리거 · 주목',
      icon: <Plus size={14} strokeWidth={2.8} aria-hidden />,
      items: diff.added,
    },
    {
      key: 'continuing',
      title: '이어지는 흐름',
      hint: '어제도 오늘도',
      icon: <Repeat size={14} strokeWidth={2.8} aria-hidden />,
      items: diff.continuing,
    },
    {
      key: 'removed',
      title: '어제엔 있었는데',
      hint: '관심 이탈 신호',
      icon: <Minus size={14} strokeWidth={2.8} aria-hidden />,
      items: diff.removed,
    },
  ];

  return (
    <section className="pulse-diff">
      <h2 className="pulse-section-title">어제 대비 변화</h2>
      <div className="pulse-diff-grid">
        {cols.map(c => (
          <div key={c.key} className={`pulse-diff-col pulse-diff-${c.key}`}>
            <div className="pulse-diff-col-head">
              <span className="pulse-diff-col-icon" aria-hidden>{c.icon}</span>
              <div>
                <div className="pulse-diff-col-title">{c.title}</div>
                <div className="pulse-diff-col-hint">{c.hint}</div>
              </div>
              <span className="pulse-diff-col-count">{c.items.length}</span>
            </div>
            {c.items.length > 0 ? (
              <ul className="pulse-diff-list">
                {c.items.map(t => {
                  const name = getKrxEtfMeta(t)?.name;
                  return (
                    <li key={t} className="pulse-diff-chip" title={name || undefined}>
                      {name ? (
                        <>
                          <strong className="pulse-diff-chip-name">{name}</strong>
                          <span className="pulse-diff-chip-code">· {t}</span>
                        </>
                      ) : t}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="pulse-diff-col-empty">—</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
