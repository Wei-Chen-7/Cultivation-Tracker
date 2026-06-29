// Visual theming that intensifies as the cultivator climbs realms.
// Returns concrete colors (not Tailwind classes) so we can scale the qi glow
// smoothly and use them in inline gradients / box-shadows.

export interface RealmTheme {
  /** primary accent (text, glow) */
  accent: string;
  /** gradient stops for the qi progress bar, left → right */
  barFrom: string;
  barVia: string;
  barTo: string;
  /** rgba glow color for shadows */
  glow: string;
  /** glow blur radius in px — grows with realm */
  glowBlur: number;
}

// Hand-tuned palette per major realm (index 0..8) + ascended (9).
// Early realms: cool jade. Mid: teal→cyan. Late: violet/gold. Ascension: gold.
const PALETTE: RealmTheme[] = [
  // 0 炼气 — soft jade
  { accent: '#44e0a8', barFrom: '#12a673', barVia: '#1fcf90', barTo: '#7ff0c8', glow: 'rgba(31,207,144,0.55)', glowBlur: 16 },
  // 1 筑基 — brighter jade
  { accent: '#3fe0b4', barFrom: '#0fa97e', barVia: '#21d6a0', barTo: '#8ff2d6', glow: 'rgba(33,214,160,0.6)', glowBlur: 20 },
  // 2 结丹 — teal-cyan (golden core hint)
  { accent: '#34dcc8', barFrom: '#0e9aa0', barVia: '#22ccc4', barTo: '#9af0e6', glow: 'rgba(34,204,196,0.62)', glowBlur: 24 },
  // 3 元婴 — cyan
  { accent: '#3ccfe6', barFrom: '#1290b8', barVia: '#2bc0e0', barTo: '#a6ecf7', glow: 'rgba(43,192,224,0.64)', glowBlur: 28 },
  // 4 化神 — azure
  { accent: '#5bb6f5', barFrom: '#1f6fd0', barVia: '#3f9bf0', barTo: '#b6dcff', glow: 'rgba(63,155,240,0.66)', glowBlur: 32 },
  // 5 炼虚 — indigo
  { accent: '#8c9cf7', barFrom: '#4a4fd6', barVia: '#6f7cf0', barTo: '#c2caff', glow: 'rgba(111,124,240,0.68)', glowBlur: 36 },
  // 6 合体 — violet
  { accent: '#b388f7', barFrom: '#7a3fd6', barVia: '#9d6cf0', barTo: '#dcc6ff', glow: 'rgba(157,108,240,0.7)', glowBlur: 40 },
  // 7 大乘 — magenta-gold
  { accent: '#e08fd6', barFrom: '#b03fa6', barVia: '#d46cc8', barTo: '#f3c6ec', glow: 'rgba(212,108,200,0.72)', glowBlur: 44 },
  // 8 渡劫 — ember gold (heavenly tribulation)
  { accent: '#f5b25b', barFrom: '#d6691f', barVia: '#f0993f', barTo: '#ffe0b6', glow: 'rgba(240,153,63,0.76)', glowBlur: 50 },
  // 9 真仙 — radiant gold
  { accent: '#ffe6a3', barFrom: '#e0b13f', barVia: '#f5cd6b', barTo: '#fff4d6', glow: 'rgba(245,205,107,0.85)', glowBlur: 60 },
];

export function realmTheme(realmIndex: number): RealmTheme {
  const i = Math.max(0, Math.min(PALETTE.length - 1, realmIndex));
  return PALETTE[i];
}

/** Stable color per Path for the breakdown bars / chart legend. */
const PATH_COLORS = [
  '#1fcf90',
  '#3ccfe6',
  '#f5cd6b',
  '#b388f7',
  '#e08fd6',
  '#5bb6f5',
  '#f0993f',
  '#44e0a8',
];

export function pathColor(path: string, allPaths: string[]): string {
  const idx = allPaths.indexOf(path);
  const i = idx >= 0 ? idx : hashString(path);
  return PATH_COLORS[i % PATH_COLORS.length];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
