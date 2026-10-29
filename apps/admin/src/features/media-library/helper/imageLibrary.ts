import type {ImageLibraryPage, LibraryImage} from "../services/imageLibrary.service";

/** "2.0 MB", "340 KB", "12 B". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** "29 Oct 2026", or "" for a date that can't be read. */
export function formatUploaded(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"});
}

/** The images of every page loaded so far, in order, each once. */
export function allImages(pages: ImageLibraryPage[]): LibraryImage[] {
  const seen = new Set<string>();
  return pages.flatMap((p) => p.items).filter((i) => (seen.has(i.url) ? false : (seen.add(i.url), true)));
}

/** The offset of the next page to ask for, or undefined when everything matching has been loaded. */
export function nextOffset(pages: ImageLibraryPage[]): number | undefined {
  const last = pages[pages.length - 1];
  if (!last) return undefined;
  const next = last.offset + last.items.length;
  return last.items.length > 0 && next < last.total ? next : undefined;
}
