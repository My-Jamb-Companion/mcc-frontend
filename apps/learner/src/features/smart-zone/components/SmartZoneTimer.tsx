"use client";
import {formatCountdown} from "@/src/features/learnings/helper/countdown";
import {useTimerSounds} from "../hooks/useTimerSounds";
import {timeFraction, timerAnnouncement, timerMood, type TimerMood} from "../timerCues";

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MOOD: Record<TimerMood, string> = {
  calm: "text-primary",
  hurry: "text-amber-500",
  urgent: "text-red-500 motion-safe:animate-pulse",
};

/**
 * The Smart Zone's countdown: a ring that drains, the time in minutes and seconds, a tick in the last ten
 * seconds and an alarm at zero. Calm at first, amber in the last quarter, red in the last ten seconds.
 */
export default function SmartZoneTimer({remaining, totalSeconds}: {remaining: number; totalSeconds: number}) {
  useTimerSounds(remaining, totalSeconds);
  const mood = timerMood(remaining, totalSeconds);
  const offset = CIRCUMFERENCE * (1 - timeFraction(remaining, totalSeconds));
  const spoken = timerAnnouncement(remaining, totalSeconds);

  return (
    <div
      role="timer"
      aria-label="Time left"
      className={`flex shrink-0 items-center gap-2 rounded-full bg-white py-1 pl-1.5 pr-3 shadow-sm dark:bg-neutral-900 ${MOOD[mood]}`}
    >
      <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true" className="-rotate-90">
        <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="4" />
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{transition: "stroke-dashoffset 0.5s linear"}}
        />
      </svg>
      <span className="text-sm font-bold tabular-nums">{formatCountdown(remaining)}</span>
      <span className="sr-only" role="status" aria-live="assertive">
        {spoken}
      </span>
    </div>
  );
}
