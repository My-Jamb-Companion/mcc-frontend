/**
 * Buckets a date into one of: "Today", "Yesterday", "This week", "Older".
 * "This week" covers the 5 days before yesterday (so the full rolling
 * 7-day window is Today/Yesterday/This week combined) — anything beyond
 * that falls to "Older".
 */
export type DateBucket = "Today" | "Yesterday" | "This week" | "Older";

export const DATE_BUCKET_ORDER: DateBucket[] = [
  "Today",
  "Yesterday",
  "This week",
  "Older",
];

export function getDateBucket(date: Date | string | number): DateBucket {
  const target = new Date(date);
  const now = new Date();

  // Normalize both to midnight so we're diffing whole calendar days,
  // not 24-hour windows (which would misclassify "yesterday at 11pm"
  // when checked at "today at 9am").
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const targetDay = startOfDay(target);
  const todayDay = startOfDay(now);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.round(
    (todayDay.getTime() - targetDay.getTime()) / msPerDay,
  );

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 6) return "This week";
  return "Older";
}

/**
 * Groups items into date buckets, preserving DATE_BUCKET_ORDER and
 * sorting items within each bucket newest-first.
 */
export function groupByDateBucket<T>(
  items: T[],
  getDate: (item: T) => Date | string | number,
): Array<{bucket: DateBucket; items: T[]}> {
  const buckets = new Map<DateBucket, T[]>();

  for (const item of items) {
    const bucket = getDateBucket(getDate(item));
    const existing = buckets.get(bucket) ?? [];
    existing.push(item);
    buckets.set(bucket, existing);
  }

  for (const [, list] of buckets) {
    list.sort(
      (a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime(),
    );
  }

  return DATE_BUCKET_ORDER.filter((b) => buckets.has(b)).map((bucket) => ({
    bucket,
    items: buckets.get(bucket)!,
  }));
}
