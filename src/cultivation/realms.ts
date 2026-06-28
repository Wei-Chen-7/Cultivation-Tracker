// ──────────────────────────────────────────────────────────────────────────
// realms.ts — the realm ladder + progression math (all pure functions).
//
// This module is the heart of the "feel": logged hours become 修为 (cultivation
// base), and a super-linear curve decides which realm/stage you're in.
// ──────────────────────────────────────────────────────────────────────────

/**
 * Cumulative-hours curve. T(r) = hours needed to REACH the start of major
 * realm index r:  T(r) = A * (g^r - 1).
 *
 * tune these to set how grindy it feels — bigger A = slower early game,
 * bigger g = steeper escalation between realms.
 */
export const A = 25;
export const G = 1.6;

export interface Realm {
  /** 0..8 */
  index: number;
  /** Chinese name, e.g. 炼气 */
  chinese: string;
  /** pinyin, e.g. Liànqì */
  pinyin: string;
  /** English gloss, e.g. Qi Condensation */
  english: string;
}

export interface MinorStage {
  /** 0..3 */
  index: number;
  chinese: string;
  english: string;
}

/** The nine major realms, in order. Names are fixed canon — do not invent. */
export const REALMS: readonly Realm[] = [
  { index: 0, chinese: '炼气', pinyin: 'Liànqì', english: 'Qi Condensation' },
  { index: 1, chinese: '筑基', pinyin: 'Zhùjī', english: 'Foundation Establishment' },
  { index: 2, chinese: '结丹', pinyin: 'Jiédān', english: 'Core Formation' },
  { index: 3, chinese: '元婴', pinyin: 'Yuányīng', english: 'Nascent Soul' },
  { index: 4, chinese: '化神', pinyin: 'Huàshén', english: 'Deity Transformation' },
  { index: 5, chinese: '炼虚', pinyin: 'Liànxū', english: 'Void Refinement' },
  { index: 6, chinese: '合体', pinyin: 'Hétǐ', english: 'Body Integration' },
  { index: 7, chinese: '大乘', pinyin: 'Dàchéng', english: 'Grand Ascension' },
  { index: 8, chinese: '渡劫', pinyin: 'Dùjié', english: 'Tribulation Transcendence' },
] as const;

/** The four minor stages every major realm is divided into (equal quarters). */
export const MINOR_STAGES: readonly MinorStage[] = [
  { index: 0, chinese: '前期', english: 'Early' },
  { index: 1, chinese: '中期', english: 'Middle' },
  { index: 2, chinese: '后期', english: 'Late' },
  { index: 3, chinese: '大圆满', english: 'Great Perfection' },
] as const;

/** The final, ascended state reached after 渡劫 大圆满 is crossed. */
export const ASCENDED_REALM: Realm = {
  index: 9,
  chinese: '真仙',
  pinyin: 'Zhēnxiān',
  english: 'True Immortal',
};

export const MAJOR_REALM_COUNT = REALMS.length; // 9
export const MINOR_STAGE_COUNT = MINOR_STAGES.length; // 4

/**
 * Cumulative hours needed to reach the start of major realm `r`.
 * Defined for r = 0..9, where T(9) is the 真仙 (ascension) threshold.
 */
export function thresholdHours(r: number): number {
  return A * (Math.pow(G, r) - 1);
}

/** Hours required to ascend to 真仙. ~1692 with the default constants. */
export const ASCENSION_HOURS = thresholdHours(MAJOR_REALM_COUNT);

export interface CultivationStatus {
  /** raw cultivation base in hours */
  totalHours: number;
  /** true once the cultivator has crossed into 真仙 */
  ascended: boolean;
  realm: Realm;
  /** the current minor stage (defined even when ascended → 大圆满 of 真仙) */
  stage: MinorStage;
  /** hours accrued within the current minor stage */
  hoursIntoStage: number;
  /** width in hours of the current minor stage */
  stageSpan: number;
  /** hours remaining until the next breakthrough (0 once ascended) */
  hoursToNext: number;
  /** progress through the current stage, 0..1 */
  stageProgress: number;
  /**
   * A monotonically increasing ordinal for the current position on the ladder.
   * realmIndex * 4 + stageIndex, with the ascended state mapped just above the
   * last reachable stage. Use this to compare BEFORE vs AFTER a session.
   */
  ordinal: number;
}

/** The ordinal value that represents the ascended (真仙) state. */
export const ASCENDED_ORDINAL = MAJOR_REALM_COUNT * MINOR_STAGE_COUNT; // 36

/**
 * Given a total number of cultivation hours, compute the full status:
 * current realm, minor stage, progress into the stage, and hours to the next
 * breakthrough. Pure and total — handles 0, negatives, and huge values.
 */
export function getCultivationStatus(totalHours: number): CultivationStatus {
  const hours = Number.isFinite(totalHours) && totalHours > 0 ? totalHours : 0;

  // Ascended: at or beyond the 真仙 threshold.
  if (hours >= ASCENSION_HOURS) {
    return {
      totalHours: hours,
      ascended: true,
      realm: ASCENDED_REALM,
      stage: MINOR_STAGES[MINOR_STAGE_COUNT - 1],
      hoursIntoStage: hours - ASCENSION_HOURS,
      stageSpan: 0,
      hoursToNext: 0,
      stageProgress: 1,
      ordinal: ASCENDED_ORDINAL,
    };
  }

  // Find the major realm: largest r with T(r) <= hours.
  let realmIndex = 0;
  for (let r = MAJOR_REALM_COUNT - 1; r >= 0; r--) {
    if (hours >= thresholdHours(r)) {
      realmIndex = r;
      break;
    }
  }

  const realmStart = thresholdHours(realmIndex);
  const realmEnd = thresholdHours(realmIndex + 1);
  const realmSpan = realmEnd - realmStart;
  const stageSpan = realmSpan / MINOR_STAGE_COUNT;

  const intoRealm = hours - realmStart;
  let stageIndex = Math.floor(intoRealm / stageSpan);
  if (stageIndex < 0) stageIndex = 0;
  if (stageIndex > MINOR_STAGE_COUNT - 1) stageIndex = MINOR_STAGE_COUNT - 1;

  const stageStart = realmStart + stageIndex * stageSpan;
  const hoursIntoStage = hours - stageStart;
  const hoursToNext = stageSpan - hoursIntoStage;
  const stageProgress = stageSpan > 0 ? hoursIntoStage / stageSpan : 0;

  return {
    totalHours: hours,
    ascended: false,
    realm: REALMS[realmIndex],
    stage: MINOR_STAGES[stageIndex],
    hoursIntoStage,
    stageSpan,
    hoursToNext,
    stageProgress,
    ordinal: realmIndex * MINOR_STAGE_COUNT + stageIndex,
  };
}

export type BreakthroughKind = 'none' | 'minor' | 'major' | 'ascension';

export interface BreakthroughEvent {
  kind: BreakthroughKind;
  /** the status reached after the session that triggered it */
  to: CultivationStatus;
}

/**
 * Compare two statuses (before vs after a logged session) and classify the
 * biggest boundary crossed. Ascension > major > minor > none.
 */
export function detectBreakthrough(
  before: CultivationStatus,
  after: CultivationStatus,
): BreakthroughEvent {
  if (after.ordinal <= before.ordinal) {
    return { kind: 'none', to: after };
  }
  if (after.ascended && !before.ascended) {
    return { kind: 'ascension', to: after };
  }
  if (after.realm.index > before.realm.index) {
    return { kind: 'major', to: after };
  }
  return { kind: 'minor', to: after };
}
