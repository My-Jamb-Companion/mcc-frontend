"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Which of `count` text panels is being read, for a sticky picture that changes with it (Brainy, Progress).
 * Wide: the panel closest to the middle of the screen. Compact (the picture sits above the text): how far down the visitor
 * has scrolled past the picture. A pick (a click on a panel or tab) holds for `holdMs` so a scroll doesn't undo it at once.
 */
export function useScrollPanels(count: number, compact: boolean, holdMs = 6000) {
  const stage = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const holdUntil = useRef(0);
  const [active, setActive] = useState(0);

  const follow = useCallback(() => {
    if (Date.now() < holdUntil.current) return;
    const vh = window.innerHeight || 800;
    let best = 0;
    if (compact) {
      const el = stage.current;
      if (!el) return;
      const progress = (vh * 0.85 - el.getBoundingClientRect().top) / (vh * 0.85);
      best = Math.max(0, Math.min(count - 1, Math.floor(progress * count)));
    } else {
      let distance = Infinity;
      panelRefs.current.forEach((el, k) => {
        if (!el || k >= count) return;
        const box = el.getBoundingClientRect();
        const d = Math.abs((box.top + box.bottom) / 2 - vh * 0.5);
        if (d < distance) { distance = d; best = k; }
      });
    }
    setActive((current) => (current === best ? current : best));
  }, [compact, count]);

  useEffect(() => {
    follow();
    window.addEventListener("scroll", follow, { passive: true });
    const timer = setInterval(follow, 350);
    return () => { window.removeEventListener("scroll", follow); clearInterval(timer); };
  }, [follow]);

  const pick = useCallback((k: number) => { holdUntil.current = Date.now() + holdMs; setActive(k); }, [holdMs]);
  return { active: Math.min(active, Math.max(count - 1, 0)), pick, stage, panelRefs };
}
