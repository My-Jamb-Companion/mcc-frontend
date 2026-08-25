import { apiClient } from "@mcc/api";
import { coursesMock } from "./course.mock";
import { CourseLevel } from "../types/types";

export const getCourses = async () => {
  return Promise.resolve(coursesMock);
};

export const createCourse = async (title: string) => {
  return Promise.resolve({
    id: Date.now().toString(),
    title,
    published: false,
  });
};

// ─────────────────────────────────────────────
// STEP 1 — COURSE DETAILS
// ─────────────────────────────────────────────

export interface CreateCourseDetailsPayload {
  title: string;
  category: string;
  teacher_id: string;
  price: number;
  level: CourseLevel;
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