import type { StreakInfo } from '../cultivation/stats';

interface Props {
  streak: StreakInfo;
}

/** Current + longest consecutive-day streak. */
export default function StreakBadge({ streak }: Props) {
  const active = streak.current > 0;
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
      <div className="flex items-center gap-2">
        <span
          className={`text-xl ${active ? '' : 'opacity-40 grayscale'}`}
          aria-hidden
        >
          🔥
        </span>
        <span className="text-2xl font-bold text-slate-100">
          {streak.current}
        </span>
        <span className="text-sm text-slate-400">day streak</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Longest: <span className="text-gold-400">{streak.longest}</span> day
        {streak.longest === 1 ? '' : 's'}
      </p>
    </div>
  );
}
