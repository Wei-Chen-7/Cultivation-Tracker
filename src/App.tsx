import { useEffect, useMemo, useState } from 'react';
import type { AppState, Reward, Session } from './types';
import {
  clearState,
  defaultState,
  exportState,
  importState,
  loadState,
  makeId,
  saveState,
} from './storage/store';
import {
  detectBreakthrough,
  getCultivationStatus,
} from './cultivation/realms';
import type { CultivationStatus } from './cultivation/realms';
import { breakthroughText } from './cultivation/breakthroughText';
import { realmTheme } from './cultivation/realmTheme';
import { playBreakthrough } from './utils/sound';
import {
  computeAchievements,
  computeStreaks,
  dailyHours,
  pathBreakdown,
  stoneBalance,
  stonesEarned,
  totalHours as sumHours,
} from './cultivation/stats';
import type { Achievement } from './cultivation/stats';
import Dashboard from './components/Dashboard';
import LogSessionForm from './components/LogSessionForm';
import type { LogInput } from './components/LogSessionForm';
import SessionList from './components/SessionList';
import MeditationTimer from './components/MeditationTimer';
import DailyChart from './components/DailyChart';
import Achievements from './components/Achievements';
import SpiritStones from './components/SpiritStones';
import DataControls from './components/DataControls';
import BreakthroughToast from './components/BreakthroughToast';
import type { SurgeItem, ToastItem } from './components/BreakthroughToast';

/** Build the full achievement list for a given set of sessions. */
function achievementsFor(sessions: Session[]): Achievement[] {
  const hours = sumHours(sessions);
  const status = getCultivationStatus(hours);
  const streak = computeStreaks(sessions);
  return computeAchievements({
    sessions,
    hours,
    streak,
    majorRealmIndex: status.ascended ? 9 : status.realm.index,
    ascended: status.ascended,
  });
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [surge, setSurge] = useState<SurgeItem | null>(null);

  // Auto-save on every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const hours = useMemo(() => sumHours(state.sessions), [state.sessions]);
  const status = useMemo<CultivationStatus>(
    () => getCultivationStatus(hours),
    [hours],
  );
  const streak = useMemo(() => computeStreaks(state.sessions), [state.sessions]);
  const breakdown = useMemo(
    () => pathBreakdown(state.sessions, state.paths),
    [state.sessions, state.paths],
  );
  const daily = useMemo(() => dailyHours(state.sessions, 21), [state.sessions]);
  const achievements = useMemo(
    () => achievementsFor(state.sessions),
    [state.sessions],
  );
  const earned = stonesEarned(hours);
  const balance = stoneBalance(hours, state.spentStones);

  // ── Effect helpers ──────────────────────────────────────────────────────────
  function pushToast(t: Omit<ToastItem, 'id'>) {
    setToasts((prev) => [...prev, { ...t, id: makeId() }].slice(-4));
  }

  function celebrate(before: CultivationStatus, after: CultivationStatus) {
    const event = detectBreakthrough(before, after);
    if (event.kind === 'none') return;

    playBreakthrough(event.kind, state.muted);

    const theme = realmTheme(after.realm.index);
    const text = breakthroughText(event.kind, after);

    if (event.kind === 'minor') {
      pushToast({
        variant: 'minor',
        banner: text.banner,
        message: text.message,
        accent: theme.accent,
      });
    } else {
      setSurge({
        id: makeId(),
        variant: event.kind,
        banner: text.banner,
        message: text.message,
        chinese: after.realm.chinese,
        pinyin: after.realm.pinyin,
        english: after.realm.english,
        accent: theme.accent,
        glow: theme.glow,
      });
    }
  }

  function celebrateAchievements(prev: Session[], next: Session[]) {
    const before = new Set(
      achievementsFor(prev).filter((a) => a.unlocked).map((a) => a.id),
    );
    const after = achievementsFor(next).filter((a) => a.unlocked);
    for (const a of after) {
      if (!before.has(a.id)) {
        pushToast({
          variant: 'achievement',
          banner: `${a.chinese} · ${a.title}`,
          message: a.description,
          accent: '#f5cd6b',
        });
      }
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  function addSession(input: LogInput) {
    const prevSessions = state.sessions;
    const session: Session = {
      id: makeId(),
      path: input.path,
      minutes: input.minutes,
      note: input.note,
      timestamp: input.timestamp,
    };
    const nextSessions = [...prevSessions, session];

    const before = getCultivationStatus(sumHours(prevSessions));
    const after = getCultivationStatus(sumHours(nextSessions));

    setState((s) => ({ ...s, sessions: nextSessions }));
    celebrate(before, after);
    celebrateAchievements(prevSessions, nextSessions);
  }

  function deleteSession(id: string) {
    setState((s) => ({
      ...s,
      sessions: s.sessions.filter((x) => x.id !== id),
    }));
  }

  function addPath(name: string) {
    setState((s) =>
      s.paths.includes(name) ? s : { ...s, paths: [...s.paths, name] },
    );
  }

  function removePath(name: string) {
    setState((s) =>
      s.paths.length <= 1
        ? s
        : { ...s, paths: s.paths.filter((p) => p !== name) },
    );
  }

  function addReward(name: string, cost: number) {
    const reward: Reward = { id: makeId(), name, cost, redeemed: 0 };
    setState((s) => ({ ...s, rewards: [...s.rewards, reward] }));
  }

  function removeReward(id: string) {
    setState((s) => ({ ...s, rewards: s.rewards.filter((r) => r.id !== id) }));
  }

  function redeemReward(id: string) {
    setState((s) => {
      const reward = s.rewards.find((r) => r.id === id);
      if (!reward) return s;
      const bal = stoneBalance(sumHours(s.sessions), s.spentStones);
      if (bal < reward.cost) return s;
      return {
        ...s,
        spentStones: s.spentStones + reward.cost,
        rewards: s.rewards.map((r) =>
          r.id === id ? { ...r, redeemed: r.redeemed + 1 } : r,
        ),
      };
    });
  }

  function toggleMute() {
    setState((s) => ({ ...s, muted: !s.muted }));
  }

  function reset() {
    clearState();
    setState(defaultState());
    setToasts([]);
    setSurge(null);
  }

  function handleExport() {
    const blob = new Blob([exportState(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `xiuxing-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImport(text: string): boolean {
    try {
      const imported = importState(text);
      setState(imported);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className="min-h-full">
      <BreakthroughToast
        toasts={toasts}
        surge={surge}
        onDismissToast={(id) =>
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }
        onSurgeEnd={() => setSurge(null)}
      />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-cjk text-4xl font-black tracking-tight text-jade-300 sm:text-5xl">
              修行
              <span className="ml-3 align-middle text-base font-normal uppercase tracking-[0.3em] text-slate-400">
                Cultivation Tracker
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Turn the hours you pour into your craft into 修为. Cultivate, break
              through, ascend.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={
                state.muted
                  ? 'Unmute breakthrough sounds'
                  : 'Mute breakthrough sounds'
              }
              title={state.muted ? 'Sound off' : 'Sound on'}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-slate-300 transition hover:border-jade-500 hover:text-jade-300"
            >
              {state.muted ? '🔇' : '🔊'}
            </button>
            <DataControls
              onExport={handleExport}
              onImport={handleImport}
              onReset={reset}
            />
          </div>
        </header>

        {/* Body */}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Dashboard
              status={status}
              totalSessions={state.sessions.length}
              streak={streak}
              breakdown={breakdown}
              paths={state.paths}
            />
            <DailyChart data={daily} />
            <SessionList
              sessions={state.sessions}
              paths={state.paths}
              onDelete={deleteSession}
            />
          </div>

          <div className="space-y-5">
            <LogSessionForm
              paths={state.paths}
              onLog={addSession}
              onAddPath={addPath}
              onRemovePath={removePath}
            />
            <MeditationTimer paths={state.paths} onLog={addSession} />
            <SpiritStones
              earned={earned}
              balance={balance}
              rewards={state.rewards}
              onAddReward={addReward}
              onRemoveReward={removeReward}
              onRedeem={redeemReward}
            />
            <Achievements achievements={achievements} />
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-600">
          道阻且长，行则将至 · The way is long; those who walk it arrive. All
          progress is saved locally in your browser.
        </footer>
      </div>
    </div>
  );
}
