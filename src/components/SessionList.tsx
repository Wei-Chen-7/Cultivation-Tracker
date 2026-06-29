import { useState } from 'react';
import type { Session } from '../types';
import { pathColor } from '../cultivation/realmTheme';
import {
  formatDuration,
  formatRelative,
  toDatetimeLocal,
} from '../utils/format';

export interface SessionPatch {
  path: string;
  minutes: number;
  note?: string;
  timestamp: number;
}

interface Props {
  sessions: Session[];
  paths: string[];
  onDelete: (id: string) => void;
  onEdit: (id: string, patch: SessionPatch) => void;
}

/** Recent sessions, newest first, each editable and deletable. */
export default function SessionList({
  sessions,
  paths,
  onDelete,
  onEdit,
}: Props) {
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
            <SessionRow
              key={s.id}
              session={s}
              paths={paths}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionRow({
  session: s,
  paths,
  onDelete,
  onEdit,
}: {
  session: Session;
  paths: string[];
  onDelete: (id: string) => void;
  onEdit: (id: string, patch: SessionPatch) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [path, setPath] = useState(s.path);
  const [minutes, setMinutes] = useState(String(Math.round(s.minutes)));
  const [note, setNote] = useState(s.note ?? '');
  const [when, setWhen] = useState(toDatetimeLocal(new Date(s.timestamp)));

  function beginEdit() {
    setPath(s.path);
    setMinutes(String(Math.round(s.minutes)));
    setNote(s.note ?? '');
    setWhen(toDatetimeLocal(new Date(s.timestamp)));
    setEditing(true);
  }

  function save() {
    const m = parseFloat(minutes);
    if (!Number.isFinite(m) || m <= 0) return;
    const ts = new Date(when).getTime();
    onEdit(s.id, {
      path: paths.includes(path) ? path : s.path,
      minutes: m,
      note: note.trim() || undefined,
      timestamp: Number.isFinite(ts) ? ts : s.timestamp,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="rounded-lg border border-jade-500/30 bg-ink-850/80 px-3 py-3">
        <div className="mb-2 flex gap-2">
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm outline-none focus:border-jade-500"
          >
            {paths.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="1"
              step="any"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-20 rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm outline-none focus:border-jade-500"
            />
            <span className="text-xs text-slate-500">min</span>
          </div>
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="mb-2 w-full rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm outline-none placeholder:text-slate-500 focus:border-jade-500"
        />
        <input
          type="datetime-local"
          value={when}
          max={toDatetimeLocal(new Date())}
          onChange={(e) => setWhen(e.target.value)}
          className="mb-2 w-full rounded-md border border-white/10 bg-ink-800 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-jade-500 [color-scheme:dark]"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/25"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-md bg-jade-600 px-3 py-1 text-xs font-medium text-ink-950 transition hover:bg-jade-500"
          >
            Save
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group flex items-center gap-3 rounded-lg border border-white/5 bg-ink-850/60 px-3 py-2.5">
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
        {s.note && <p className="truncate text-xs text-slate-400">{s.note}</p>}
      </div>
      <span className="shrink-0 text-xs text-slate-500">
        {formatRelative(s.timestamp)}
      </span>
      <div className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          aria-label="Edit session"
          onClick={beginEdit}
          className="rounded p-1 text-slate-600 transition hover:text-jade-300"
        >
          ✎
        </button>
        <button
          type="button"
          aria-label="Delete session"
          onClick={() => onDelete(s.id)}
          className="rounded p-1 text-slate-600 transition hover:text-red-400"
        >
          ✕
        </button>
      </div>
    </li>
  );
}
