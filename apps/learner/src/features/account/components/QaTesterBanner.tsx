"use client";

import {Icon} from "@mcc/ui";
import {useIsQaTester} from "../hooks/useProfile";

/** A thin strip on every learner page for QA tester accounts, so nobody mistakes a test session for real learning. */
export function QaTesterBanner() {
  const isTester = useIsQaTester();
  if (!isTester) return null;
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-violet-600 px-4 py-1.5 text-center text-xs font-medium text-white"
    >
      <Icon icon="ri:test-tube-line" size={14} />
      <span>QA tester account: everything is free, and nothing here earns points or counts in company numbers.</span>
    </div>
  );
}
