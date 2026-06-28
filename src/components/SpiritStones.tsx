import { useState } from 'react';
import type { Reward } from '../types';

interface Props {
  earned: number;
  balance: number;
  rewards: Reward[];
  onAddReward: (name: string, cost: number) => void;
  onRemoveReward: (id: string) => void;
  onRedeem: (id: string) => void;
}

/** 灵石 — one stone earned per cultivation hour, spent on self-defined rewards. */
export default function SpiritStones({
  earned,
  balance,
  rewards,
  onAddReward,
  onRemoveReward,
  onRedeem,
}: Props) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');

  function add() {
    const c = parseInt(cost, 10);
    if (!name.trim() || !Number.isFinite(c) || c <= 0) return;
    onAddReward(name.trim(), c);
    setName('');
    setCost('');
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-jade-400">
          灵石 · Spirit Stones
        </h2>
        <span className="text-xs text-slate-500">{earned} earned</span>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          💎
        </span>
        <span className="text-3xl font-bold text-gold-300">{balance}</span>
        <span className="text-sm text-slate-400">available</span>
      </div>

      {rewards.length > 0 && (
        <ul className="mb-4 space-y-2">
          {rewards.map((r) => (
            <li
              key={r.id}
              className="group flex items-center gap-2 rounded-lg border border-white/5 bg-ink-850/50 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-200">{r.name}</p>
                <p className="text-xs text-slate-500">
                  {r.cost} 灵石
                  {r.redeemed > 0 && ` · redeemed ${r.redeemed}×`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRedeem(r.id)}
                disabled={balance < r.cost}
                className="rounded-md bg-gold-500/90 px-2.5 py-1 text-xs font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-30"
              >
                Redeem
              </button>
              <button
                type="button"
                aria-label="Remove reward"
                onClick={() => onRemoveReward(r.id)}
                className="text-slate-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Reward…"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-jade-500"
        />
        <input
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          type="number"
          min="1"
          placeholder="Cost"
          className="w-20 rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-jade-500"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-jade-600 px-3 py-2 text-sm font-medium text-ink-950 transition hover:bg-jade-500"
        >
          Add
        </button>
      </div>
    </div>
  );
}
