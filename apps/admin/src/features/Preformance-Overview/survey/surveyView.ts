export interface Band {
  value: string;
  label: string;
}

/** The score band a mean rank (1 = lowest) falls nearest to, as its label. */
export function bandLabel(mean: number | null | undefined, bands: Band[]): string {
  if (mean == null || bands.length === 0) return "—";
  const index = Math.min(bands.length, Math.max(1, Math.round(mean))) - 1;
  return bands[index].label;
}

/** "+1.2" / "-0.4" / "0": a change with its direction, for the tables. */
export function signed(value: number | null | undefined, digits = 1): string {
  if (value == null) return "—";
  const rounded = Number(value.toFixed(digits));
  if (rounded === 0) return "0";
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

/** Tailwind classes for a change: green up, red down, grey flat. */
export function changeStyle(value: number | null | undefined): string {
  if (value == null || Math.abs(value) < 0.05) return "bg-slate-100 text-slate-500";
  return value > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600";
}

/** Width of a bar as a percentage of the largest value, never below a sliver for a non-zero value. */
export function barWidth(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(2, Math.round((value / max) * 100));
}

/** "12 Mar 2026" for an ISO date, or "—". */
export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
}
