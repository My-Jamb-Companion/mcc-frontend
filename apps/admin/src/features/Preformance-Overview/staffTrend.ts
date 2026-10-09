export interface Trend {
  /** "12.5%", or "New" when there was nothing before to compare with. */
  label: string;
  isPositive: boolean;
}

/** Change from the previous period to this one; null when both are zero (nothing to say). */
export function trend(current: number, previous: number): Trend | null {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) return { label: "New", isPositive: true };
  const pct = ((current - previous) / previous) * 100;
  return { label: `${Math.abs(pct).toFixed(1)}%`, isPositive: pct >= 0 };
}

export const compactCount = (n: number): string => (n >= 10_000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-NG"));

export const TIMEFRAMES = [
  { label: "last 7 days", value: "7" },
  { label: "last 30 days", value: "30" },
  { label: "last 90 days", value: "90" },
];
