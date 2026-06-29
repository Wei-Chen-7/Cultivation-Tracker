// Flavorful 凡人修仙传-style breakthrough lines. Pure: given a breakthrough and
// the status reached, returns the banner + message to display.

import type { BreakthroughKind, CultivationStatus } from './realms';

const MINOR_FLAVORS = [
  '灵气涌动，境界微升。',
  '一线灵光，更进一步。',
  '心境通明，更上层楼。',
  '丹田震颤，修为精进。',
];

const MAJOR_FLAVORS = [
  '天地灵气为之一震！',
  '雷云汇聚，天劫已渡！',
  '脱胎换骨，气象一新！',
  '一朝顿悟，登临新境！',
];

function pick(arr: readonly string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface BreakthroughText {
  banner: string;
  message: string;
}

export function breakthroughText(
  kind: BreakthroughKind,
  status: CultivationStatus,
): BreakthroughText {
  const realm = status.realm;
  const stage = status.stage;

  if (kind === 'ascension') {
    return {
      banner: '飞升成仙！',
      message: `You have transcended the mortal coil and ascended to ${realm.chinese} (${realm.english})!`,
    };
  }

  if (kind === 'major') {
    return {
      banner: pick(MAJOR_FLAVORS),
      message: `天劫已渡! You have broken through to ${realm.chinese} (${realm.english})!`,
    };
  }

  // minor
  return {
    banner: '突破！',
    message: `${pick(MINOR_FLAVORS)} You have reached ${realm.chinese} ${stage.chinese} (${realm.english}, ${stage.english}).`,
  };
}
