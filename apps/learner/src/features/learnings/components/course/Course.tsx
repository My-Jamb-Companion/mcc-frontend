"use client";
import {courseDetails} from "@/src/features/constants/demoCourses";
import {useParams} from "next/navigation";
import {useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import BuyCourse from "./BuyCourse";
import CourseContent from "./CourseContent";

/**
 * Real course_id from the dashboard's course cards never matched anything in
 * the demo-only `courseDetails` array this used to look up by `slug`, so
 * every real course landed here and silently rendered nothing (the lookup
 * returned undefined, and both branches below used to just `return null`).
 * The not-yet-enrolled path (BuyCourse) is now wired to the real catalogue;
 * the full lesson-player experience (CourseContent) still isn't -- it needs
 * real curriculum/practice/exam content the backend doesn't expose yet -- so
 * an enrolled real course falls back to a clear message instead of a blank
 * screen or a demo lookup that would also fail.
 */
export default function Course() {
  const {id} = useParams<{id: string}>();
  const {courses, isLoading: coursesLoading} = useCourses();
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();

  if (!id) return null;

  if (coursesLoading || enrolledLoading) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted">Loading course…</p>
    );
  }

  const isEnrolled = enrolledCourses.some((c) => c.course_id === id);

  if (isEnrolled) {
    const demoCourse = courseDetails.find((c) => c.slug === id);
    if (demoCourse) return <CourseContent course={demoCourse} />;
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-lg font-semibold">You&apos;re enrolled in this course.</p>
        <p className="mt-2 text-sm text-muted">
          The full lesson view is still being finished — check back soon.
        </p>
      </div>
    );
  }

  const course = courses.find((c) => c.course_id === id);
  if (!course) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-lg font-semibold">Course not found</p>
        <p className="mt-2 text-sm text-muted">
          This course may have been unpublished, or the link is incorrect.
        </p>
      </div>
    );
  }

  return <BuyCourse course={course} />;
}
