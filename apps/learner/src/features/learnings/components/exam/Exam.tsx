"use client";

import {examDetails} from "@/src/features/constants/demoExams";
import {useParams} from "next/navigation";
import BuyExam from "./BuyExam";
import ExamContent from "./ExamContent";
import {useExam} from "./context/ExamContext";

export default function Exam() {
  const {id} = useParams();

  // 1. Pull the values directly from your custom hook context
  const {viewEnrolledCourse, subjects} = useExam();

  if (!id) return null;

  const exam = examDetails.find((c) => c.slug === id);
  console.log(id, exam);

  if (!exam) return null;

  // 2. Check if at least one subject in the exam is currently enrolled
  const hasEnrolledCourse = subjects.some((subject) => subject.isEnrolled);

  // 3. If the toggle flag is true AND they have an active enrollment, show content.
  const showExamContent = viewEnrolledCourse && hasEnrolledCourse;
  console.log(hasEnrolledCourse);

  // 4. Filter the exam to only include enrolled subjects before rendering content
  // We match the exam's subjects against the enrolled subjects in your context.
  const enrolledSubjectIds = new Set(
    subjects.filter((s) => s.isEnrolled).map((s) => s.id),
  );

  const filteredExam = {
    ...exam,
    subjects:
      exam.subjects?.filter((sub) => enrolledSubjectIds.has(sub.id)) || [],
  };
  console.log(filteredExam);
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
