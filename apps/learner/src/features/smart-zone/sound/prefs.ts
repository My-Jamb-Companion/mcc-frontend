import {useSyncExternalStore} from "react";

const KEY = "smartzone:sound";
const listeners = new Set<() => void>();
// Where the choice is kept when storage is blocked (private windows): it then lasts until the page is closed.
let memory: boolean | null = null;

/** Sound is on until the learner turns it off; the choice is remembered on this device. */
export function soundEnabledNow(): boolean {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored !== null) return stored !== "off";
  } catch {
    // fall through to the in-memory choice
  }
  return memory ?? true;
}

export function setSoundEnabled(enabled: boolean): void {
  memory = enabled;
  try {
    window.localStorage.setItem(KEY, enabled ? "on" : "off");
  } catch {
    // kept in memory only
  }
  listeners.forEach((notify) => notify());
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
};

/** Whether sound is on, re-rendering when it is switched (here or in another tab). */
export function useSoundEnabled(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, soundEnabledNow, () => true);
  return [enabled, setSoundEnabled];
}
