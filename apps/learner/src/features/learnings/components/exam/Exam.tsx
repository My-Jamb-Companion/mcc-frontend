"use client";

import {examDetails} from "@/src/features/constants/demoExams";
import {useParams} from "next/navigation";
import BuyExam from "./BuyExam";
import ExamContent from "./ExamContent";
import {useExam} from "./context/ExamContext";

export default function Exam() {
  const {id} = useParams();
  const {viewEnrolledCourse, subjects} = useExam();

  if (!id) return null;

  const exam = examDetails.find((c) => c.slug === id);

  if (!exam) return null;

  const hasEnrolledCourse = subjects.some((subject) => subject.isEnrolled);

  const showExamContent = viewEnrolledCourse && hasEnrolledCourse;
  const enrolledSubjectIds = new Set(
    subjects.filter((s) => s.isEnrolled).map((s) => s.id),
  );

  const filteredExam = {
    ...exam,
    subjects:
      exam.subjects?.filter((sub) => enrolledSubjectIds.has(sub.id)) || [],
  };

  return (
    <>
      {showExamContent ? (
        <ExamContent exam={filteredExam} />
      ) : (
        <BuyExam exam={exam} />
      )}
    </>
  );
}
