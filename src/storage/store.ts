// ──────────────────────────────────────────────────────────────────────────
// store.ts — typed load/save to localStorage with safe defaults.
//
// Golden rule: NEVER crash on bad/empty/corrupt storage. Anything unexpected
// falls back to a clean default cultivator (0 hours → 炼气 前期).
// ──────────────────────────────────────────────────────────────────────────

import type { AppState, Session, Reward } from '../types';

const STORAGE_KEY = 'xiuxing-tracker:v1';
const SCHEMA_VERSION = 1;

export const DEFAULT_PATHS = ['Research', 'German', 'Math', 'Physics'];

export function defaultState(): AppState {
  return {
    version: SCHEMA_VERSION,
    sessions: [],
    paths: [...DEFAULT_PATHS],
    spentStones: 0,
    rewards: [],
    muted: false,
    dailyGoalMinutes: 120,
  };
}

const DEFAULT_DAILY_GOAL = 120;

// ── Validation helpers ──────────────────────────────────────────────────────
// We hand-validate rather than trust the shape, because localStorage data may
// have been written by an older version, hand-edited, or corrupted.

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function sanitizeSession(raw: unknown): Session | null {
  if (!isObject(raw)) return null;
  const { id, path, minutes, note, timestamp } = raw;
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    return null;
  }
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return null;
  return {
    id: typeof id === 'string' && id ? id : makeId(),
    path: typeof path === 'string' && path ? path : 'Unknown',
    minutes,
    note: typeof note === 'string' && note.trim() ? note : undefined,
    timestamp,
  };
}

function sanitizeReward(raw: unknown): Reward | null {
  if (!isObject(raw)) return null;
  const { id, name, cost, redeemed } = raw;
  if (typeof name !== 'string' || !name.trim()) return null;
  if (typeof cost !== 'number' || !Number.isFinite(cost) || cost <= 0) return null;
  return {
    id: typeof id === 'string' && id ? id : makeId(),
    name: name.trim(),
    cost: Math.round(cost),
    redeemed:
      typeof redeemed === 'number' && Number.isFinite(redeemed) && redeemed > 0
        ? Math.floor(redeemed)
        : 0,
  };
}

/** Coerce any parsed value into a valid AppState, dropping junk. */
export function sanitizeState(raw: unknown): AppState {
  if (!isObject(raw)) return defaultState();

  const sessions = Array.isArray(raw.sessions)
    ? raw.sessions
        .map(sanitizeSession)
        .filter((s): s is Session => s !== null)
        // newest first is a UI concern; store chronologically? we keep as-is and
        // sort in selectors, but de-dupe ids to be safe.
        .filter((s, i, arr) => arr.findIndex((o) => o.id === s.id) === i)
    : [];

  const paths =
    Array.isArray(raw.paths) && raw.paths.length > 0
      ? Array.from(
          new Set(
            raw.paths.filter(
              (p): p is string => typeof p === 'string' && p.trim().length > 0,
            ),
          ),
        )
      : [...DEFAULT_PATHS];

  const rewards = Array.isArray(raw.rewards)
    ? raw.rewards.map(sanitizeReward).filter((r): r is Reward => r !== null)
    : [];

  const spentStones =
    typeof raw.spentStones === 'number' &&
    Number.isFinite(raw.spentStones) &&
    raw.spentStones > 0
      ? Math.floor(raw.spentStones)
      : 0;

  return {
    version: SCHEMA_VERSION,
    sessions,
    paths: paths.length > 0 ? paths : [...DEFAULT_PATHS],
    spentStones,
    rewards,
    muted: raw.muted === true,
    dailyGoalMinutes:
      typeof raw.dailyGoalMinutes === 'number' &&
      Number.isFinite(raw.dailyGoalMinutes) &&
      raw.dailyGoalMinutes > 0
        ? Math.round(raw.dailyGoalMinutes)
        : DEFAULT_DAILY_GOAL,
  };
}

/** Load and validate state from localStorage. Always returns a usable state. */
export function loadState(): AppState {
  try {
    const rawText = localStorage.getItem(STORAGE_KEY);
    if (!rawText) return defaultState();
    const parsed: unknown = JSON.parse(rawText);
    return sanitizeState(parsed);
  } catch {
    // bad JSON, blocked storage, quota, etc. → start clean rather than crash
    return defaultState();
  }
}

/** Persist state. Swallows quota/availability errors silently. */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable / full — non-fatal */
  }
}

/** Wipe all persisted progress. */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* non-fatal */
  }
}

// ── Export / Import (stretch) ───────────────────────────────────────────────

/** Serialize the whole state for download as a backup file. */
export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

/** Parse + validate an imported backup string. Throws on unusable input. */
export function importState(text: string): AppState {
  const parsed: unknown = JSON.parse(text); // may throw — caller handles
  const state = sanitizeState(parsed);
  return state;
}

// ── id generation ───────────────────────────────────────────────────────────

export function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
