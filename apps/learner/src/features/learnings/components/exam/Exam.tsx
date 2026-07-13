"use client";

import {examDetails} from "@/src/features/constants/demoExams";
import {useParams} from "next/navigation";
import BuyExam from "./BuyExam";
import ExamContent from "./ExamContent"; // Import your exam content component
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
  // Otherwise, fallback to the BuyExam layout.
  const showExamContent = viewEnrolledCourse && hasEnrolledCourse;

  return <>{showExamContent ? <ExamContent /> : <BuyExam exam={exam} />}</>;
}
