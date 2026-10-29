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

/**
 * The copies to delete among pictures that look identical (same file name and size): in each such group one is kept,
 * an image a lesson uses if there is one, otherwise the newest (the list is newest first). Images in use are never
 * offered for deletion. Only the images given are looked at.
 */
export function duplicatesToRemove(images: LibraryImage[]): string[] {
  const groups = new Map<string, LibraryImage[]>();
  for (const image of images) {
    const key = `${image.name}|${image.size_bytes}`;
    groups.set(key, [...(groups.get(key) ?? []), image]);
  }
  const remove: string[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const keeper = group.find((i) => i.used_in > 0) ?? group[0];
    for (const image of group) if (image !== keeper && image.used_in === 0) remove.push(image.url);
  }
  return remove;
}

/** "Deleted 3 images." / "Deleted 2 images. 1 is still used in lessons, so it was kept." */
export function deleteMessage(deleted: number, skipped: number): string {
  const images = (n: number) => `${n} ${n === 1 ? "image" : "images"}`;
  const kept = skipped ? ` ${skipped} ${skipped === 1 ? "is" : "are"} still used in lessons, so ${skipped === 1 ? "it was" : "they were"} kept.` : "";
  return deleted ? `Deleted ${images(deleted)}.${kept}` : `Nothing deleted.${kept}`;
}
