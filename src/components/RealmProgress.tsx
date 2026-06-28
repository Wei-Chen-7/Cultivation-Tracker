import type { CultivationStatus } from '../cultivation/realms';
import { realmTheme } from '../cultivation/realmTheme';
import { formatHours } from '../utils/format';

interface Props {
  status: CultivationStatus;
}

/**
 * The big current-realm display with the flowing-qi progress bar to the next
 * breakthrough. Glow intensifies as the realm climbs.
 */
export default function RealmProgress({ status }: Props) {
  const theme = realmTheme(status.realm.index);
  const pct = Math.max(0, Math.min(1, status.stageProgress)) * 100;

  if (status.ascended) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gold-500/40 bg-ink-900/70 p-8 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${theme.glow}, transparent 70%)`,
          }}
        />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.4em] text-gold-400/80">
            道果圆满 · The Path Is Complete
          </p>
          <h1
            className="font-serif-cjk mt-4 text-7xl font-black text-gold-300 animate-ascend-pulse"
            style={{ color: theme.accent }}
          >
            {status.realm.chinese}
          </h1>
          <p className="mt-3 text-xl text-gold-200/90">{status.realm.pinyin}</p>
          <p className="text-sm uppercase tracking-widest text-slate-400">
            {status.realm.english}
          </p>
          <p className="mt-6 text-sm text-slate-300">
            {formatHours(status.totalHours)} of cultivation · you walk among the
            immortals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-ink-900/70 p-6 sm:p-8"
      style={{ borderColor: `${theme.accent}33` }}
    >
      {/* ambient realm glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${theme.glow}, transparent 65%)`,
        }}
      />

      <div className="relative">
        <p
          className="text-[0.7rem] uppercase tracking-[0.35em]"
          style={{ color: `${theme.accent}cc` }}
        >
          当前境界 · Current Realm
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-1">
          <h1
            className="font-serif-cjk text-6xl font-black leading-none sm:text-7xl"
            style={{ color: theme.accent, textShadow: `0 0 24px ${theme.glow}` }}
          >
            {status.realm.chinese}
          </h1>
          <div className="pb-1">
            <p className="text-lg text-slate-200">{status.realm.pinyin}</p>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              {status.realm.english}
            </p>
          </div>
          <div className="ml-auto pb-1 text-right">
            <p
              className="font-serif-cjk text-3xl font-bold"
              style={{ color: theme.accent }}
            >
              {status.stage.chinese}
            </p>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              {status.stage.english}
            </p>
          </div>
        </div>

        {/* qi progress bar */}
        <div className="mt-7">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-slate-400">
              {formatHours(status.hoursIntoStage)} /{' '}
              {formatHours(status.stageSpan)} this stage
            </span>
            <span style={{ color: theme.accent }}>
              {formatHours(status.hoursToNext)} to next breakthrough
            </span>
          </div>

          <div className="relative h-5 w-full overflow-hidden rounded-full bg-ink-800 ring-1 ring-inset ring-white/5">
            <div
              className="qi-flow relative h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${pct}%`,
                backgroundImage: `linear-gradient(90deg, ${theme.barFrom}, ${theme.barVia}, ${theme.barTo}, ${theme.barVia}, ${theme.barFrom})`,
                boxShadow: `0 0 ${theme.glowBlur}px ${theme.glow}`,
              }}
            >
              {/* leading shimmer cap */}
              <span className="qi-shimmer absolute inset-y-0 right-0 w-8 rounded-full bg-white/40 blur-[3px]" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{Math.round(pct)}% through {status.stage.chinese}</span>
            <span>{formatHours(status.totalHours)} total 修为</span>
          </div>
        </div>
      </div>
    </div>
  );
}
