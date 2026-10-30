import {useEffect, useRef} from "react";
import {interpretZoneKey, type ZoneAction} from "../keys";

/**
 * Listens for the Smart Zone's keys while the player is on screen and hands each one to `onAction`.
 * A key it takes is stopped from also doing its usual job (Enter on a focused button would otherwise press it twice).
 */
export function useSmartZoneKeys(
  onAction: (action: ZoneAction) => void,
  state: {optionCount: number; helpOpen: boolean; enabled?: boolean},
): void {
  const handler = useRef(onAction);
  const latest = useRef(state);
  useEffect(() => {
    handler.current = onAction;
    latest.current = state;
  });

  const enabled = state.enabled ?? true;
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const action = interpretZoneKey(event, latest.current);
      if (!action) return;
      event.preventDefault();
      handler.current(action);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
