"use client";

import {useCallback, useEffect, useRef, useState} from "react";

/**
 * Full screen for a lesson: `focus` says it is on. The caller draws its content over the whole screen while
 * it is (see FullScreenButton for the icon). While on, the page behind stays still and Escape leaves it.
 * Where the browser lets a page hide its own bars (Android Chrome, desktop; not iPhone Safari) it does that too,
 * and leaving that mode with the system gesture leaves full screen as well.
 */
export function useFullScreen() {
  const [focus, setFocus] = useState(false);
  const native = useRef(false);

  const leave = useCallback(() => {
    setFocus(false);
    if (native.current && document.fullscreenElement) {
      native.current = false;
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const enter = useCallback(() => {
    setFocus(true);
    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) {
      root
        .requestFullscreen()
        .then(() => {
          native.current = true;
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!focus) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    const onNativeExit = () => {
      if (!document.fullscreenElement && native.current) {
        native.current = false;
        setFocus(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onNativeExit);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onNativeExit);
    };
  }, [focus, leave]);

  return {focus, enter, leave};
}
