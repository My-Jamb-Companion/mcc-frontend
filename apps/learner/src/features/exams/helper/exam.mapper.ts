import {ExamItem} from "@/src/features/constants/ExamCards";
import {ApiEnrolledProgram, ApiExamProgram} from "../services/exam.service";

export function fromApiExamProgram(api: ApiExamProgram): ExamItem {
  return {
    id: api.program_id,
    name: [api.exam_name, api.subject_name].filter(Boolean).join(" — ") || "Exam program",
    price: Number(api.price),
    currency: "₦",
  };
}

export function fromApiEnrolledProgram(api: ApiEnrolledProgram): ExamItem {
  return {
    id: api.program_id,
    name: [api.exam_name, api.subject_name].filter(Boolean).join(" — ") || "Exam program",
    completePercent: api.progress_percent,
  };
}
