"use client";

import Link from "next/link";
import { useTeacherCourses } from "@/src/features/messages/useMessages";

export default function MessagesCoursesPage() {
  const { data: courses, isLoading, isError } = useTeacherCourses();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Messages</h1>
      <p className="text-sm text-muted mb-6">Choose a course to see its student threads.</p>

      {isLoading && <p className="text-sm text-muted">Loading your courses…</p>}
      {isError && <p className="text-sm text-danger">Couldn&apos;t load your courses.</p>}
      {courses && courses.length === 0 && (
        <p className="text-sm text-muted">You don&apos;t own any courses yet.</p>
      )}

      <ul className="space-y-2">
        {courses?.map((course) => (
          <li key={course.course_id}>
            <Link
              href={`/messages/${course.course_id}`}
              className="block rounded-lg border border-muted/20 px-4 py-3 hover:border-primary/40 transition-colors"
            >
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
