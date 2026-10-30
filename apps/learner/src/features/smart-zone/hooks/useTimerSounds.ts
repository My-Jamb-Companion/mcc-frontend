import {useEffect, useRef} from "react";
import {playSound} from "../sound/engine";
import {buzz} from "../sound/engine";
import {timerCue} from "../timerCues";

/** Plays the clock's sounds as the seconds left change: ticks at the end, a one-minute warning, the alarm at zero. */
export function useTimerSounds(remaining: number | null, totalSeconds: number): void {
  const previous = useRef<number | null>(null);

  useEffect(() => {
    if (remaining === null) {
      previous.current = null;
      return;
    }
    const cue = timerCue(previous.current, remaining, totalSeconds);
    previous.current = remaining;
    if (!cue) return;
    playSound(cue);
    if (cue === "timeup") buzz([120, 60, 220]);
  }, [remaining, totalSeconds]);
}
