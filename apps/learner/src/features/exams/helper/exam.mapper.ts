import {ExamItem} from "@/src/features/constants/ExamCards";
import {ApiExamProgram} from "../services/exam.service";

export function fromApiExamProgram(api: ApiExamProgram): ExamItem {
  return {
    id: api.program_id,
    name: [api.exam_name, api.subject_name].filter(Boolean).join(" — ") || "Exam program",
    price: Number(api.price),
    currency: "₦",
  };
}
