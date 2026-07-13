"use client";

import {useSearchParams} from "next/navigation";

export default function Classroom() {
  const searchParams = useSearchParams();

  const examId = searchParams.get("examId");
  const lessonId = searchParams.get("lessonId");
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Classroom</h1>
      <p className="text-sm text-subtle">Exam ID: {examId}</p>
      <p className="text-sm text-subtle">Lesson ID: {lessonId}</p>
    </div>
  );
}
