/** Where a navigation key should take a pager of `pages` pages currently on `page`; null when the key isn't one. */
export function targetPage(key: string, page: number, pages: number): number | null {
  const last = Math.max(pages - 1, 0);
  switch (key) {
    case "ArrowDown":
    case "PageDown":
      return Math.min(page + 1, last);
    case "ArrowUp":
    case "PageUp":
      return Math.max(page - 1, 0);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return null;
  }
}

/** How far through the lesson a reader is, for the bar: the page they are on out of the lesson's sections. */
export function lessonProgress(page: number, sections: number): number {
  if (sections <= 0) return 0;
  return Math.min(((page + 1) / sections) * 100, 100);
}
