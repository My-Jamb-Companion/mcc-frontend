import { apiClient } from "@mcc/api";

export interface EnrollmentResult {
  // Courses: enrollment_id/enrollment_status. Exam prep: access_id/status.
  // Both shapes carry is_paid, and the same checkout fields when paid.
  enrollment_id?: string;
  enrollment_status?: string;
  access_id?: string;
  status?: string;
  is_paid: boolean;
  redirect_url?: string;
  checkout_url?: string;
  amount?: number;
  billing_email?: string;
}

/** POST /payments/initialize — free or paid course, real Flutterwave checkout for paid. */
export const initializeCoursePayment = async (
  courseId: string,
  courseType: "free" | "paid",
  email?: string
): Promise<EnrollmentResult> => {
  const res = await apiClient.post<{ success: boolean; data: EnrollmentResult }>(
    "/payments/initialize",
    { course_id: courseId, course_type: courseType, email }
  );
  return res.data.data;
};

/** POST /exams/register — free or paid exam-prep program. */
export const registerForExamProgram = async (
  programId: string,
  email?: string
): Promise<EnrollmentResult> => {
  const res = await apiClient.post<{ success: boolean; data: EnrollmentResult }>(
    "/exams/register",
    { program_id: programId, email }
  );
  return res.data.data;
};
