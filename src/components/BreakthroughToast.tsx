import { useEffect, useMemo } from 'react';

export interface ToastItem {
  id: string;
  variant: 'minor' | 'achievement';
  banner: string;
  message: string;
  accent: string;
}

export interface SurgeItem {
  id: string;
  variant: 'major' | 'ascension';
  banner: string;
  message: string;
  chinese: string;
  pinyin: string;
  english: string;
  accent: string;
  glow: string;
}

interface Props {
  toasts: ToastItem[];
  surge: SurgeItem | null;
  onDismissToast: (id: string) => void;
  onSurgeEnd: () => void;
}

/**
 * Renders the breakthrough feedback system:
 *  - a top-center stack of small toasts (minor breakthroughs, achievements)
 *  - a full-screen qi/particle surge for major breakthroughs & ascension
 */
export default function BreakthroughToast({
  toasts,
  surge,
  onDismissToast,
  onSurgeEnd,
}: Props) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => onDismissToast(t.id)} />
        ))}
      </div>
      {surge && <Surge surge={surge} onEnd={onSurgeEnd} />}
    </>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isAchievement = toast.variant === 'achievement';

  return (
    <div
      className="animate-toast-in pointer-events-auto w-full max-w-md cursor-pointer rounded-xl border bg-ink-850/95 px-4 py-3 shadow-xl backdrop-blur"
      style={{
        borderColor: `${toast.accent}66`,
        boxShadow: `0 8px 30px ${toast.accent}33`,
      }}
      onClick={onDismiss}
      role="status"
    >
      <p
        className="font-serif-cjk text-lg font-bold"
        style={{ color: toast.accent }}
      >
        {isAchievement ? '🏆 ' : ''}
        {toast.banner}
      </p>
      <p className="mt-0.5 text-sm text-slate-300">{toast.message}</p>
    </div>
  );
}

function Surge({ surge, onEnd }: { surge: SurgeItem; onEnd: () => void }) {
  const isAscension = surge.variant === 'ascension';

  useEffect(() => {
    const t = setTimeout(onEnd, isAscension ? 4200 : 2600);
    return () => clearTimeout(t);
  }, [onEnd, isAscension]);

  // precompute particle vectors once per surge
  const particles = useMemo(() => {
    const n = isAscension ? 40 : 26;
    return Array.from({ length: n }, (_, i) => {
      const angle = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 120 + Math.random() * (isAscension ? 320 : 200);
      return {
        dx: `${Math.cos(angle) * dist}px`,
        dy: `${Math.sin(angle) * dist}px`,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 0.25,
      };
    });
  }, [isAscension]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
      onClick={onEnd}
    >
      {/* full-screen color wash */}
      <div
        className="animate-screen-surge absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${surge.glow}, transparent 70%)`,
        }}
      />

      {/* expanding qi rings */}
      <div
        className="animate-burst-ring absolute left-1/2 top-1/2 h-64 w-64 rounded-full border-2"
        style={{ borderColor: surge.accent }}
      />
      <div
        className="animate-burst-ring absolute left-1/2 top-1/2 h-40 w-40 rounded-full border"
        style={{ borderColor: surge.accent, animationDelay: '0.15s' }}
      />

      {/* particle burst */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="animate-particle-fly absolute left-1/2 top-1/2 rounded-full"
          style={
            {
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: surge.accent,
              boxShadow: `0 0 8px ${surge.accent}`,
              '--dx': p.dx,
              '--dy': p.dy,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* grand message */}
      <div className="relative px-6 text-center">
        <p
          className="font-serif-cjk text-3xl font-bold sm:text-4xl"
          style={{ color: surge.accent, textShadow: `0 0 30px ${surge.glow}` }}
        >
          {surge.banner}
        </p>
        <h1
          className="animate-title-rise font-serif-cjk mt-4 text-7xl font-black sm:text-8xl"
          style={{ color: surge.accent, textShadow: `0 0 50px ${surge.glow}` }}
        >
          {surge.chinese}
        </h1>
        <p className="mt-3 text-xl text-slate-100">{surge.pinyin}</p>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
          {surge.english}
        </p>
        <p className="animate-fade-in mt-5 text-base text-slate-200/90">
          {surge.message}
        </p>
      </div>
    </div>
  );
}
