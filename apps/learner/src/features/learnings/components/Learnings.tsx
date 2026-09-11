"use client";

import {useState} from "react";
import BannerCarousel from "@/src/features/components/BannerCarousel";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ExamCard from "@/src/features/components/ExamCard";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import ScrollRow from "@/src/features/components/RowScroll";
import {useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiCourse, fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";
import {usePrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiExamProgram} from "@/src/features/exams/helper/exam.mapper";
import CourseFeedbackModal from "@/src/features/courses/components/CourseFeedbackModal";
import {ApiEnrolledCourse} from "@/src/features/courses/services/course.service";

export default function Learnings() {
  const {courses: allCourses, isLoading: coursesLoading} = useCourses();
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();
  const {programs, isLoading: programsLoading} = usePrograms();
  const [feedbackCourse, setFeedbackCourse] = useState<ApiEnrolledCourse | null>(null);

  const enrolledIds = new Set(enrolledCourses.map((c) => c.course_id));
  const notYetEnrolled = allCourses.filter((c) => !enrolledIds.has(c.course_id));

  return (
    <section className="flex flex-col gap-8 pb-20 px-4">
      <div className="mt-7">
        <BannerCarousel />
      </div>

      <div>
        <ScrollRow
          title="Continue learning here"
          isLoading={enrolledLoading}
          skeleton={<CourseCardSkeleton />}
          skeletonCount={4}
        >
          {enrolledCourses.length === 0 && !enrolledLoading ? (
            <p className="text-sm text-muted">
              You haven&apos;t started any courses yet.
            </p>
          ) : (
            enrolledCourses.map((course) => (
              <div key={course.course_id} className="shrink-0 w-72">
                <CourseCard {...fromApiEnrolledCourse(course)} />
                {course.progress_percent >= 100 && (
                  <button
                    type="button"
                    onClick={() => setFeedbackCourse(course)}
                    className="mt-2 text-xs font-semibold text-btn-primary hover:underline"
                  >
                    Leave feedback
                  </button>
                )}
              </div>
            ))
          )}
        </ScrollRow>
      </div>

      <CourseFeedbackModal
        open={!!feedbackCourse}
        courseId={feedbackCourse?.course_id ?? ""}
        courseTitle={feedbackCourse?.title ?? ""}
        onClose={() => setFeedbackCourse(null)}
      />

      <div>
        <ScrollRow
          title="What to learn next?"
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

      <div>
        <ScrollRow
          variant="card"
          title="Practice Exams"
          subTitle="Best practice resources and environment for your exams"
          isLoading={programsLoading}
          skeleton={<ExamCardSkeleton />}
          skeletonCount={5}
        >
          {programs.map((program) => (
            <ExamCard key={program.program_id} exam={fromApiExamProgram(program)} />
          ))}
        </ScrollRow>
      </div>
    </section>
  );
}
