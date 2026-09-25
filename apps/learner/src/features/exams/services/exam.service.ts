import {apiClient, whenSessionReady} from "@mcc/api";

export interface ApiTierPrice {
  tier_id: string;
  tier_name: string;
  price: number | string;
}

export interface ApiExamProgram {
  program_id: string;
  exam_name?: string | null;
  subject_name?: string | null;
  description?: string | null;
  price: number | string;
  level: string;
  cover_image_url?: string | null;
  /** Every published tier's price, for a tier picker; empty if nothing is published. */
  tier_prices: ApiTierPrice[];
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

/** Endpoint: GET /exams/programs (public catalogue). Waits for the token, as getCourses does. */
export const getPrograms = async (): Promise<ApiExamProgram[]> => {
  await whenSessionReady();
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
  tierId?: string,
): Promise<RegisterResult> => {
  const res = await apiClient.post<{data: RegisterResult}>("/exams/register", {
    program_id: programId,
    email,
    tier_id: tierId,
  });
  return res.data.data;
};
