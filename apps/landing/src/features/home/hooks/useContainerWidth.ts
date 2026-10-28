"use client";

import { useEffect, useState } from "react";

/** Whether an element is narrower than `breakpoint` px, kept up to date as it resizes (false until measured). */
export function useNarrow(element: Element | null, breakpoint: number): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") return;
    const measure = () => setNarrow(element.getBoundingClientRect().width < breakpoint);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, breakpoint]);
  return narrow;
}
