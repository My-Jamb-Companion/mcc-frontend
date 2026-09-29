"use client";

import {useAssignmentForTarget} from "../hooks/useAssignment";
import {SlotPicker} from "./SlotPicker";
import {AssignmentStatusCard} from "./AssignmentStatusCard";

interface BookingSectionProps {
  purpose: "course" | "exam";
  targetId: string;
}

/**
 * The flow diagram's "Slot selection" -> "CRA assignment" -> "onboarding
 * session" -> "Teacher auto-assignment" steps, surfaced on the content
 * page for whatever the student just gained access to. Renders nothing
 * once the assignment reaches `active` -- apps/learner/src/features/
 * sessions (already wired) takes over from there -- and nothing while
 * the very first status fetch is still in flight, to avoid a flash of
 * the booking prompt for students who already have an active assignment.
 */
export function BookingSection({purpose, targetId}: BookingSectionProps) {
  const {assignment, isLoading} = useAssignmentForTarget(purpose, targetId);

  if (isLoading) return null;
  if (assignment?.status === "active") return null;

  return (
    <div className="px-4 pb-6">
      {assignment ? (
        <AssignmentStatusCard assignment={assignment} />
      ) : (
        <SlotPicker purpose={purpose} targetId={targetId} />
      )}
    </div>
  );
}
