"use client";

import {useMemo, useState} from "react";
import ScrollRow from "@/src/features/components/RowScroll";
import LearningsHeader from "./LearningsHeader";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import ExamCard from "@/src/features/components/ExamCard";
import {useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";
import CourseCard from "@/src/features/components/CourseCard";
import {usePrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiExamProgram} from "@/src/features/exams/helper/exam.mapper";
import DiscoveryFilters, {SelectOption} from "./DiscoveryFilters";
import {EXAM_LEVEL_OPTIONS} from "../constants/levelOptions";
import {useDebouncedValue} from "../hooks/useDebouncedValue";

function uniqueOptions(pairs: Array<[string | null | undefined, string | null | undefined]>): SelectOption[] {
  const byId = new Map<string, string>();
  for (const [id, name] of pairs) {
    if (id && name && !byId.has(id)) byId.set(id, name);
  }
  return Array.from(byId, ([value, label]) => ({value, label})).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

export default function Exams() {
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();
  const {programs, isLoading: programsLoading} = usePrograms();

  const subjectOptions = useMemo(
    () => uniqueOptions(programs.map((p) => [p.subject_id, p.subject_name])),
    [programs],
  );

  const [searchInput, setSearchInput] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const search = useDebouncedValue(searchInput);
  const filtersActive = !!(search || subject || level);
  const {programs: filteredPrograms, isLoading: filteredLoading} = usePrograms({
    search: search || undefined,
    subject_id: subject || undefined,
    level: level || undefined,
  });

  return (
    <section className="py-6 px-4">
      <LearningsHeader
        stats={[
          {label: "Exam-prep programs", value: String(programs.length)},
          {label: "Subjects covered", value: String(subjectOptions.length)},
        ]}
        title="Prepare for Exam"
        paragraph="Real, curated exam-prep programs -- search or filter by subject and level to find what to practice next."
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

      <div className="flex flex-col gap-4 pt-18">
        <h2 className="text-lg font-semibold">Browse all exam-prep programs</h2>
        <DiscoveryFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search exam-prep programs…"
          level={level}
          onLevelChange={setLevel}
          levelOptions={EXAM_LEVEL_OPTIONS}
          secondaryAllLabel="All subjects"
          secondaryValue={subject}
          onSecondaryChange={setSubject}
          secondaryOptions={subjectOptions}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredLoading &&
            Array.from({length: 4}).map((_, i) => <ExamCardSkeleton key={i} />)}
          {!filteredLoading && filteredPrograms.length === 0 && (
            <p className="col-span-full text-sm text-muted py-8 text-center">
              {filtersActive
                ? "No exam-prep programs match those filters."
                : "No exam-prep programs available yet."}
            </p>
          )}
          {filteredPrograms.map((program) => (
            <ExamCard key={program.program_id} exam={fromApiExamProgram(program)} />
          ))}
        </div>
      </div>
    </section>
  );
}
