import type { PathTotal } from '../cultivation/stats';
import { pathColor } from '../cultivation/realmTheme';
import { formatHours } from '../utils/format';

interface Props {
  breakdown: PathTotal[];
  paths: string[];
}

/** Hours per path, so you can see where your time actually goes. */
export default function PathBreakdown({ breakdown, paths }: Props) {
  const hasTime = breakdown.some((b) => b.minutes > 0);

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-jade-400">
        道途 · Paths
      </h2>

      {!hasTime ? (
        <p className="py-4 text-center text-sm text-slate-500">
          No time logged yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {breakdown.map((b) => {
            const color = pathColor(b.path, paths);
            return (
              <li key={b.path}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="text-slate-200">{b.path}</span>
                  <span className="text-slate-400">
                    {formatHours(b.hours)}
                    <span className="ml-1.5 text-xs text-slate-500">
                      {Math.round(b.fraction * 100)}%
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${b.fraction * 100}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}66`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
