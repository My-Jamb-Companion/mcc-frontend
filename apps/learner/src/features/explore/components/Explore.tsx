"use client";

import {useMemo, useState} from "react";
import BannerCarousel from "@/src/features/components/BannerCarousel";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import ExamCard from "@/src/features/components/ExamCard";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import ScrollRow from "@/src/features/components/RowScroll";
import {useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiCourse} from "@/src/features/courses/helper/course.mapper";
import {usePrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiExamProgram} from "@/src/features/exams/helper/exam.mapper";
import DiscoverCourses from "@/src/features/brainy/components/DiscoverCourses";
import RecTopics from "@/src/features/dashboard/components/RecTopics";
import DiscoveryFilters, {SelectOption} from "@/src/features/learnings/components/DiscoveryFilters";
import {COURSE_LEVEL_OPTIONS, EXAM_LEVEL_OPTIONS} from "@/src/features/learnings/constants/levelOptions";
import {useDebouncedValue} from "@/src/features/learnings/hooks/useDebouncedValue";

function uniqueOptions(pairs: Array<[string | null | undefined, string | null | undefined]>): SelectOption[] {
  const byId = new Map<string, string>();
  for (const [id, name] of pairs) {
    if (id && name && !byId.has(id)) byId.set(id, name);
  }
  return Array.from(byId, ([value, label]) => ({value, label})).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
}

/**
 * The discovery/marketing home: browse and enrol into courses and exam
 * programs the student hasn't started yet. Their own enrolled stuff lives
 * on /dashboard instead -- see apps/learner/src/features/dashboard.
 */
export default function Explore() {
  const {courses: allCourses, isLoading: coursesLoading} = useCourses();
  const {courses: enrolledCourses} = useEnrolledCourses();
  const {programs, isLoading: programsLoading} = usePrograms();

  const enrolledIds = new Set(enrolledCourses.map((c) => c.course_id));
  const notYetEnrolled = allCourses.filter((c) => !enrolledIds.has(c.course_id));

  const categoryOptions = useMemo(
    () => uniqueOptions(allCourses.map((c) => [c.category_id, c.category_name])),
    [allCourses],
  );
  const subjectOptions = useMemo(
    () => uniqueOptions(programs.map((p) => [p.subject_id, p.subject_name])),
    [programs],
  );

  const [courseSearchInput, setCourseSearchInput] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseLevel, setCourseLevel] = useState("");
  const courseSearch = useDebouncedValue(courseSearchInput);
  const courseFiltersActive = !!(courseSearch || courseCategory || courseLevel);
  const {courses: filteredCourses, isLoading: filteredCoursesLoading} = useCourses({
    search: courseSearch || undefined,
    category_id: courseCategory || undefined,
    level: courseLevel || undefined,
  });

  const [examSearchInput, setExamSearchInput] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [examLevel, setExamLevel] = useState("");
  const examSearch = useDebouncedValue(examSearchInput);
  const examFiltersActive = !!(examSearch || examSubject || examLevel);
  const {programs: filteredPrograms, isLoading: filteredProgramsLoading} = usePrograms({
    search: examSearch || undefined,
    subject_id: examSubject || undefined,
    level: examLevel || undefined,
  });

  return (
    <section className="flex flex-col gap-8 pb-20 px-4">
      <div className="mt-7">
        <BannerCarousel />
      </div>

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

      <DiscoverCourses />

      <RecTopics />

      <ScrollRow
        variant="card"
        title="Practice Exams"
        subTitle="Explore exam-prep programs you can enrol into"
        isLoading={programsLoading}
        skeleton={<ExamCardSkeleton />}
        skeletonCount={5}
      >
        {programs.map((program) => (
          <ExamCard key={program.program_id} exam={fromApiExamProgram(program)} />
        ))}
      </ScrollRow>

      <div className="flex flex-col gap-4 pt-4">
        <h2 className="text-lg font-semibold">Browse all courses</h2>
        <DiscoveryFilters
          search={courseSearchInput}
          onSearchChange={setCourseSearchInput}
          searchPlaceholder="Search courses…"
          level={courseLevel}
          onLevelChange={setCourseLevel}
          levelOptions={COURSE_LEVEL_OPTIONS}
          secondaryAllLabel="All categories"
          secondaryValue={courseCategory}
          onSecondaryChange={setCourseCategory}
          secondaryOptions={categoryOptions}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCoursesLoading &&
            Array.from({length: 4}).map((_, i) => <CourseCardSkeleton key={i} />)}
          {!filteredCoursesLoading && filteredCourses.length === 0 && (
            <p className="col-span-full text-sm text-muted py-8 text-center">
              {courseFiltersActive
                ? "No courses match those filters."
                : "No courses available yet."}
            </p>
          )}
          {filteredCourses.map((course) => (
            <CourseCard key={course.course_id} {...fromApiCourse(course)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <h2 className="text-lg font-semibold">Browse exam-prep programs</h2>
        <DiscoveryFilters
          search={examSearchInput}
          onSearchChange={setExamSearchInput}
          searchPlaceholder="Search exam-prep programs…"
          level={examLevel}
          onLevelChange={setExamLevel}
          levelOptions={EXAM_LEVEL_OPTIONS}
          secondaryAllLabel="All subjects"
          secondaryValue={examSubject}
          onSecondaryChange={setExamSubject}
          secondaryOptions={subjectOptions}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProgramsLoading &&
            Array.from({length: 4}).map((_, i) => <ExamCardSkeleton key={i} />)}
          {!filteredProgramsLoading && filteredPrograms.length === 0 && (
            <p className="col-span-full text-sm text-muted py-8 text-center">
              {examFiltersActive
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
