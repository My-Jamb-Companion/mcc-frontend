/** The detail page's period filter, as a number of days for the export endpoint. */
export const EXPORT_PERIODS = [
  {label: "last 7 days", value: "last 7 days", days: 7},
  {label: "last month", value: "last month", days: 30},
  {label: "last 3 months", value: "last 3 months", days: 90},
] as const;

export function exportDaysFor(period: string): number {
  return EXPORT_PERIODS.find((p) => p.value === period)?.days ?? 7;
}

/** True when a CSV has a header row and nothing else. */
export function isHeaderOnlyCsv(csv: string): boolean {
  return csv.split(/\r?\n/).filter((line) => line.trim() !== "").length <= 1;
}

/** `students-<program>-<period>.csv`, safe to use as a file name. */
export function exportFileName(title: string, days: number): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "program";
  return `students-${slug}-last-${days}-days.csv`;
}

/** Saves a blob through a temporary link; the object URL is revoked straight after. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
