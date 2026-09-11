"use client";

import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ScrollRow from "@/src/features/components/RowScroll";
import {demoStats} from "../constants/demoHeaderStats";
import LearningsHeader from "./LearningsHeader";
import {useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiCourse, fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";

export default function Skills() {
  const {courses: allCourses, isLoading: coursesLoading} = useCourses();
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();

  const enrolledIds = new Set(enrolledCourses.map((c) => c.course_id));
  const notYetEnrolled = allCourses.filter((c) => !enrolledIds.has(c.course_id));

  return (
    <section className="py-6 px-4">
      <LearningsHeader
        stats={demoStats}
        title={"Acquire high value skills"}
        paragraph="
                  Python is a versatile programming language known for its simplicity
                  and readability. Learning Python boosts your ability to develop web
                  applications, data analysis tools, and automation scripts, making it
                  essential for many tech careers.
            "
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
          title="Skills to acquire next"
          isLoading={coursesLoading}
          skeleton={<CourseCardSkeleton />}
          skeletonCount={4}
        >
          {notYetEnrolled.map((course) => (
            <div key={course.course_id} className="shrink-0 w-72">
              <CourseCard {...fromApiCourse(course)} />
            </div>
          ))}
        </ScrollRow>
      </div>
    </section>
  );
}
