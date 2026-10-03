export interface ListableSet {
  title: string;
  subject: string | null;
  created_at: string;
  due_count: number;
}

export type SortMode = "newest" | "az" | "due";

/** Matches the title or subject, ignoring case and surrounding spaces. */
export function filterSets<T extends ListableSet>(sets: T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return sets;
  return sets.filter((s) => `${s.title} ${s.subject ?? ""}`.toLowerCase().includes(needle));
}

export function sortSets<T extends ListableSet>(sets: T[], mode: SortMode): T[] {
  const copy = [...sets];
  if (mode === "az") return copy.sort((a, b) => a.title.localeCompare(b.title, undefined, {sensitivity: "base"}));
  if (mode === "due") {
    // Most to review first; ties keep newest-first.
    return copy.sort(
      (a, b) => b.due_count - a.due_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
  return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/** "Not studied yet", "Studied today", "Studied yesterday", "Studied 5 days ago", then a date. */
export function studiedLabel(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return "Not studied yet";
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((day(now) - day(new Date(iso))) / 86_400_000);
  if (days <= 0) return "Studied today";
  if (days === 1) return "Studied yesterday";
  if (days < 30) return `Studied ${days} days ago`;
  return `Studied ${new Date(iso).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}`;
}
