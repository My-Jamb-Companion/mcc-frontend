"use client";

import { useState } from "react";
import { Button } from "@mcc/ui";
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
          <li
            key={item.assignment_id}
            className="flex flex-col gap-3 rounded-lg border border-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
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
            <Button width="fit" size="sm" onClick={() => setCompleting(item)}>
              Complete onboarding
            </Button>
          </li>
        ))}
      </ul>

      <CompleteOnboardingModal item={completing} onClose={() => setCompleting(null)} />
    </>
  );
};
