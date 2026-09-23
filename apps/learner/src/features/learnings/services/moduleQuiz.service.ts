import {apiClient} from "@mcc/api";

export interface ApiModuleQuestion {
  question_id: string;
  question_text: string;
  description?: string | null;
  question_type: "single_choice" | "multiple_choice" | "long_short_answer";
  options: string[];
  correct_answers: string[];
  explanation?: string | null;
  image_url?: string | null;
  order_index: number;
}

export interface ApiModuleGradedAnswer {
  question_id: string;
  your_answer: string[];
  correct_answer: string[];
  /** Null for a long_short_answer question with no recorded correct_answers
   * to match against -- not auto-gradable, excluded from score_percent. */
  is_correct: boolean | null;
  explanation?: string | null;
}

export interface ApiModuleQuizResult {
  score_percent: number;
  graded_count: number;
  results: ApiModuleGradedAnswer[];
}

/** Endpoint: GET /courses/<course_id>/modules/<module_id>/questions */
export const getModuleQuestions = async (
  courseId: string,
  moduleId: string,
): Promise<ApiModuleQuestion[]> => {
  const res = await apiClient.get<{data: {questions: ApiModuleQuestion[]}}>(
    `/courses/${courseId}/modules/${moduleId}/questions`,
  );
  return res.data.data.questions;
};

/** Endpoint: POST /courses/<course_id>/modules/<module_id>/questions/submit */
export const submitModuleAnswers = async (
  courseId: string,
  moduleId: string,
  answers: Record<string, string[]>,
): Promise<ApiModuleQuizResult> => {
  const res = await apiClient.post<{data: ApiModuleQuizResult}>(
    `/courses/${courseId}/modules/${moduleId}/questions/submit`,
    {answers},
  );
  return res.data.data;
};
