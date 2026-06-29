// Shared domain types for 修行 Tracker.

/** A single logged study/cultivation session. */
export interface Session {
  id: string;
  /** the Path this time was spent on, e.g. "Research" */
  path: string;
  /** duration in minutes (the canonical unit we store) */
  minutes: number;
  /** optional free-text note */
  note?: string;
  /** when the session happened — epoch milliseconds (survives JSON round-trip) */
  timestamp: number;
}

/** A self-defined reward that 灵石 (spirit stones) can be spent on. */
export interface Reward {
  id: string;
  name: string;
  /** cost in spirit stones */
  cost: number;
  /** how many times it has been redeemed */
  redeemed: number;
}

/** The full persisted application state. */
export interface AppState {
  /** schema version, for forward-compatible migrations */
  version: number;
  sessions: Session[];
  /** configurable list of Paths (default: Research / German / Math / Physics) */
  paths: string[];
  /** spirit stones already spent on rewards */
  spentStones: number;
  /** user-defined reward catalog */
  rewards: Reward[];
  /** mute breakthrough sound effects */
  muted: boolean;
  /** daily cultivation goal in minutes (for the "today" ring) */
  dailyGoalMinutes: number;
}
