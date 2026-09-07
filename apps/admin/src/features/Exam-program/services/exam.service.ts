import {apiClient} from "@mcc/api";
import {ApiTopicPayload} from "../helper/content.mapper";

/**
 * Extracts a user-facing message from an Axios (or any) error without
 * resorting to `any` at every call site.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as {response?: {data?: {message?: string}}}).response
      ?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

// ─────────────────────────────────────────────
// EXAM PROGRAM READS
// ─────────────────────────────────────────────

export interface ApiExamProgramSummary {
  program_id: string;
  exam_name: string | null;
  subject_name: string;
  category_name: string;
  teacher_name: string;
  teacher_avatar?: string;
  level: string;
  /** Backend sends this as a decimal string, e.g. "4500.00". */
  price: string;
  /** Backend sends this as a decimal string, e.g. "0.00". */
  rating: string;
  status: string;
  created_at: string;
}

export interface ListExamProgramsParams {
  page?: number;
  limit?: number;
  status?: "draft" | "published";
  teacher_id?: string;
  search?: string;
}

export interface ListExamProgramsMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ListExamProgramsResponse {
  data: ApiExamProgramSummary[];
  message: string;
  meta: ListExamProgramsMeta;
  success: boolean;
}

/**
 * Lists exam programs for the admin dashboard.
 * Endpoint: GET /admin/exams/programs
 */
export const listExamPrograms = async (
  params?: ListExamProgramsParams,
): Promise<ListExamProgramsResponse> => {
  const res = await apiClient.get<ListExamProgramsResponse>(
    "/admin/exams/programs",
    {params},
  );

  return res.data;
};

// ─────────────────────────────────────────────
// GET /admin/exams/programs/{program_id}
// ─────────────────────────────────────────────

export interface ApiExamQuestion {
  question_id: string;
  question_text: string;
  description: string | null;
  question_type: string;
  options: string[];
  correct_answers: string[];
  explanation: string;
  order_index: number;
  parent_id: string;
  parent_type: string;
  usage_type: "practice" | "quiz" | "test";
  created_at: string;
}

export interface ApiExamLecture {
  lecture_id: string;
  module_id: string;
  title: string;
  video_url: string;
  file_size_bytes: number;
  order_index: number;
  created_at: string;
}

export interface ApiExamModule {
  module_id: string;
  sub_topic_id: string;
  title: string;
  order_index: number;
  lectures: ApiExamLecture[];
  quizzes: ApiExamQuestion[];
  practices: ApiExamQuestion[];
  created_at: string;
}

export interface ApiExamSubTopic {
  sub_topic_id: string;
  topic_id: string;
  title: string;
  description: string | null;
  order_index: number;
  modules: ApiExamModule[];
  test_exercises: ApiExamQuestion[];
  created_at: string;
}

export interface ApiExamTopic {
  topic_id: string;
  program_id: string;
  title: string;
  order_index: number;
  sub_topics: ApiExamSubTopic[];
  created_at: string;
}

export interface ApiExamProgramDetail {
  program_id: string;
  exam_id: string;
  subject_id: string;
  category_id: string;
  teacher_id: string;
  description: string;
  price: string;
  /** Backend enum value, e.g. "intermediate". */
  level: string;
  tags: string[];
  learning_outcomes: string[];
  status: string;
  rating: string;
  cover_image_url: string | null;
  promo_video_url: string | null;
  topics: ApiExamTopic[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * Fetches one exam program's full detail (topics, sub-topics, modules,
 * lectures, quizzes, practices, and test exercises included).
 * Endpoint: GET /admin/exams/programs/{program_id}
 */
export const getExamProgram = async (
  programId: string,
): Promise<ApiExamProgramDetail> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ApiExamProgramDetail;
  }>(`/admin/exams/programs/${programId}`);

  return res.data.data;
};

export interface CreateExamProgramPayload {
  exam: string;
  subject: string;
  category: string;
  teacher_id: string;
  description: string;
  price: number;
  /** Backend enum value (`toApiLevel(...)` output), e.g. "all_levels". */
  level: string;
  tags: string[];
  learning_outcomes: string[];
}

export interface CreateExamProgramResponse {
  program_id: string;
}

/**
 * Creates an exam program's step-1 details (exam, subject, category,
 * instructor, description, price, level, tags, learning outcomes).
 * Endpoint: POST /admin/exams/programs
 */
export const createExamProgram = async (
  payload: CreateExamProgramPayload,
): Promise<CreateExamProgramResponse> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: CreateExamProgramResponse;
  }>("/admin/exams/programs", payload);

  return res.data.data;
};

export interface UpdateExamProgramContentPayload {
  topics: ApiTopicPayload[];
  cover_image_url?: string;
  promo_video_url?: string;
}

export interface UpdateExamProgramContentResponse {
  program_id: string;
  status: string;
}

/**
 * Saves an exam program's Step2 content (topics, sub-topics, modules,
 * lectures, quizzes, practices, test exercises).
 * Endpoint: PATCH /admin/exams/programs/{program_id}
 */
export const updateExamProgramContent = async (
  programId: string,
  payload: UpdateExamProgramContentPayload,
): Promise<UpdateExamProgramContentResponse> => {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: UpdateExamProgramContentResponse;
  }>(`/admin/exams/programs/${programId}`, payload);

  return res.data.data;
};

export interface PublishExamProgramResponse {
  program_id: string;
  status: string;
}

/**
 * Publishes an exam program (triggers final validation and flips status to
 * published).
 * Endpoint: POST /admin/exams/programs/{program_id}/publish
 */
export const publishExamProgram = async (
  programId: string,
): Promise<PublishExamProgramResponse> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: PublishExamProgramResponse;
  }>(`/admin/exams/programs/${programId}/publish`);

  return res.data.data;
};

export interface UnpublishExamProgramResponse {
  program_id: string;
  status: string;
}

/**
 * Unpublishes an exam program (reverts status back to draft).
 * Endpoint: POST /admin/exams/programs/{program_id}/unpublish
 */
export const unpublishExamProgram = async (
  programId: string,
): Promise<UnpublishExamProgramResponse> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: UnpublishExamProgramResponse;
  }>(`/admin/exams/programs/${programId}/unpublish`);

  return res.data.data;
};

/**
 * Permanently deletes an exam program, cascading to its topics, sub-topics,
 * modules, lectures, and quiz questions.
 * Endpoint: DELETE /admin/exams/programs/{program_id}
 */
export const deleteExamProgram = async (
  programId: string,
): Promise<{success: boolean; message: string}> => {
  const res = await apiClient.delete<{success: boolean; message: string}>(
    `/admin/exams/programs/${programId}`,
  );

  return res.data;
};
