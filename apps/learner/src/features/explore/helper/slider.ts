/** A button's link: a path inside the app, or another site (opened in a new tab). */
export const isExternalLink = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Which slide is showing, from how far the track has scrolled. Slides are `pitch` px apart (a slide plus its gap),
 * so the nearest multiple is the slide the reader is on, whether they swiped, dragged or used the arrows.
 */
export const slideAt = (scrollLeft: number, pitch: number, count: number): number => {
  if (count <= 0 || pitch <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round(scrollLeft / pitch)));
};

/** The slide after this one, back to the first at the end (for the automatic advance and the next arrow). */
export const nextSlide = (index: number, count: number): number => (count <= 0 ? 0 : (index + 1) % count);

/** The slide before this one, round to the last from the first. */
export const prevSlide = (index: number, count: number): number => (count <= 0 ? 0 : (index - 1 + count) % count);
