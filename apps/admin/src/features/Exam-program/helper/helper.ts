import {ExamProgramFormValues} from "../components/CreateExamProgram";
import {CreateExamProgramPayload} from "../services/exam.service";

type ExamLevel = ExamProgramFormValues["level"];

const UI_LEVEL_TO_API: Record<ExamLevel, string> = {
  all: "all",
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

export function toApiLevel(level: ExamLevel): string {
  return UI_LEVEL_TO_API[level] ?? "all_levels";
}

const API_LEVEL_TO_UI: Record<string, ExamLevel> = {
  all_levels: "all",
  beginner: "beginner",
  intermediate: "intermediate",
  advanced: "advanced",
};

export function fromApiLevel(level: string): ExamLevel {
  return API_LEVEL_TO_UI[level] ?? "all";
}

/**
 * Maps the Step 1 (details) form values to the shape the backend's
 * "/admin/exams/programs" endpoint expects.
 */
export function toCreateExamProgramPayload(
  values: ExamProgramFormValues,
): CreateExamProgramPayload {
  return {
    exam: values.exam,
    subject: values.subject,
    category: values.category,
    teacher_id: values.instructor,
    description: values.description,
    price: Number(values.price || 0),
    level: toApiLevel(values.level),
    tags: values.tags,
    learning_outcomes: values.learnItems,
  };
}
