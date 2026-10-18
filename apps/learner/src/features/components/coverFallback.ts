import type {SyntheticEvent} from "react";

export const FALLBACK_COVER = "/assets/images/tower.jpg";

/** A cover that fails to load (a missing file, or the storage host being down) shows the default picture, not a broken-image icon. */
export function coverFallback(event: SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (img.src.endsWith(FALLBACK_COVER)) return; // the fallback itself failed; stop here
  img.src = FALLBACK_COVER;
}
