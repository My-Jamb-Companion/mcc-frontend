import {useEffect, useRef, useState} from "react";
import {secondsLeft} from "../helper/countdown";

/**
 * Counts down `minutes` from the moment `running` becomes true and calls
 * `onExpire` once at zero. Returns the seconds left, or null when untimed.
 * The deadline is a wall-clock time, so a throttled background tab can't make
 * the clock drift. Stops (without expiring) when `running` goes false.
 */
export function useCountdown(
  minutes: number | null | undefined,
  running: boolean,
  onExpire: () => void,
  /** Change this to start the clock again (e.g. on "Try again"). */
  attempt = 0,
): number | null {
  const total = minutes && minutes > 0 ? minutes * 60 : null;
  const [remaining, setRemaining] = useState<number | null>(total);
  const deadline = useRef<number | null>(null);
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    deadline.current = null;
    expired.current = false;
    setRemaining(total);
  }, [attempt, total]);

  useEffect(() => {
    if (total === null || !running) return;
    deadline.current ??= Date.now() + total * 1000;
    const tick = () => {
      const left = secondsLeft(deadline.current as number, Date.now());
      setRemaining(left);
      if (left === 0 && !expired.current) {
        expired.current = true;
        onExpireRef.current();
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [total, running, attempt]);

  return total === null ? null : remaining;
}
