import { useState } from 'react';
import { pathColor } from '../cultivation/realmTheme';
import { toDatetimeLocal } from '../utils/format';

export interface LogInput {
  path: string;
  minutes: number;
  note?: string;
  timestamp: number;
}

interface Props {
  paths: string[];
  onLog: (input: LogInput) => void;
  onAddPath: (name: string) => void;
  onRemovePath: (name: string) => void;
}

type Unit = 'min' | 'hr';

const PRESETS_MIN = [25, 45, 60, 90];

function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDatetimeLocal(d);
}

export default function LogSessionForm({
  paths,
  onLog,
  onAddPath,
  onRemovePath,
}: Props) {
  const [path, setPath] = useState(paths[0] ?? '');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<Unit>('min');
  const [note, setNote] = useState('');
  const [when, setWhen] = useState(''); // '' = log for now
  const [editingPaths, setEditingPaths] = useState(false);
  const [newPath, setNewPath] = useState('');
  const [error, setError] = useState('');

  // keep selected path valid if the list changes
  const activePath = paths.includes(path) ? path : (paths[0] ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!activePath) {
      setError('Add a Path first.');
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a duration greater than zero.');
      return;
    }
    let timestamp = Date.now();
    if (when) {
      const parsed = new Date(when).getTime();
      if (!Number.isFinite(parsed)) {
        setError('That date/time is invalid.');
        return;
      }
      timestamp = parsed;
    }
    const minutes = unit === 'hr' ? value * 60 : value;
    onLog({
      path: activePath,
      minutes,
      note: note.trim() || undefined,
      timestamp,
    });
    setAmount('');
    setNote('');
    setError('');
  }

  function addPath() {
    const name = newPath.trim();
    if (!name) return;
    onAddPath(name);
    setPath(name);
    setNewPath('');
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-white/5 bg-ink-900/60 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-jade-400">
          运功 · Log Cultivation
        </h2>
        <button
          type="button"
          onClick={() => setEditingPaths((v) => !v)}
          className="text-xs text-slate-400 transition hover:text-jade-300"
        >
          {editingPaths ? 'done' : 'edit paths'}
        </button>
      </div>

      {/* Path chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {paths.map((p) => {
          const selected = p === activePath;
          const color = pathColor(p, paths);
          return (
            <span key={p} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => setPath(p)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  selected
                    ? 'border-transparent text-ink-950'
                    : 'border-white/10 text-slate-300 hover:border-white/25'
                }`}
                style={selected ? { backgroundColor: color } : undefined}
              >
                {p}
              </button>
              {editingPaths && paths.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove ${p}`}
                  onClick={() => onRemovePath(p)}
                  className="ml-0.5 text-slate-500 transition hover:text-red-400"
                >
                  ×
                </button>
              )}
            </span>
          );
        })}
      </div>

      {editingPaths && (
        <div className="mb-4 flex gap-2">
          <input
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPath();
              }
            }}
            placeholder="New path name…"
            className="flex-1 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-jade-500"
          />
          <button
            type="button"
            onClick={addPath}
            className="rounded-lg bg-jade-600 px-3 py-2 text-sm font-medium text-ink-950 transition hover:bg-jade-500"
          >
            Add
          </button>
        </div>
      )}

      {/* Duration */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Duration"
            className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 outline-none placeholder:text-slate-500 focus:border-jade-500"
          />
          <div className="flex overflow-hidden rounded-lg border border-white/10">
            {(['min', 'hr'] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-3 text-sm transition ${
                  unit === u
                    ? 'bg-jade-600 text-ink-950'
                    : 'bg-ink-800 text-slate-300 hover:bg-ink-700'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS_MIN.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setUnit('min');
                setAmount(String(m));
              }}
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-400 transition hover:border-jade-500 hover:text-jade-300"
            >
              +{m}m
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional) — what did you work on?"
        className="mb-3 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-jade-500"
      />

      {/* When — defaults to now; can backdate to fix or backfill */}
      <div className="mb-4">
        {when ? (
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={when}
              max={toDatetimeLocal(new Date())}
              onChange={(e) => setWhen(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-jade-500 [color-scheme:dark]"
            />
            <button
              type="button"
              onClick={() => setWhen('')}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:border-jade-500 hover:text-jade-300"
            >
              now
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              Logging for <span className="text-slate-300">now</span>
            </span>
            <button
              type="button"
              onClick={() => setWhen(yesterdayLocal())}
              className="rounded-md border border-white/10 px-2 py-1 transition hover:border-jade-500 hover:text-jade-300"
            >
              yesterday
            </button>
            <button
              type="button"
              onClick={() => setWhen(toDatetimeLocal(new Date()))}
              className="rounded-md border border-white/10 px-2 py-1 transition hover:border-jade-500 hover:text-jade-300"
            >
              pick a time…
            </button>
          </div>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-gradient-to-r from-jade-600 to-jade-500 py-2.5 font-semibold text-ink-950 shadow-lg shadow-jade-500/20 transition hover:from-jade-500 hover:to-jade-400 active:scale-[0.99]"
      >
        运功增益 · Cultivate
      </button>
    </form>
  );
}
