"use client";

import {useSyncExternalStore} from "react";

/**
 * Phones and tablets: a narrow window, or a device whose main pointer is a finger. An iPad Pro 13 in portrait
 * is 1032px wide, wider than the usual "tablet" breakpoint, so width alone would leave it with the desktop layout.
 */
export const SWIPE_QUERY = "(max-width: 1023px), (pointer: coarse)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(SWIPE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const snapshot = () => window.matchMedia(SWIPE_QUERY).matches;

/** True on touch devices and narrow screens, where a text lesson is swiped through instead of paged with buttons. */
export function useSwipeMode(): boolean {
  // The server can't know the device, so it renders the desktop layout and the client switches on hydration.
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
