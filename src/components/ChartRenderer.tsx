'use client';

import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface BarChartData {
  type: 'bar';
  title: string;
  data: { label: string; value: number; color?: string }[];
}
interface LineChartData {
  type: 'line';
  title: string;
  data: Record<string, string | number>[];
  series: { key: string; label: string; color: string }[];
}
interface TableData {
  type: 'table';
  title: string;
  columns: string[];
  rows: string[][];
}
interface ComparisonData {
  type: 'comparison';
  title: string;
  data: { label: string; taxRate: number; description: string }[];
}
interface HeatmapData {
  type: 'heatmap';
  title: string;
  data: { sector: string; value: number; weight: number }[];
}
interface CardData {
  type: 'card';
  title: string;
  items: { label: string; value: string }[];
}

type AnyChart = BarChartData | LineChartData | TableData | ComparisonData | HeatmapData | CardData;

interface ChartRendererProps {
  charts: AnyChart[];
}

const TOOLTIP_STYLE = {
  background: 'rgba(22, 27, 38, 0.95)',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  borderRadius: '10px',
  color: '#F8FAFC',
  fontSize: '0.85rem',
};
const AXIS_STYLE = { fill: '#94A3B8', fontSize: 12 };
const GRID_COLOR = 'rgba(255, 255, 255, 0.05)';

function BarView({ chart }: { chart: BarChartData }) {
  return (
    <div className="chart-wrap">
      <div className="chart-wrap-title">{chart.title}</div>
      <ResponsiveContainer width="100%" height={Math.max(260, chart.data.length * 36)}>
        <BarChart data={chart.data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} horizontal={false} />
          <XAxis type="number" stroke={AXIS_STYLE.fill} fontSize={AXIS_STYLE.fontSize} />
          <YAxis dataKey="label" type="category" stroke={AXIS_STYLE.fill} fontSize={AXIS_STYLE.fontSize} width={140} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(212,175,55,0.08)' }} />
          <Bar dataKey="value" fill="#D4AF37" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineView({ chart }: { chart: LineChartData }) {
  return (
    <div className="chart-wrap">
      <div className="chart-wrap-title">{chart.title}</div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chart.data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis dataKey="label" stroke={AXIS_STYLE.fill} fontSize={AXIS_STYLE.fontSize} />
          <YAxis stroke={AXIS_STYLE.fill} fontSize={AXIS_STYLE.fontSize} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: '0.85rem', color: '#CBD5E1' }} />
          {chart.series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
              name={s.label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TableView({ chart }: { chart: TableData }) {
  return (
    <div className="chart-wrap">
      <div className="chart-wrap-title">{chart.title}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              {chart.columns.map(c => (
                <th key={c} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--accent-gold)', fontWeight: 700, borderBottom: '1px solid var(--border-strong)' }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary)' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonView({ chart }: { chart: ComparisonData }) {
  const maxRate = Math.max(...chart.data.map(d => d.taxRate), 20);
  return (
    <div className="chart-wrap">
      <div className="chart-wrap-title">{chart.title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {chart.data.map(d => (
          <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.label}</div>
            <div style={{ height: 10, background: 'var(--bg-hover)', borderRadius: 6, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(d.taxRate / maxRate) * 100}%`,
                  height: '100%',
                  background: d.taxRate > 10 ? 'var(--cat-surge)' : d.taxRate > 0 ? 'var(--accent-gold)' : 'var(--cat-income)',
                  borderRadius: 6,
                }}
              />
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', minWidth: 48, textAlign: 'right' }}>{d.taxRate}%</div>
            <div style={{ gridColumn: '2 / 4', fontSize: '0.8rem', color: 'var(--text-dim)' }}>{d.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeatmapView({ chart }: { chart: HeatmapData }) {
  const max = Math.max(...chart.data.map(d => Math.abs(d.value)), 1);
  return (
    <div className="chart-wrap">
      <div className="chart-wrap-title">{chart.title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
        {chart.data.map(d => {
          const ratio = Math.min(Math.abs(d.value) / max, 1);
          const bg = d.value >= 0
            ? `rgba(239,68,68,${0.15 + ratio * 0.45})`
            : `rgba(59,130,246,${0.15 + ratio * 0.45})`;
          return (
            <div
              key={d.sector}
              style={{
                padding: '1rem',
                background: bg,
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: 4 }}>{d.sector}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {d.value >= 0 ? '+' : ''}{d.value.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardView({ chart }: { chart: CardData }) {
  return (
    <div className="chart-wrap">
      <div className="chart-wrap-title">{chart.title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {chart.items.map(it => (
          <div key={it.label} style={{ padding: '1rem', background: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 4 }}>{it.label}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChartRenderer({ charts }: ChartRendererProps) {
  if (!charts || charts.length === 0) return null;
  return (
    <div className="reveal">
      {charts.map((c, i) => {
        switch (c.type) {
          case 'bar': return <BarView key={i} chart={c} />;
          case 'line': return <LineView key={i} chart={c} />;
          case 'table': return <TableView key={i} chart={c} />;
          case 'comparison': return <ComparisonView key={i} chart={c} />;
          case 'heatmap': return <HeatmapView key={i} chart={c} />;
          case 'card': return <CardView key={i} chart={c} />;
          default: return null;
        }
      })}
    </div>
  );
}
