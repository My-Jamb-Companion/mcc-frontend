"use client";

import Link from "next/link";
import { useTeacherCourses } from "@/src/features/messages/useMessages";

export const CourseCommunityList = () => {
  const { data: courses, isLoading, isError } = useTeacherCourses();
  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Community</h1>
      <p className="mb-6 text-sm text-muted">Choose a course to see its discussion.</p>
      {isLoading && <p className="text-sm text-muted">Loading your courses…</p>}
      {isError && <p className="text-sm text-danger">Couldn&apos;t load your courses.</p>}
      {courses && courses.length === 0 && <p className="text-sm text-muted">You don&apos;t own any courses yet.</p>}
      <ul className="space-y-2">
        {courses?.map((course) => (
          <li key={course.course_id}>
            <Link href={`/community/${course.course_id}`} className="block rounded-lg border border-muted/20 px-4 py-3 transition-colors hover:border-primary/40">
              {course.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
