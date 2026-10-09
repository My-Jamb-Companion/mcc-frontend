"use client";

import {useState} from "react";
import {Icon} from "@mcc/ui";
import {AssignmentThread} from "@mcc/features";

/** "Message your coordinator" -- collapsed until asked for, so it doesn't crowd the booking card. */
export function CoordinatorMessages({assignmentId}: {assignmentId: string}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 rounded-2xl border border-muted/20 bg-background p-4 sm:p-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <Icon icon="lucide:message-circle" size={18} className="text-primary" />
          Message your coordinator
        </span>
        <Icon icon={open ? "lucide:chevron-up" : "lucide:chevron-down"} size={18} className="text-muted" />
      </button>
      {open && (
        <div className="mt-4">
          <AssignmentThread assignmentId={assignmentId} self="student" otherLabel="Your coordinator" />
        </div>
      )}
    </div>
  );
}
