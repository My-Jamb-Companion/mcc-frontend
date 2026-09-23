import {apiClient, whenSessionReady} from "@mcc/api";

export interface ApiCourse {
  course_id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  price: number | string;
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
}

/**
 * Endpoint: GET /courses/ (public catalogue)
 *
 * Prices are this student's city tier price, so the request waits for the
 * session's token rather than going out as a visitor's on a fresh page load.
 */
export const getCourses = async (): Promise<ApiCourse[]> => {
  await whenSessionReady();
  const res = await apiClient.get<{data: {courses: ApiCourse[]}}>("/courses/");
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
): Promise<EnrollResult & {checkout_url?: string; tx_ref?: string}> => {
  const res = await apiClient.post<{
    data: EnrollResult & {checkout_url?: string; tx_ref?: string};
  }>("/payments/initialize", {course_id: courseId, course_type: courseType, email});
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/progress */
export const updateCourseProgress = async (
  courseId: string,
  progressPercent: number,
): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/progress`, {
    progress_percent: progressPercent,
  });
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
