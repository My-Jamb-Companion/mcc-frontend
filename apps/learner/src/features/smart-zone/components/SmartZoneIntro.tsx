"use client";
import {useEffect, useRef} from "react";
import {Icon} from "@mcc/ui";
import {describeDuration} from "@/src/features/learnings/helper/countdown";
import {playSound, unlockAudio} from "../sound/engine";
import KeyCap from "./KeyCap";
import SoundToggle from "./SoundToggle";

interface SmartZoneIntroProps {
  /** What it is about, e.g. the module or topic. */
  subject?: string;
  questionCount: number;
  /** "5 - 10 minutes", shown when there is no countdown. */
  estimate: string;
  timerMinutes?: number | null;
  passingScore?: number | null;
  onStart: () => void;
}

/**
 * "Ready for the Smart Zone?": what it is, how long it gives, and a Start button (or Enter). Starting also wakes the
 * browser's audio, which stays silent until the learner has pressed something.
 */
export default function SmartZoneIntro({subject, questionCount, estimate, timerMinutes, passingScore, onStart}: SmartZoneIntroProps) {
  const start = () => {
    unlockAudio();
    playSound("enter");
    onStart();
  };
  const startNow = useRef(start);
  useEffect(() => {
    startNow.current = start;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      event.preventDefault();
      startNow.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl">
      <div className="relative bg-primary-gradient px-6 py-12 text-center text-white">
        <div className="absolute right-4 top-4">
          <SoundToggle onDark />
        </div>
        <Icon icon="ph:lightning-fill" size={56} className="mx-auto mb-4 opacity-90" />
        <h2 className="font-bagel text-3xl">Ready for the Smart Zone?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm opacity-90">
          {subject ? `Questions on ${subject}. ` : ""}
          Pick your answers fast, keep your streak going and beat the clock.
        </p>
        <p className="mt-5 text-lg font-semibold">
          {questionCount} question{questionCount === 1 ? "" : "s"} <span className="mx-2 opacity-70">•</span>{" "}
          {timerMinutes ? `${describeDuration(timerMinutes)} on the clock` : estimate}
        </p>
        {passingScore !== null && passingScore !== undefined && <p className="mt-2 text-sm opacity-90">Pass mark: {passingScore}%</p>}
        {timerMinutes ? (
          <p className="mx-auto mt-3 max-w-sm text-xs opacity-80">
            The clock ticks in the last 10 seconds and sounds an alarm at zero. Your answers are submitted for you when time runs out.
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 border border-t-0 border-muted/20 bg-muted/5 px-6 py-4">
        <p className="hidden items-center gap-1.5 text-xs text-subtle sm:flex">
          <Icon icon="ph:keyboard" size={14} /> Use A, B, C, D to answer and Enter to continue. Press ? any time for all shortcuts.
        </p>
        <button
          type="button"
          onClick={start}
          className="ml-auto flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Let&apos;s go <KeyCap className="border-white/60 text-white">Enter</KeyCap>
        </button>
      </div>
    </div>
  );
}
