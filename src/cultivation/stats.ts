// ──────────────────────────────────────────────────────────────────────────
// stats.ts — derived selectors over the session list (all pure functions).
//
// Everything here is recomputed from sessions, so deleting a session naturally
// recomputes totals, streaks, per-path breakdown, etc.
// ──────────────────────────────────────────────────────────────────────────

import type { Session } from '../types';

export function minutesToHours(minutes: number): number {
  return minutes / 60;
}

/** Total cultivation hours across all sessions. */
export function totalHours(sessions: Session[]): number {
  return minutesToHours(sessions.reduce((sum, s) => sum + s.minutes, 0));
}

export interface PathTotal {
  path: string;
  hours: number;
  minutes: number;
  /** share of total time, 0..1 */
  fraction: number;
}

/**
 * Hours per path, including any configured paths with zero time so the UI can
 * still list them. Sorted by hours descending.
 */
export function pathBreakdown(sessions: Session[], paths: string[]): PathTotal[] {
  const byPath = new Map<string, number>();
  for (const p of paths) byPath.set(p, 0);
  for (const s of sessions) {
    byPath.set(s.path, (byPath.get(s.path) ?? 0) + s.minutes);
  }
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  return Array.from(byPath.entries())
    .map(([path, minutes]) => ({
      path,
      minutes,
      hours: minutesToHours(minutes),
      fraction: totalMinutes > 0 ? minutes / totalMinutes : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

// ── Streaks (the Date bug zone) ─────────────────────────────────────────────
//
// All timestamps are epoch milliseconds. We convert each to a stable LOCAL
// calendar-day index (days since the Unix epoch, using the local Y/M/D) and do
// all streak math on those integers. We never assume a value is a Date object,
// and we compare by calendar day — not by raw 24h gaps.

/** Local calendar-day index for an epoch-ms timestamp. */
export function dayIndex(timestampMs: number): number {
  const d = new Date(timestampMs);
  // Build a UTC midnight from the LOCAL Y/M/D so DST/timezone never shifts the
  // day, then divide by ms-per-day.
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
  );
}

export interface StreakInfo {
  current: number;
  longest: number;
}

/**
 * Current and longest run of consecutive calendar days that have >= 1 session.
 * `current` counts the run ending at the most recent active day, and only
 * "counts" if that day is today or yesterday (otherwise the streak has lapsed).
 */
export function computeStreaks(
  sessions: Session[],
  now: number = Date.now(),
): StreakInfo {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  const days = Array.from(
    new Set(sessions.map((s) => dayIndex(s.timestamp))),
  ).sort((a, b) => a - b);

  // longest consecutive run
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // current run, anchored to today/yesterday
  const today = dayIndex(now);
  const last = days[days.length - 1];
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (days[i] === days[i + 1] - 1) current++;
      else break;
    }
  }

  return { current, longest };
}

// ── Daily chart data (stretch) ──────────────────────────────────────────────

export interface DailyPoint {
  /** local day index */
  day: number;
  /** short label e.g. "Jun 28" */
  label: string;
  hours: number;
}

/** Hours logged per day for the last `days` calendar days (oldest → newest). */
export function dailyHours(
  sessions: Session[],
  days = 21,
  now: number = Date.now(),
): DailyPoint[] {
  const today = dayIndex(now);
  const start = today - (days - 1);

  const minutesByDay = new Map<number, number>();
  for (const s of sessions) {
    const d = dayIndex(s.timestamp);
    if (d >= start && d <= today) {
      minutesByDay.set(d, (minutesByDay.get(d) ?? 0) + s.minutes);
    }
  }

  const points: DailyPoint[] = [];
  for (let d = start; d <= today; d++) {
    const date = new Date(d * 86_400_000);
    points.push({
      day: d,
      label: date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }),
      hours: minutesToHours(minutesByDay.get(d) ?? 0),
    });
  }
  return points;
}

// ── Spirit stones (灵石) ─────────────────────────────────────────────────────

/** One spirit stone earned per whole cultivation hour. */
export function stonesEarned(hours: number): number {
  return Math.floor(hours);
}

export function stoneBalance(hours: number, spent: number): number {
  return Math.max(0, stonesEarned(hours) - spent);
}

// ── Achievements (成就) ──────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  chinese: string;
  description: string;
  unlocked: boolean;
}

export interface AchievementInputs {
  sessions: Session[];
  hours: number;
  streak: StreakInfo;
  majorRealmIndex: number;
  ascended: boolean;
}

/** Compute the achievement list with current unlocked state (derived). */
export function computeAchievements(input: AchievementInputs): Achievement[] {
  const { sessions, hours, streak, majorRealmIndex, ascended } = input;
  const distinctPaths = new Set(sessions.map((s) => s.path)).size;
  const hasSeclusion = sessions.some((s) => (s.note ?? '').includes('闭关'));

  return [
    {
      id: 'first-session',
      title: 'First Steps on the Path',
      chinese: '初入修行',
      description: 'Log your very first cultivation session.',
      unlocked: sessions.length >= 1,
    },
    {
      id: 'ten-sessions',
      title: 'Diligent Disciple',
      chinese: '勤修不辍',
      description: 'Log 10 sessions.',
      unlocked: sessions.length >= 10,
    },
    {
      id: 'seclusion',
      title: 'Deep Seclusion',
      chinese: '闭关苦修',
      description: 'Complete a 闭关 seclusion timer session.',
      unlocked: hasSeclusion,
    },
    {
      id: 'all-paths',
      title: 'Many Paths, One Dao',
      chinese: '诸法皆修',
      description: 'Log time on four or more different paths.',
      unlocked: distinctPaths >= 4,
    },
    {
      id: 'hundred-hours',
      title: 'A Hundred Hours of Qi',
      chinese: '百时炼气',
      description: 'Accumulate 100 cultivation hours.',
      unlocked: hours >= 100,
    },
    {
      id: 'first-major',
      title: 'Foundation Laid',
      chinese: '筑基大成',
      description: 'Break through to your first major realm (筑基).',
      unlocked: majorRealmIndex >= 1,
    },
    {
      id: 'streak-7',
      title: 'Seven Days Unbroken',
      chinese: '七日不辍',
      description: 'Reach a 7-day cultivation streak.',
      unlocked: streak.longest >= 7,
    },
    {
      id: 'core-formed',
      title: 'Golden Core',
      chinese: '金丹凝成',
      description: 'Reach 结丹 (Core Formation).',
      unlocked: majorRealmIndex >= 2,
    },
    {
      id: 'nascent-soul',
      title: 'Nascent Soul Emerges',
      chinese: '元婴出窍',
      description: 'Reach 元婴 (Nascent Soul).',
      unlocked: majorRealmIndex >= 3,
    },
    {
      id: 'five-hundred-hours',
      title: 'Five Hundred Hours',
      chinese: '五百载功',
      description: 'Accumulate 500 cultivation hours.',
      unlocked: hours >= 500,
    },
    {
      id: 'streak-30',
      title: 'A Month Unbroken',
      chinese: '月不间断',
      description: 'Reach a 30-day cultivation streak.',
      unlocked: streak.longest >= 30,
    },
    {
      id: 'thousand-hours',
      title: 'A Thousand Hours Tempered',
      chinese: '千锤百炼',
      description: 'Accumulate 1000 cultivation hours.',
      unlocked: hours >= 1000,
    },
    {
      id: 'ascended',
      title: 'True Immortal',
      chinese: '飞升成仙',
      description: 'Transcend tribulation and ascend to 真仙.',
      unlocked: ascended,
    },
  ];
}
