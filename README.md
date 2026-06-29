# 修行 Tracker · Cultivation Tracker

A xianxia-themed study tracker. Log the hours you spend on your real pursuits
(research, languages, math, physics…) and watch them become **修为 (cultivation
base)**. As your 修为 accumulates you climb the cultivation realms and trigger
dramatic **breakthrough** moments — styled after 凡人修仙传 / xianxia.

Log an hour, watch the qi progress bar fill, chase the next breakthrough.

## Run it

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run lint     # oxlint
```

Everything is **fully client-side** — state lives in `localStorage`, no backend.

## The realm ladder

Nine major realms, each with four minor stages (前期 Early · 中期 Middle · 后期
Late · 大圆满 Great Perfection), then a final ascended state.

| # | Realm | Pinyin | English |
|---|-------|--------|---------|
| 0 | 炼气 | Liànqì | Qi Condensation |
| 1 | 筑基 | Zhùjī | Foundation Establishment |
| 2 | 结丹 | Jiédān | Core Formation |
| 3 | 元婴 | Yuányīng | Nascent Soul |
| 4 | 化神 | Huàshén | Deity Transformation |
| 5 | 炼虚 | Liànxū | Void Refinement |
| 6 | 合体 | Hétǐ | Body Integration |
| 7 | 大乘 | Dàchéng | Grand Ascension |
| 8 | 渡劫 | Dùjié | Tribulation Transcendence |
| ★ | 真仙 | Zhēnxiān | True Immortal (ascended finale) |

## The progression math

The cumulative hours needed to **reach** major realm `r` follow a super-linear
curve so early breakthroughs come fast and later ones take far longer:

```
T(r) = A · (gʳ − 1)      with  A = 25,  g = 1.6
```

So `T(0)=0`, `T(1)≈15`, `T(2)≈39`, … `T(8)≈1049`, and ascension at
`T(9)≈1693` hours. Each realm's hour band is split into four equal quarters for
the minor stages. `A` and `g` are exposed as named constants in
[`src/cultivation/realms.ts`](src/cultivation/realms.ts) — tune them to set how
grindy it feels.

Breakthroughs are detected by comparing the realm/stage **before vs after** each
logged session: crossing a minor boundary flashes a celebratory toast, crossing
a major realm triggers a full-screen qi/particle surge, and reaching 真仙 is a
one-time finale.

## Features

- **Logging** — pick a Path (editable; defaults Research / German / Math /
  Physics), enter minutes or hours + an optional note, and optionally backdate
  the session (fix a misclick or backfill past days). Sessions are listed
  newest-first and individually deletable (deleting recomputes everything).
- **Breakthrough sound** — a soft synthesized pentatonic chime on breakthrough
  (Web Audio, no assets) that grows richer for major realms & ascension, with a
  mute toggle that persists.
- **Dashboard** — big current-realm display with a flowing-qi progress bar
  (glow intensifies as the realm climbs), total hours, sessions, current &
  longest streak, and a per-path breakdown.
- **Streaks** — consecutive calendar days with ≥1 session. Timestamps are
  stored as epoch milliseconds and compared by local calendar day (no fragile
  `Date` round-trips through JSON).
- **Persistence** — auto-saves on every change; loads safely on mount and falls
  back to a clean cultivator on missing/corrupt storage. A Reset button (behind
  a confirm) wipes progress.

### Stretch features

- **闭关** seclusion timer that auto-logs when you stop.
- **Export / Import** your data as a JSON backup.
- **Hours-per-day chart** over the last few weeks (Recharts).
- **成就 achievements** (first session, 100 hours, 7-day streak, first major
  breakthrough, ascension…).
- **灵石 spirit stones** — one earned per hour, spendable on self-defined rewards.

## Structure

```
src/
  cultivation/
    realms.ts           realm ladder + progression math (pure)
    stats.ts            totals, per-path, streaks, daily chart, achievements
    realmTheme.ts       per-realm color/glow palette
    breakthroughText.ts flavor lines for breakthroughs
  storage/store.ts      typed load/save/export/import with safe defaults
  components/           Dashboard, RealmProgress, LogSessionForm, SessionList,
                        BreakthroughToast, StreakBadge, PathBreakdown,
                        MeditationTimer, DailyChart, Achievements, SpiritStones,
                        DataControls
  App.tsx               holds state, wires it together, detects breakthroughs
```

## Stack

React + TypeScript + Vite · Tailwind CSS · localStorage · Recharts (chart only).
