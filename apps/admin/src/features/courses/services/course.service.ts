import { apiClient } from "@mcc/api";
import {
  ApiCourseDetail,
  ApiCourseSummary,
  ApiEnvelope,
  ListCoursesParams,
  PaginatedEnvelope,
} from "../types/types";

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
// COURSE READS
// ─────────────────────────────────────────────

/**
 * Lists courses for the admin dashboard.
 * Endpoint: GET /admin/courses
 */
export const listCourses = async (
  params?: ListCoursesParams,
): Promise<PaginatedEnvelope<ApiCourseSummary>> => {
  const res = await apiClient.get<PaginatedEnvelope<ApiCourseSummary>>(
    "/admin/courses",
    { params },
  );

  return res.data;
};

/**
 * Fetches one course's full detail (modules, lectures, quizzes included).
 * Endpoint: GET /admin/courses/{course_id}
 */
export const getCourse = async (
  courseId: string,
): Promise<ApiEnvelope<ApiCourseDetail>> => {
  const res = await apiClient.get<ApiEnvelope<ApiCourseDetail>>(
    `/admin/courses/${courseId}`,
  );

  return res.data;
};

// ─────────────────────────────────────────────
// STEP 1 — COURSE DETAILS
// ─────────────────────────────────────────────

export interface CreateCourseDetailsPayload {
  title: string;
  category: string;
  teacher_id: string;
  price: number;
  /** Backend enum value (`toApiLevel(...)` output), e.g. "all_levels" — not the UI's CourseLevel. */
  level: string;
  description: string;
  learning_outcomes: string[];
  tags: string[];
}

export interface CreateCourseDetailsResponse extends CreateCourseDetailsPayload {
  id: string;
}

/**
 * Creates a course's step-1 details (title, category, instructor, price,
 * level, description, learning outcomes, tags) on the backend.
 */
export const createCourseDetails = async (
  payload: CreateCourseDetailsPayload,
): Promise<CreateCourseDetailsResponse> => {
  const res = await apiClient.post<{
    success: boolean;
    data: CreateCourseDetailsResponse;
  }>("/admin/courses", payload);

  return res.data.data;
};

interface CourseMutationResponse {
  success: boolean;
  data: {course_id: string; status?: string};
  message: string;
}

/**
 * Updates a course with modules, lectures, quizzes, cover_image_url, and promo_video_url.
 * Endpoint: PATCH /admin/courses/{course_id}
 */
export const updateCourse = async (
  courseId: string,
  payload: import("../types/types").UpdateCoursePayload,
) => {
  const res = await apiClient.patch<CourseMutationResponse>(
    `/admin/courses/${courseId}`,
    payload,
  );

  return res.data;
};

/**
 * Publishes a course (triggers final validation and flips status to published).
 * Endpoint: POST /admin/courses/{course_id}/publish
 */
export const publishCourse = async (courseId: string) => {
  const res = await apiClient.post<CourseMutationResponse>(
    `/admin/courses/${courseId}/publish`,
  );

  return res.data;
};

/**
 * Unpublishes a course (reverts status back to draft).
 * Endpoint: POST /admin/courses/{course_id}/unpublish
 */
export const unpublishCourse = async (courseId: string) => {
  const res = await apiClient.post<CourseMutationResponse>(
    `/admin/courses/${courseId}/unpublish`,
  );

  return res.data;
};

/**
 * Permanently deletes a course, cascading to its modules, lectures, and
 * quiz questions.
 * Endpoint: DELETE /admin/courses/{course_id}
 */
export const deleteCourse = async (courseId: string) => {
  const res = await apiClient.delete<CourseMutationResponse>(
    `/admin/courses/${courseId}`,
  );

  return res.data;
};
