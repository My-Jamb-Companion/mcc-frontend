import {apiClient} from "@mcc/api";

export interface ApiExamProgram {
  program_id: string;
  exam_name?: string | null;
  subject_name?: string | null;
  description?: string | null;
  price: number | string;
  level: string;
  cover_image_url?: string | null;
}

export interface ApiEnrolledProgram {
  program_id: string;
  exam_name?: string | null;
  subject_name?: string | null;
  cover_image_url?: string | null;
  progress_percent: number;
  completed_at?: string | null;
}

export interface RegisterResult {
  access_id: string;
  status: string;
  is_paid: boolean;
  redirect_url?: string;
  amount?: number;
  checkout_url?: string;
  tx_ref?: string;
  payment_status?: string;
}

/** Endpoint: GET /exams/programs (public catalogue) */
export const getPrograms = async (): Promise<ApiExamProgram[]> => {
  const res = await apiClient.get<{data: {programs: ApiExamProgram[]}}>(
    "/exams/programs",
  );
  return res.data.data.programs;
};

/** Endpoint: GET /exams/enrolled */
export const getEnrolledPrograms = async (): Promise<ApiEnrolledProgram[]> => {
  const res = await apiClient.get<{data: {programs: ApiEnrolledProgram[]}}>(
    "/exams/enrolled",
  );
  return res.data.data.programs;
};

/** Endpoint: POST /exams/register -- handles both free and paid programs,
 * including opening a real Flutterwave checkout for paid ones. */
export const registerForProgram = async (
  programId: string,
  email?: string,
): Promise<RegisterResult> => {
  const res = await apiClient.post<{data: RegisterResult}>("/exams/register", {
    program_id: programId,
    email,
  });
  return res.data.data;
};
