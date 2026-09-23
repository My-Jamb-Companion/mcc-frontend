"use client";
import {useParams} from "next/navigation";
import {useCourseContent, useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {groupContentRows} from "@/src/features/learnings/helper/content.mapper";
import BuyCourse from "./BuyCourse";
import CourseContent from "./CourseContent";

/**
 * Real course_id from the dashboard's course cards never matched anything in
 * the demo-only `courseDetails` array this used to look up by `slug`, so
 * every real course landed here and silently rendered nothing. Both the
 * not-yet-enrolled path (BuyCourse) and the enrolled lesson-player path
 * (CourseContent) are now wired to the real catalogue/content/enrollment
 * APIs instead.
 */
export default function Course() {
  const {id} = useParams<{id: string}>();
  const {courses, isLoading: coursesLoading} = useCourses();
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();
  const enrolledCourse = enrolledCourses.find((c) => c.course_id === id) ?? null;
  const content = useCourseContent(enrolledCourse ? id : undefined);

  if (!id) return null;

  if (coursesLoading || enrolledLoading) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted">Loading course…</p>
    );
  }

  if (enrolledCourse) {
    if (content.isLoading) {
      return (
        <p className="px-4 py-16 text-center text-sm text-muted">Loading course content…</p>
      );
    }
    // The public catalogue has a description field the enrolled-courses list
    // doesn't; cross-referenced on a best-effort basis -- an enrolled course
    // later unpublished just shows no description.
    const catalogueMatch = courses.find((c) => c.course_id === id);
    return (
      <CourseContent
        courseId={id}
        title={enrolledCourse.title}
        description={catalogueMatch?.description}
        coverImageUrl={enrolledCourse.cover_image_url}
        modules={groupContentRows(content.content)}
      />
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
