import type {ApiEnrollmentItem} from "./services/analytics.service";

export interface Change {
  /** "+3", "-2" or "no change". */
  label: string;
  direction: "up" | "down" | "same";
}

/** How this period's new enrollments compare with the equal period before it. */
export function change(current: number, previous: number): Change {
  const difference = current - previous;
  if (difference === 0) return {label: "no change", direction: "same"};
  return {label: `${difference > 0 ? "+" : ""}${difference}`, direction: difference > 0 ? "up" : "down"};
}

/** The rows whose name contains what was typed, ignoring case. */
export function matching(items: ApiEnrollmentItem[], query: string): ApiEnrollmentItem[] {
  const needle = query.trim().toLowerCase();
  return needle ? items.filter((item) => item.title.toLowerCase().includes(needle)) : items;
}
