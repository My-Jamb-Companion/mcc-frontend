"use client";

import ScrollRow from "@/src/features/components/RowScroll";
import {demoStats} from "../constants/demoHeaderStats";
import LearningsHeader from "./LearningsHeader";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import ExamCard from "@/src/features/components/ExamCard";
import {useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";
import {usePrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiExamProgram} from "@/src/features/exams/helper/exam.mapper";

export default function Exams() {
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();
  const {programs, isLoading: programsLoading} = usePrograms();

  return (
    <section className="py-6 px-4">
      <LearningsHeader
        stats={demoStats}
        title="Prepare for Exam"
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

      <div className="pt-18">
        <ScrollRow
          variant="card"
          title="Practice Exams"
          subTitle="Pick up where you left off"
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
