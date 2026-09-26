"use client";
import {useMemo} from "react";
import {useParams} from "next/navigation";
import LearningsHeader from "./LearningsHeader";
import ScrollRow from "@/src/features/components/RowScroll";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import {useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiCourse, fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";

export default function Topics() {
  const {id} = useParams();
  const topicName = useMemo(() => String(id).replaceAll("-", " "), [id]);

  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();
  const {courses: matchingCourses, isLoading: coursesLoading} = useCourses({search: topicName});

  const enrolledIds = new Set(enrolledCourses.map((c) => c.course_id));
  const notYetEnrolled = matchingCourses.filter((c) => !enrolledIds.has(c.course_id));

  return (
    <section className="py-6 px-4">
      <LearningsHeader
        stats={[{label: "Matching courses", value: String(matchingCourses.length)}]}
        title={topicName}
        paragraph={`Courses whose title or description mentions "${topicName}".`}
      />

      <div className="pt-16">
        <ScrollRow
          title="Programs you're taking already"
          isLoading={enrolledLoading}
          skeleton={<CourseCardSkeleton />}
          skeletonCount={4}
        >
          {enrolledCourses.length === 0 && !enrolledLoading ? (
            <p className="text-sm text-muted">No programs in progress yet.</p>
          ) : (
            enrolledCourses.map((course) => (
              <div key={course.course_id} className="shrink-0 w-72">
                <CourseCard {...fromApiEnrolledCourse(course)} />
              </div>
            ))
          )}
        </ScrollRow>
      </div>

      <div className="pt-16">
        <ScrollRow
          title={`Courses about ${topicName}`}
          isLoading={coursesLoading}
          skeleton={<CourseCardSkeleton />}
          skeletonCount={4}
        >
          {notYetEnrolled.length === 0 && !coursesLoading ? (
            <p className="text-sm text-muted">No matching courses yet.</p>
          ) : (
            notYetEnrolled.map((course) => (
              <div key={course.course_id} className="shrink-0 w-72">
                <CourseCard {...fromApiCourse(course)} />
              </div>
            ))
          )}
        </ScrollRow>
      </div>
    </section>
  );
}
