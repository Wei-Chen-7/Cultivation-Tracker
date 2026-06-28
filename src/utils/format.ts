// Small formatting helpers shared across components.

/** "12.5h", "3h", "0.4h" — trims trailing zeros. */
export function formatHours(hours: number): string {
  if (hours >= 100) return `${Math.round(hours)}h`;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}h`;
}

/** "1h 30m", "45m", "2h" from a minute count. */
export function formatDuration(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h === 0) return `${rem}m`;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}m`;
}

/** Relative time like "just now", "5m ago", "3h ago", "2d ago", else a date. */
export function formatRelative(timestampMs: number, now = Date.now()): string {
  const diff = now - timestampMs;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(timestampMs).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/** "Jun 28, 3:40 PM" for tooltips / detail. */
export function formatDateTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
