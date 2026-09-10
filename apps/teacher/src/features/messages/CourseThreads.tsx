"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useThreads } from "./useMessages";

const formatWhen = (iso: string) => new Date(iso).toLocaleString();

export const CourseThreads = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: threads, isLoading, isError } = useThreads(courseId);

  return (
    <div>
      <Link href="/messages" className="text-sm text-muted hover:text-primary">
        ← All courses
      </Link>
      <h1 className="text-xl font-semibold mt-2 mb-6">Student threads</h1>

      {isLoading && <p className="text-sm text-muted">Loading threads…</p>}
      {isError && <p className="text-sm text-danger">Couldn&apos;t load threads.</p>}
      {threads && threads.length === 0 && (
        <p className="text-sm text-muted">No questions from students on this course yet.</p>
      )}

      <ul className="space-y-2">
        {threads?.map((thread) => (
          <li key={thread.student_id}>
            <Link
              href={`/messages/${courseId}/${thread.student_id}`}
              className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3 hover:border-primary/40 transition-colors"
            >
              <div>
                <p className="font-medium">{thread.student_name || thread.student_id}</p>
                <p className="text-sm text-muted line-clamp-1">{thread.last_message}</p>
                <p className="text-xs text-muted">{formatWhen(thread.last_message_at)}</p>
              </div>
              {thread.unread_count > 0 && (
                <span className="rounded-full bg-primary text-white text-xs px-2 py-0.5">
                  {thread.unread_count}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
