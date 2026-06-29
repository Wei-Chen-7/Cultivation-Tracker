import type { WeeklySummary } from '../cultivation/stats';
import { formatHours } from '../utils/format';

interface Props {
  todayMin: number;
  goalMin: number;
  onSetGoal: (min: number) => void;
  weekly: WeeklySummary;
}

const SIZE = 132;
const STROKE = 11;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;
const STEP = 15;

/** Today's cultivation against a daily goal, plus a this-week vs last-week line. */
export default function DailyGoal({
  todayMin,
  goalMin,
  onSetGoal,
  weekly,
}: Props) {
  const progress = goalMin > 0 ? Math.min(1, todayMin / goalMin) : 0;
  const met = todayMin >= goalMin && goalMin > 0;
  const offset = C * (1 - progress);

  const deltaUp = weekly.delta >= 0;
  const deltaAbs = Math.abs(weekly.delta);

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-jade-400">
          今日 · Today
        </h2>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <button
            type="button"
            aria-label="Lower daily goal"
            onClick={() => onSetGoal(Math.max(STEP, goalMin - STEP))}
            className="h-5 w-5 rounded border border-white/10 leading-none transition hover:border-jade-500 hover:text-jade-300"
          >
            −
          </button>
          <span className="w-16 text-center">goal {formatHours(goalMin / 60)}</span>
          <button
            type="button"
            aria-label="Raise daily goal"
            onClick={() => onSetGoal(goalMin + STEP)}
            className="h-5 w-5 rounded border border-white/10 leading-none transition hover:border-jade-500 hover:text-jade-300"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="#1a2327"
              strokeWidth={STROKE}
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={met ? '#f5cd6b' : '#1fcf90'}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              style={{
                transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s',
                filter: `drop-shadow(0 0 6px ${met ? 'rgba(245,205,107,0.6)' : 'rgba(31,207,144,0.6)'})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-100">
              {formatHours(todayMin / 60)}
            </span>
            <span className="text-xs text-slate-500">
              of {formatHours(goalMin / 60)}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {met ? (
            <p className="font-serif-cjk text-lg font-bold text-gold-300">
              目标达成
              <span className="ml-2 text-sm font-normal text-slate-400">
                Goal met
              </span>
            </p>
          ) : (
            <p className="text-sm text-slate-300">
              {formatHours(Math.max(0, (goalMin - todayMin) / 60))} to today's
              goal
            </p>
          )}

          <div className="mt-3 border-t border-white/5 pt-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              This week
            </p>
            <p className="text-lg font-semibold text-slate-100">
              {formatHours(weekly.thisWeek)}
            </p>
            {weekly.lastWeek > 0 || weekly.thisWeek > 0 ? (
              <p className="text-xs text-slate-500">
                <span className={deltaUp ? 'text-jade-300' : 'text-amber-400'}>
                  {deltaUp ? '▲' : '▼'} {formatHours(deltaAbs)}
                </span>{' '}
                vs last week
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
