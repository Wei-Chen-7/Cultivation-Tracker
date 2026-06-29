import type { Achievement } from '../cultivation/stats';

interface Props {
  achievements: Achievement[];
}

/** 成就 — unlocked & locked milestones. */
export default function Achievements({ achievements }: Props) {
  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-jade-400">
          成就 · Achievements
        </h2>
        <span className="text-xs text-slate-500">
          {unlocked}/{achievements.length}
        </span>
      </div>

      <ul className="space-y-2">
        {achievements.map((a) => (
          <li
            key={a.id}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
              a.unlocked
                ? 'border-gold-500/30 bg-gold-500/5'
                : 'border-white/5 bg-ink-850/40 opacity-60'
            }`}
          >
            <span className="mt-0.5 text-lg" aria-hidden>
              {a.unlocked ? '🏆' : '🔒'}
            </span>
            <div className="min-w-0">
              <p className="flex items-baseline gap-2">
                <span
                  className={`font-serif-cjk text-sm font-bold ${
                    a.unlocked ? 'text-gold-300' : 'text-slate-400'
                  }`}
                >
                  {a.chinese}
                </span>
                <span className="text-sm text-slate-200">{a.title}</span>
              </p>
              <p className="text-xs text-slate-500">{a.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
