import type { RiskLabel } from '@/lib/surge';

interface Props {
  labels: RiskLabel[];
  size?: 'sm' | 'md';
}

export default function SurgeRiskLabels({ labels, size = 'md' }: Props) {
  if (!labels || labels.length === 0) return null;
  return (
    <div className={`risk-labels risk-labels-${size}`}>
      {labels.map((l, i) => (
        <span
          key={`${l.text}-${i}`}
          className={`risk-label risk-${l.severity}`}
          title={l.hint}
        >
          {l.text}
        </span>
      ))}
    </div>
  );
}
