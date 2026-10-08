import {apiClient, whenSessionReady} from "@mcc/api";
import type {ApiProgressUpdate} from "@/src/features/rewards/services/rewards.service";

export interface ApiTierPrice {
  tier_id: string;
  tier_name: string;
  price: number | string;
}

export interface ApiCourse {
  course_id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  price: number | string;
  level: string;
  category_id?: string | null;
  category_name?: string | null;
  /** Every published tier's price, for a tier picker; empty if nothing is published. */
  tier_prices: ApiTierPrice[];
}

export interface CourseListFilters {
  search?: string;
  category_id?: string;
  level?: string;
}

export interface ApiEnrolledCourse {
  course_id: string;
  title: string;
  cover_image_url?: string | null;
  progress_percent: number;
  completed_at?: string | null;
}

export interface ApiCertificate {
  id: string;
  course_id: string;
  course_title: string;
  cover_image_url?: string | null;
  issued_at: string;
}

export interface ApiCourseContentRow {
  module_id: string;
  module_title: string;
  /** Null when the module has no lectures of its own (e.g. quiz-only) --
   * a LEFT JOIN, so such a module still produces one row instead of being
   * dropped from the listing entirely. */
  lesson_id: string | null;
  lesson_title: string | null;
  video_url?: string | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  /** e.g. "MP4", "YOUTUBE", "PDF" -- as set by the admin course editor. */
  file_format?: string | null;
  /** Admin-authored lesson HTML. Mutually exclusive with video_url. */
  content?: string | null;
  /** The module's named exercise sets, in authored order (repeated on every row of the module). */
  exercise_sets?: {name: string; count: number}[];
  /** The module's named quiz sets (timed entries), in authored order. */
  quiz_sets?: {name: string; count: number; timer_minutes?: number | null; passing_score?: number | null}[];
}
/**
 * Endpoint: GET /courses/ (public catalogue)
 *
 * Prices are this student's city tier price, so the request waits for the
 * session's token rather than going out as a visitor's on a fresh page load.
 * search/category_id/level are all optional and independent -- omitting
 * all three is the full unfiltered catalogue, same as calling with no args.
 */
export const getCourses = async (filters: CourseListFilters = {}): Promise<ApiCourse[]> => {
  await whenSessionReady();
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category_id) params.set("category_id", filters.category_id);
  if (filters.level) params.set("level", filters.level);
  const qs = params.toString();
  const res = await apiClient.get<{data: {courses: ApiCourse[]}}>(`/courses/${qs ? `?${qs}` : ""}`);
  return res.data.data.courses;
};

/** Endpoint: GET /courses/certificates */
export const getCertificates = async (): Promise<ApiCertificate[]> => {
  const res = await apiClient.get<{data: {certificates: ApiCertificate[]}}>(
    "/courses/certificates",
  );
  return res.data.data.certificates;
};

/** Endpoint: GET /courses/enrolled */
export const getEnrolledCourses = async (): Promise<ApiEnrolledCourse[]> => {
  const res = await apiClient.get<{data: {courses: ApiEnrolledCourse[]}}>(
    "/courses/enrolled",
  );
  return res.data.data.courses;
};

/** Endpoint: GET /courses/<course_id>/content */
export const getCourseContent = async (
  courseId: string,
): Promise<ApiCourseContentRow[]> => {
  const res = await apiClient.get<{data: ApiCourseContentRow[]}>(
    `/courses/${courseId}/content`,
  );
  return res.data.data;
};

export interface EnrollResult {
  enrollment_id: string;
  enrollment_status: string;
  is_paid: boolean;
  redirect_url?: string;
  amount?: number;
  course_title?: string;
}

/** Endpoint: POST /courses/enroll */
export const enrollCourse = async (
  courseId: string,
  courseType: "free" | "paid",
): Promise<EnrollResult> => {
  const res = await apiClient.post<{data: EnrollResult}>("/courses/enroll", {
    course_id: courseId,
    course_type: courseType,
  });
  return res.data.data;
};

/**
 * Endpoint: POST /payments/initialize -- wraps the same enrollment logic
 * as POST /courses/enroll, but also opens a real Flutterwave checkout for
 * paid courses (checkout_url), which plain enroll never returns. Use this
 * for the actual Buy/Enroll button; enrollCourse above is for flows that
 * only ever deal with free courses.
 */
export const initializeCoursePayment = async (
  courseId: string,
  courseType: "free" | "paid",
  email?: string,
  tierId?: string,
): Promise<EnrollResult & {checkout_url?: string; tx_ref?: string}> => {
  const res = await apiClient.post<{
    data: EnrollResult & {checkout_url?: string; tx_ref?: string};
  }>("/payments/initialize", {course_id: courseId, course_type: courseType, email, tier_id: tierId});
  return res.data.data;
};

/** What a student has finished in a course or exam program. */
export interface ApiLessonProgress {
  progress_percent: number;
  completed_lecture_ids: string[];
  total_lectures: number;
}

/** Result of finishing one lesson: the new progress (worked out by the server) and what it earned. */
export interface ApiLessonCompleted extends ApiProgressUpdate {
  lecture_id: string;
  newly_completed: boolean;
  lesson_points: number;
  completed_lecture_ids: string[];
  total_lectures: number;
}

/** Endpoint: GET /courses/<course_id>/progress -- the lessons already finished, for the ticks after a reload. */
export const getCourseProgress = async (courseId: string): Promise<ApiLessonProgress> => {
  const res = await apiClient.get<{data: ApiLessonProgress}>(`/courses/${courseId}/progress`);
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/lectures/<lecture_id>/complete -- the server records it and works out progress. */
export const completeLecture = async (courseId: string, lectureId: string): Promise<ApiLessonCompleted> => {
  const res = await apiClient.post<{data: ApiLessonCompleted}>(`/courses/${courseId}/lectures/${lectureId}/complete`);
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/progress */
export const updateCourseProgress = async (
  courseId: string,
  progressPercent: number,
): Promise<ApiProgressUpdate | undefined> => {
  const res = await apiClient.post<{data?: ApiProgressUpdate}>(`/courses/${courseId}/progress`, {
    progress_percent: progressPercent,
  });
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/feedback */
export const submitCourseFeedback = async (
  courseId: string,
  rating: number,
  comments?: string,
): Promise<{id: string; course_id: string; rating: number}> => {
  const res = await apiClient.post<{data: {id: string; course_id: string; rating: number}}>(
    `/courses/${courseId}/feedback`,
    {rating, comments},
  );
  return res.data.data;
};
