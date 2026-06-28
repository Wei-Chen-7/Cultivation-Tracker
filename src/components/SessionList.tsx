import type { Session } from '../types';
import { pathColor } from '../cultivation/realmTheme';
import { formatDuration, formatRelative } from '../utils/format';

interface Props {
  sessions: Session[];
  paths: string[];
  onDelete: (id: string) => void;
}

/** Recent sessions, newest first, each deletable. */
export default function SessionList({ sessions, paths, onDelete }: Props) {
  const ordered = [...sessions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-jade-400">
          修行录 · Recent Sessions
        </h2>
        <span className="text-xs text-slate-500">{sessions.length} total</span>
      </div>

      {ordered.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No sessions yet. Log your first to begin cultivating.
        </p>
      ) : (
        <ul className="scroll-thin max-h-80 space-y-2 overflow-y-auto pr-1">
          {ordered.map((s) => (
            <li
              key={s.id}
              className="group flex items-center gap-3 rounded-lg border border-white/5 bg-ink-850/60 px-3 py-2.5"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: pathColor(s.path, paths) }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-slate-200">
                    {s.path}
                  </span>
                  <span className="shrink-0 text-xs text-jade-300">
                    {formatDuration(s.minutes)}
                  </span>
                </div>
                {s.note && (
                  <p className="truncate text-xs text-slate-400">{s.note}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {formatRelative(s.timestamp)}
              </span>
              <button
                type="button"
                aria-label="Delete session"
                onClick={() => onDelete(s.id)}
                className="shrink-0 rounded p-1 text-slate-600 opacity-0 transition hover:text-red-400 focus:opacity-100 group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
