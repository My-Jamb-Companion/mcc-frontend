"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {ReactNode} from "react";
import {AREA_LABELS, areaForPath, canManage, canOpen, firstAllowedHref, MyAccess} from "../helper/access";
import {useMyAccess} from "../hooks/useAdminAccess";

/** Pages worth sending an admin to, in order, when the one they asked for is not theirs. */
export const LANDING_CANDIDATES = [
  "/dashboard/courses",
  "/dashboard/exam-program",
  "/dashboard/question-bank",
  "/dashboard/landing",
  "/dashboard/students/active-students",
  "/dashboard/teachers",
  "/dashboard/cra",
  "/dashboard/live-sessions",
  "/messaging",
  "/moderation",
  "/dashboard/gamification",
  "/finance",
  "/users",
  "/dashboard/performance",
  "/dashboard/ai-studio",
  "/settings",
];

function Panel({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="mt-2 text-sm text-slate-500">{children}</div>
    </div>
  );
}

/**
 * Wraps every console page: a page outside the admin's access shows a clear
 * message instead of a screen of failed requests, and a view-only page says so.
 * The server enforces all of this regardless; this is the explanation.
 */
export default function AccessGate({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const {data: access} = useMyAccess();
  const area = areaForPath(pathname);
  const next = firstAllowedHref(access as MyAccess | undefined, LANDING_CANDIDATES);

  const goTo = next ? (
    <p className="mt-4">
      <Link href={next} className="font-semibold text-violet-600 hover:underline">
        Go to a page you can use
      </Link>
    </p>
  ) : null;

  if (!canOpen(access, pathname)) {
    return (
      <Panel title="You don't have access to this page">
        <p>Your account can&apos;t open {area ? AREA_LABELS[area] ?? "this page" : "this page"}. Ask a super admin if you need it.</p>
        {goTo}
      </Panel>
    );
  }

  // The home page: admins without analytics access get a welcome instead of a wall of failed charts.
  if (pathname === "/dashboard" && access && !access.is_super && access.permissions.analytics === "none") {
    return (
      <Panel title="Welcome">
        <p>You&apos;re signed in as {access.preset_label.toLowerCase()}. Use the menu on the left to open the areas you can work in.</p>
        {goTo}
      </Panel>
    );
  }

  const viewOnly = access && area && !access.is_super && !canManage(access, area);
  return (
    <>
      {viewOnly && (
        <p role="status" className="mb-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          You have view-only access to {AREA_LABELS[area!] ?? "this area"}. You can look around but can&apos;t make changes.
        </p>
      )}
      {children}
    </>
  );
}
