/** "12:05" -- minutes and seconds left, never negative. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** The last minute is shown as urgent. */
export const isCountdownLow = (remainingSeconds: number): boolean => remainingSeconds <= 60;

/** Seconds left until `deadlineMs` as of `nowMs`, never negative. */
export function secondsLeft(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

/** "20 min", "1 hr 30 min", "1 hr" -- how long a timed quiz allows. */
export function describeDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}
