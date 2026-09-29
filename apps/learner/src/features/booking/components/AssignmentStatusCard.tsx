"use client";

import {Icon} from "@mcc/ui";
import {ApiAssignmentStatus} from "../services/booking.service";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * One line per pre-`active` assignment status -- once an assignment
 * reaches `active`, this renders nothing: apps/learner/src/features/
 * sessions (already wired) takes over showing the recurring weekly
 * series from there.
 */
export function AssignmentStatusCard({assignment}: {assignment: ApiAssignmentStatus}) {
  if (assignment.status === "active") return null;

  if (assignment.status === "onboarding_scheduled") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-muted/20 bg-muted/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Icon icon="lucide:calendar-check" size={20} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground">Your onboarding call is booked</p>
            {assignment.onboarding_scheduled_at && (
              <p className="text-sm text-muted">{formatWhen(assignment.onboarding_scheduled_at)}</p>
            )}
          </div>
        </div>
        {assignment.onboarding_meeting_url && (
          <a
            href={assignment.onboarding_meeting_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Join Zoom call
          </a>
        )}
      </div>
    );
  }

  if (assignment.status === "teacher_escalated") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-muted/20 bg-muted/5 p-4 sm:p-6">
        <Icon icon="lucide:user-search" size={20} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-foreground">Onboarding call complete</p>
          <p className="text-sm text-muted">
            We&apos;re finding you a teacher for your weekly 1:1 sessions -- you&apos;ll be
            notified as soon as you&apos;re matched.
          </p>
        </div>
      </div>
    );
  }

  // pending_cra / cra_escalated -- the request has gone in, a coordinator
  // hasn't taken it yet. Both are transient, no action for the student.
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-muted/20 bg-muted/5 p-4 sm:p-6">
      <Icon icon="lucide:loader-2" size={20} className="mt-0.5 shrink-0 animate-spin text-primary" />
      <div>
        <p className="font-semibold text-foreground">Matching you with a course coordinator</p>
        <p className="text-sm text-muted">
          We&apos;ve got your onboarding request -- this usually only takes a moment.
        </p>
      </div>
    </div>
  );
}
