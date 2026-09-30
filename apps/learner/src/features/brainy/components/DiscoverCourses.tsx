"use client";

import Link from "next/link";
import {Icon} from "@mcc/ui";
import {useDiscoverContent} from "../hooks/useDiscover";

/** GET /brainy/discover -- a published-catalogue sample, no embedding
 * involved (unlike GET /brainy/recommendations/courses, which is a
 * search-query-scoped embedding lookup this component doesn't use). */
export default function DiscoverCourses() {
  const {courses, isLoading} = useDiscoverContent();

  if (isLoading || courses.length === 0) return null;

  return (
    <div className="w-full">
      <p className="mb-3 font-semibold text-lg">Discover something new</p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide" style={{scrollbarWidth: "none"}}>
        {courses.map((course) => (
          <Link
            key={course.course_id}
            href={`/learnings/course/${course.course_id}`}
            className="flex w-64 shrink-0 flex-col gap-2 rounded-2xl border border-muted/20 p-4 transition-colors hover:bg-muted/5"
          >
            <div className="flex items-center gap-2">
              <Icon icon="mingcute:ai-fill" size={14} className="text-primary" />
              <span className="text-xs font-medium text-primary">Suggested for you</span>
            </div>
            <p className="text-sm font-semibold">{course.title}</p>
            {course.description && (
              <p className="line-clamp-2 text-xs text-muted">{course.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
