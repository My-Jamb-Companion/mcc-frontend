"use client";

import { useState } from "react";
import { Button } from "@mcc/ui";
import { AssignmentThread } from "@mcc/features";
import { QueueItem } from "./queue.service";
import { useQueue } from "./useQueue";
import { CompleteOnboardingModal } from "./CompleteOnboardingModal";

function formatScheduledAt(iso: string | null): string {
  if (!iso) return "No call time recorded";
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const QueueList = () => {
  const { data: queue, isLoading } = useQueue();
  const [completing, setCompleting] = useState<QueueItem | null>(null);
  const [messaging, setMessaging] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-muted">Loading your queue…</p>;
  }

  if (!queue || queue.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nothing waiting right now. New onboarding calls land here once a student books a
        slot and gets matched to you.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {queue.map((item) => (
          <li key={item.assignment_id} className="rounded-lg border border-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{item.student_name ?? item.student_email}</p>
                <p className="text-sm text-muted">
                  {item.subject_name ?? item.purpose} · {formatScheduledAt(item.onboarding_scheduled_at)}
                </p>
                {item.onboarding_meeting_url && (
                  <a
                    href={item.onboarding_meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline"
                  >
                    Join Zoom call
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  width="fit"
                  size="sm"
                  aria-expanded={messaging === item.assignment_id}
                  onClick={() => setMessaging(messaging === item.assignment_id ? null : item.assignment_id)}
                >
                  {messaging === item.assignment_id ? "Hide messages" : "Messages"}
                </Button>
                <Button width="fit" size="sm" onClick={() => setCompleting(item)}>
                  Complete onboarding
                </Button>
              </div>
            </div>
            {messaging === item.assignment_id && (
              <div className="mt-4 border-t border-muted/20 pt-4">
                <AssignmentThread
                  assignmentId={item.assignment_id}
                  self="cra"
                  otherLabel={item.student_name ?? "Student"}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <CompleteOnboardingModal item={completing} onClose={() => setCompleting(null)} />
    </>
  );
};
