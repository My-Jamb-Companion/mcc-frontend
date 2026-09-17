"use client";

import { Button } from "@mcc/ui";
import { useMarkSessionDelivered, useSessionsAwaitingDelivery } from "./useSessions";

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * Sessions that have started but aren't confirmed. Teachers are paid per
 * session delivered, so confirming each one is what adds it to their earnings.
 */
export const SessionsToConfirm = () => {
  const { data: sessions, isLoading, isError } = useSessionsAwaitingDelivery();
  const markDelivered = useMarkSessionDelivered();

  if (isLoading) return <p className="text-sm text-muted">Loading sessions to confirm…</p>;
  if (isError) return <p className="text-sm text-danger">Couldn&apos;t load sessions to confirm. Try again shortly.</p>;
  if (!sessions || sessions.length === 0) {
    return <p className="text-sm text-muted">Nothing to confirm. Sessions appear here once they&apos;ve started.</p>;
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => {
        const pending = markDelivered.isPending && markDelivered.variables === session.session_id;
        return (
          <li
            key={session.session_id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-muted/20 p-4"
          >
            <div>
              <p className="font-medium">{session.title}</p>
              <p className="text-sm text-muted">{formatWhen(session.scheduled_at)}</p>
              <span className="inline-block mt-1 text-xs rounded-full px-2 py-0.5 bg-muted/10 text-muted">
                {session.student_id ? "1:1 session" : "Cohort class"}
              </span>
            </div>
            <Button
              size="sm"
              width="fit"
              loading={pending}
              disabled={markDelivered.isPending}
              onClick={() => markDelivered.mutate(session.session_id)}
            >
              Mark delivered
            </Button>
          </li>
        );
      })}
    </ul>
  );
};
