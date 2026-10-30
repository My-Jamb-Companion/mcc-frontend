import type {SoundName} from "./sound/recipes";

/** The countdown's last stretch: one tick a second, sharper in the final three. */
export const TICK_FROM_SECONDS = 10;
export const URGENT_FROM_SECONDS = 3;
/** The one-minute warning is only worth giving when the countdown is longer than two minutes. */
export const WARN_AT_SECONDS = 60;
const MIN_TOTAL_FOR_WARNING = 120;

/**
 * Which sound, if any, the clock makes as it moves from `previous` to `next` seconds left.
 * Nothing sounds on the first reading, when time is going up (a restart), or when the second has not changed.
 */
export function timerCue(previous: number | null, next: number, totalSeconds: number): SoundName | null {
  if (previous === null || next >= previous) return null;
  if (next <= 0) return previous > 0 ? "timeup" : null;
  if (next <= TICK_FROM_SECONDS) return next <= URGENT_FROM_SECONDS ? "tickLast" : "tick";
  if (totalSeconds > MIN_TOTAL_FOR_WARNING && next === WARN_AT_SECONDS) return "warning";
  return null;
}

/** What a screen reader should hear as the clock runs down, or null between milestones. */
export function timerAnnouncement(next: number, totalSeconds: number): string | null {
  if (next === 0) return "Time is up.";
  if (next === 10) return "10 seconds left.";
  if (next === 30 && totalSeconds > 90) return "30 seconds left.";
  if (next === 60 && totalSeconds > 120) return "One minute left.";
  return null;
}

/** 0 to 1: how much of the countdown is left, for the ring. */
export function timeFraction(remaining: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / totalSeconds));
}

export type TimerMood = "calm" | "hurry" | "urgent";

/** How the timer looks: calm for most of it, amber in the last quarter, red in the last ten seconds. */
export function timerMood(remaining: number, totalSeconds: number): TimerMood {
  if (remaining <= TICK_FROM_SECONDS) return "urgent";
  if (timeFraction(remaining, totalSeconds) <= 0.25) return "hurry";
  return "calm";
}
