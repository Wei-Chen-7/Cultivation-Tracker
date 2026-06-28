import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import type { DailyPoint } from '../cultivation/stats';

interface Props {
  data: DailyPoint[];
}

/** Bar chart of hours logged per day over the recent weeks. */
export default function DailyChart({ data }: Props) {
  const hasData = data.some((d) => d.hours > 0);

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-jade-400">
        近况 · Hours per Day
      </h2>

      {!hasData ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Log a few sessions to see your rhythm.
        </p>
      ) : (
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: '#243036' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: '#141b1e',
                  border: '1px solid #243036',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value) => [
                  `${Number(value).toFixed(1)}h`,
                  'Cultivated',
                ]}
              />
              <Bar
                dataKey="hours"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell
                    key={d.day}
                    fill={d.hours > 0 ? '#1fcf90' : '#243036'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
