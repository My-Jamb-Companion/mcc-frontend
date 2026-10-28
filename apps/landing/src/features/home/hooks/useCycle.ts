"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * A value that steps through 0..count-1 on its own: the animated mockups that swap screens or highlight the next step.
 * - It stands still for people who ask for reduced motion.
 * - With `whenVisible`, it only moves while `ref`'s element is on screen (so nothing runs off-screen).
 * - `pick` jumps to one and pauses the stepping for `holdMs`, so a visitor who clicked is not overruled a second later.
 */
export function useCycle(count: number, intervalMs: number, { holdMs = 8000, whenVisible = false }: { holdMs?: number; whenVisible?: boolean } = {}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const visible = useRef(!whenVisible);
  const holdUntil = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let observer: IntersectionObserver | undefined;
    const element = ref.current;
    if (whenVisible && element && typeof IntersectionObserver !== "undefined") {
      visible.current = false;
      observer = new IntersectionObserver(([entry]) => { visible.current = !!entry?.isIntersecting; }, { threshold: 0.25 });
      observer.observe(element);
    } else {
      visible.current = true;
    }
    const timer = setInterval(() => {
      if (visible.current && Date.now() > holdUntil.current) setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => {
      clearInterval(timer);
      observer?.disconnect();
    };
  }, [count, intervalMs, whenVisible]);

  const pick = useCallback((k: number) => {
    holdUntil.current = Date.now() + holdMs;
    setIndex(k);
  }, [holdMs]);

  return { index, pick, ref };
}
