// Breakthrough sound effects via the Web Audio API — no audio assets needed.
// We synthesize a soft, bell-like pentatonic chime (an "eastern" flavor) whose
// length/richness scales with the breakthrough kind. All calls are best-effort
// and silently no-op if audio is unavailable or muted.

type Kind = 'minor' | 'major' | 'ascension';

// C-major pentatonic across a few octaves (Hz) — indexable runs read nicely.
const SCALE = [
  261.63, 293.66, 329.63, 392.0, 440.0, // C4 D4 E4 G4 A4
  523.25, 587.33, 659.25, 783.99, 880.0, // C5 D5 E5 G5 A5
  1046.5, 1174.66, 1318.51, // C6 D6 E6
];

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

/** Play a single bell-ish note with a quick attack and exponential decay. */
function note(
  ac: AudioContext,
  freq: number,
  at: number,
  dur: number,
  gain: number,
) {
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  // a faint detuned partial gives it a touch of shimmer
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env).connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/**
 * Play the breakthrough chime. Must be triggered from (or just after) a user
 * gesture so the AudioContext can resume in autoplay-restricted browsers.
 */
export function playBreakthrough(kind: Kind, muted: boolean): void {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') void ac.resume();
  } catch {
    /* ignore */
  }

  const t = ac.currentTime + 0.02;

  if (kind === 'minor') {
    // a quick two-note rise: G4 → C5
    note(ac, SCALE[3], t, 0.28, 0.12);
    note(ac, SCALE[5], t + 0.1, 0.45, 0.12);
    return;
  }

  if (kind === 'major') {
    // an ascending pentatonic arpeggio
    const seq = [3, 5, 7, 9, 10]; // G4 C5 E5 G5 C6
    seq.forEach((i, n) => note(ac, SCALE[i], t + n * 0.09, 0.6, 0.13));
    // a sustained low fifth underneath for body
    note(ac, SCALE[0], t, 0.9, 0.07);
    return;
  }

  // ascension — a long shimmering run capped by a chord
  const run = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  run.forEach((i, n) => note(ac, SCALE[i], t + n * 0.07, 0.7, 0.1));
  const end = t + run.length * 0.07;
  [10, 12, 9].forEach((i) => note(ac, SCALE[i], end, 1.6, 0.12)); // C6 E6 G5 chord
}
