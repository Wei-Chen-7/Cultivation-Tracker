import { useEffect, useRef, useState } from 'react';
import type { LogInput } from './LogSessionForm';

interface Props {
  paths: string[];
  onLog: (input: LogInput) => void;
}

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** 闭关 — a live seclusion timer that auto-logs a session when you stop. */
export default function MeditationTimer({ paths, onLog }: Props) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [path, setPath] = useState(paths[0] ?? '');
  const tick = useRef<number | null>(null);

  const activePath = paths.includes(path) ? path : (paths[0] ?? '');
  const running = startedAt !== null;
  const elapsed = running ? now - startedAt : 0;

  useEffect(() => {
    if (running) {
      tick.current = window.setInterval(() => setNow(Date.now()), 1000);
      return () => {
        if (tick.current) window.clearInterval(tick.current);
      };
    }
  }, [running]);

  function start() {
    setStartedAt(Date.now());
    setNow(Date.now());
  }

  function stop() {
    if (startedAt === null) return;
    const minutes = (Date.now() - startedAt) / 60_000;
    if (minutes >= 0.1 && activePath) {
      onLog({
        path: activePath,
        minutes,
        note: '闭关 · Seclusion',
        timestamp: Date.now(),
      });
    }
    setStartedAt(null);
  }

  function cancel() {
    setStartedAt(null);
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-jade-400">
        闭关 · Seclusion Timer
      </h2>

      <div
        className={`mb-4 text-center font-serif-cjk text-5xl font-bold tabular-nums ${
          running ? 'text-jade-300' : 'text-slate-500'
        }`}
      >
        {clock(elapsed)}
      </div>

      {!running && paths.length > 0 && (
        <select
          value={activePath}
          onChange={(e) => setPath(e.target.value)}
          className="mb-3 w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none focus:border-jade-500"
        >
          {paths.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}

      {running ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={stop}
            className="flex-1 rounded-lg bg-gradient-to-r from-jade-600 to-jade-500 py-2.5 font-semibold text-ink-950 transition hover:from-jade-500 hover:to-jade-400"
          >
            出关 · Stop & Log
          </button>
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg border border-white/10 px-4 text-sm text-slate-400 transition hover:border-red-400/50 hover:text-red-400"
          >
            Discard
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={!activePath}
          className="w-full rounded-lg border border-jade-500/40 py-2.5 font-semibold text-jade-300 transition hover:bg-jade-500/10 disabled:opacity-40"
        >
          入定 · Begin Seclusion
        </button>
      )}
    </div>
  );
}
