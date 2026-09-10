"use client";

import { useEffect } from "react";
import { getPendingCourseFromStorage, useCourseStore } from "@mcc/store";

/**
 * useCourseStore's pendingCourse only lives in memory once set -- it does
 * not read localStorage on its own (see packages/store/src/course-store.ts).
 * A real enrolment round trip here means: set it on the catalogue page,
 * leave the site entirely to check email, then land back via a fresh page
 * load (the email-verification redirect, or just closing and reopening the
 * tab) days later -- a fresh JS context with the in-memory store reset to
 * null every time, even though localStorage still has it. Call this once,
 * high in the tree, so every page sees a store that actually reflects what
 * was set, not just what happened to survive this particular page load.
 */
export const useHydratePendingCourse = () => {
  const pendingCourse = useCourseStore((s) => s.pendingCourse);
  const setPendingCourse = useCourseStore((s) => s.setPendingCourse);

  useEffect(() => {
    if (pendingCourse) return;
    const stored = getPendingCourseFromStorage();
    if (stored) setPendingCourse(stored);
    // Intentionally once on mount only -- setPendingCourse's own callers
    // are the source of truth for updates after this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
