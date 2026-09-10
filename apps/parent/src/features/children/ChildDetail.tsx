"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useChildDetail } from "./useChildren";

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

export const ChildDetail = () => {
  const { childId } = useParams<{ childId: string }>();
  const { data: child, isLoading, isError } = useChildDetail(childId);

  return (
    <div>
      <Link href="/children" className="text-sm text-muted hover:text-primary">
        ← My children
      </Link>

      {isLoading && <p className="text-sm text-muted mt-4">Loading…</p>}
      {isError && <p className="text-sm text-danger mt-4">Couldn&apos;t load this child&apos;s details.</p>}

      {child && (
        <div className="mt-2 space-y-8">
          <div>
            <h1 className="text-xl font-semibold">{child.full_name || child.email}</h1>
            <p className="text-sm text-muted">{child.email}</p>
          </div>

          {!child.has_active_enrollment ? (
            <p className="text-sm text-muted rounded-lg border border-muted/20 p-4">
              {`${child.full_name || "Your child"} hasn't enrolled in a course or exam-prep program yet — progress and sessions will show up here once they do.`}
            </p>
          ) : (
            <>
              <section>
                <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
                  Program performance
                </h2>
                {child.program_performance.length === 0 ? (
                  <p className="text-sm text-muted">No activity recorded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {child.program_performance.map((program) => (
                      <li
                        key={program.program_id}
                        className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{program.program_name}</p>
                          <p className="text-xs text-muted capitalize">{program.level}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p>{program.average_performance}% avg</p>
                          <p className="text-muted">{program.total_points} pts</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
                  Upcoming sessions
                </h2>
                {child.upcoming_sessions.length === 0 ? (
                  <p className="text-sm text-muted">Nothing scheduled right now.</p>
                ) : (
                  <ul className="space-y-2">
                    {child.upcoming_sessions.map((session) => (
                      <li
                        key={session.session_id}
                        className="rounded-lg border border-muted/20 px-4 py-3"
                      >
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted">{formatWhen(session.scheduled_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
                  Teachers
                </h2>
                {child.program_teachers.length === 0 ? (
                  <p className="text-sm text-muted">No teacher assigned yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {child.program_teachers.map((teacher) => (
                      <li
                        key={teacher.teacher_id}
                        className="rounded-lg border border-muted/20 px-4 py-3"
                      >
                        <p className="font-medium">{teacher.teacher_name}</p>
                        <p className="text-sm text-muted">{teacher.subject}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
};
