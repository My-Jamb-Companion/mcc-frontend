"use client";

import {useState} from "react";
import Link from "next/link";
import {Icon} from "@mcc/ui";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ExamCard from "@/src/features/components/ExamCard";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import {useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";
import {useEnrolledPrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiEnrolledProgram} from "@/src/features/exams/helper/exam.mapper";
import CourseFeedbackModal from "@/src/features/courses/components/CourseFeedbackModal";
import {ApiEnrolledCourse} from "@/src/features/courses/services/course.service";

const shortcuts = [
  {
    title: "Exam history",
    description: "Review your past exam sessions and results",
    icon: "solar:history-bold",
    link: "/learnings/exams/history",
  },
  {
    title: "Saved study sets",
    description: "Flashcards you've generated and saved with Brainy",
    icon: "solar:notebook-bold",
    link: "/learnings/study-sets",
  },
];

/**
 * "My Learning" -- everything the student is already enrolled in, in
 * full (not the teaser rows /dashboard shows), plus entry points into
 * exam history and saved study sets. Browsing/enrolling into something
 * new lives on /explore instead.
 */
export default function Learnings() {
  const {courses: enrolledCourses, isLoading: enrolledCoursesLoading} = useEnrolledCourses();
  const {programs: enrolledPrograms, isLoading: enrolledProgramsLoading} = useEnrolledPrograms();
  const [feedbackCourse, setFeedbackCourse] = useState<ApiEnrolledCourse | null>(null);

  return (
    <section className="flex flex-col gap-8 pb-20 px-4 pt-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.link}
            href={shortcut.link}
            className="flex items-center gap-4 rounded-2xl border border-muted/20 p-5 hover:bg-muted/5 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-muted/10 flex items-center justify-center shrink-0">
              <Icon icon={shortcut.icon} size={22} />
            </div>
            <div>
              <p className="font-semibold">{shortcut.title}</p>
              <p className="text-xs text-muted">{shortcut.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">My courses</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {enrolledCoursesLoading &&
            Array.from({length: 4}).map((_, i) => <CourseCardSkeleton key={i} />)}
          {!enrolledCoursesLoading && enrolledCourses.length === 0 && (
            <p className="col-span-full text-sm text-muted py-8 text-center">
              You haven&apos;t started any courses yet.
            </p>
          )}
          {enrolledCourses.map((course) => (
            <div key={course.course_id} className="flex flex-col gap-2">
              <CourseCard {...fromApiEnrolledCourse(course)} />
              {course.progress_percent >= 100 && (
                <button
                  type="button"
                  onClick={() => setFeedbackCourse(course)}
                  className="text-xs font-semibold text-btn-primary hover:underline w-fit"
                >
                  Leave feedback
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <CourseFeedbackModal
        open={!!feedbackCourse}
        courseId={feedbackCourse?.course_id ?? ""}
        courseTitle={feedbackCourse?.title ?? ""}
        onClose={() => setFeedbackCourse(null)}
      />

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">My exam programs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {enrolledProgramsLoading &&
            Array.from({length: 4}).map((_, i) => <ExamCardSkeleton key={i} />)}
          {!enrolledProgramsLoading && enrolledPrograms.length === 0 && (
            <p className="col-span-full text-sm text-muted py-8 text-center">
              You haven&apos;t enrolled in any exam programs yet.
            </p>
          )}
          {enrolledPrograms.map((program) => (
            <ExamCard key={program.program_id} exam={fromApiEnrolledProgram(program)} />
          ))}
        </div>
      </div>
    </section>
  );
}
