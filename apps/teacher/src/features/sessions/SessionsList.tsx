"use client";

import { useUpcomingSessions } from "./useSessions";
import { Button } from "@mcc/ui";

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const SessionsList = () => {
  const { data: sessions, isLoading, isError } = useUpcomingSessions();

  if (isLoading) {
    return <p className="text-sm text-muted">Loading your sessions…</p>;
  }

  if (isError) {
    return <p className="text-sm text-danger">Couldn&apos;t load your sessions. Try again shortly.</p>;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <p className="text-sm text-muted">
        No upcoming sessions yet. 1:1 sessions appear here once a student is matched to
        you; cohort classes appear once an admin schedules one with you as the teacher.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => (
        <li
          key={session.session_id}
          className="flex items-center justify-between rounded-lg border border-muted/20 p-4"
        >
          <div>
            <p className="font-medium">{session.title}</p>
            <p className="text-sm text-muted">{formatWhen(session.scheduled_at)}</p>
            <span className="inline-block mt-1 text-xs rounded-full px-2 py-0.5 bg-muted/10 text-muted">
              {session.student_id ? "1:1 session" : "Cohort class"}
            </span>
          </div>
          {session.meeting_url && (
            <Button size="sm" width="fit" onClick={() => window.open(session.meeting_url!, "_blank")}>
              Join
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
