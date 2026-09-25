"use client";
import {useParams} from "next/navigation";
import {usePrograms, useEnrolledPrograms} from "@/src/features/exams/hooks/useExams";
import BuyExam from "./BuyExam";
import ExamProgramContent from "./ExamProgramContent";

/**
 * The exam-prep equivalent of ../course/Course.tsx: decides between the
 * not-yet-registered purchase screen and the registered content tree, from
 * the real catalogue/enrolled-programs APIs.
 */
export default function Exam() {
  const {id} = useParams<{id: string}>();
  const {programs, isLoading: programsLoading} = usePrograms();
  const {programs: enrolledPrograms, isLoading: enrolledLoading} = useEnrolledPrograms();

  if (!id) return null;

  if (programsLoading || enrolledLoading) {
    return (
      <p className="px-4 py-16 text-center text-sm text-muted">Loading…</p>
    );
  }

  const enrolledProgram = enrolledPrograms.find((p) => p.program_id === id) ?? null;
  if (enrolledProgram) {
    return <ExamProgramContent programId={id} program={enrolledProgram} />;
  }

  const program = programs.find((p) => p.program_id === id);
  if (!program) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-lg font-semibold">Exam program not found</p>
        <p className="mt-2 text-sm text-muted">
          This program may have been unpublished, or the link is incorrect.
        </p>
      </div>
    );
  }

  return <BuyExam program={program} />;
}
