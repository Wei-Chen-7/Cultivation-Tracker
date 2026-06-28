import type { CultivationStatus } from '../cultivation/realms';
import type { PathTotal, StreakInfo } from '../cultivation/stats';
import { formatHours } from '../utils/format';
import RealmProgress from './RealmProgress';
import StreakBadge from './StreakBadge';
import PathBreakdown from './PathBreakdown';

interface Props {
  status: CultivationStatus;
  totalSessions: number;
  streak: StreakInfo;
  breakdown: PathTotal[];
  paths: string[];
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}

export default function Dashboard({
  status,
  totalSessions,
  streak,
  breakdown,
  paths,
}: Props) {
  return (
    <div className="space-y-5">
      <RealmProgress status={status} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="修为 · Total Hours" value={formatHours(status.totalHours)} />
        <StatCard label="Sessions" value={String(totalSessions)} />
        <StreakBadge streak={streak} />
        <StatCard label="Longest Streak" value={`${streak.longest}d`} />
      </div>

      <PathBreakdown breakdown={breakdown} paths={paths} />
    </div>
  );
}
