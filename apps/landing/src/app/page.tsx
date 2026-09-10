"use client";

import Link from "next/link";
import { Button, LoadingCircle } from "@mcc/ui";
import { useCourses, usePrograms } from "@/src/features/catalogue/useCatalogue";
import { CourseCard } from "@/src/features/catalogue/CourseCard";
import { ProgramCard } from "@/src/features/catalogue/ProgramCard";
import { useCaptureAcquisitionSource } from "@/src/features/enrollment/acquisitionSource";

export default function HomePage() {
  useCaptureAcquisitionSource();

  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  return (
    <main className="flex-1">
      <section className="px-6 py-20 text-center bg-primary-gradient text-white">
        <h1 className="text-3xl sm:text-5xl font-bold max-w-3xl mx-auto">
          Learn a skill, or ace JAMB &amp; WAEC — your way.
        </h1>
        <p className="mt-4 text-white/90 max-w-xl mx-auto">
          Courses and exam prep, taught by real teachers, backed by an AI tutor
          that actually knows where you're stuck.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#catalogue">
            <Button variant="primary" size="lg" className="bg-white text-primary hover:bg-white/90">
              Browse courses &amp; exam prep
            </Button>
          </a>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      <section id="catalogue" className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Courses</h2>
        {coursesLoading ? (
          <div className="flex justify-center py-10">
            <LoadingCircle color="border-primary" />
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No courses published yet — check back soon.</p>
        )}
      </section>

      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Exam prep</h2>
        {programsLoading ? (
          <div className="flex justify-center py-10">
            <LoadingCircle color="border-primary" />
          </div>
        ) : programs && programs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <ProgramCard key={program.program_id} program={program} />
            ))}
          </div>
        ) : (
          <p className="text-muted">No exam-prep programs published yet — check back soon.</p>
        )}
      </section>

      <footer className="px-6 py-10 text-center text-sm text-muted border-t border-muted/20">
        Already enrolled?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </footer>
    </main>
  );
}
