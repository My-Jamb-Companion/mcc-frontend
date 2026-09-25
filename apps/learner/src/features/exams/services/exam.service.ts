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

// --- Content tree (topic -> sub-topic -> module -> lecture) ----------------

export interface ApiExamLecture {
  lecture_id: string;
  title: string;
  video_url: string | null;
  order_index: number;
}

export interface ApiExamModule {
  module_id: string;
  title: string;
  order_index: number;
  lectures: ApiExamLecture[];
  quiz_count: number;
  practice_count: number;
}

export interface ApiExamSubTopic {
  sub_topic_id: string;
  title: string;
  description: string | null;
  order_index: number;
  modules: ApiExamModule[];
  test_count: number;
}

export interface ApiExamTopic {
  topic_id: string;
  title: string;
  order_index: number;
  sub_topics: ApiExamSubTopic[];
}

/** Endpoint: GET /exams/<program_id>/content */
export const getProgramContent = async (programId: string): Promise<ApiExamTopic[]> => {
  const res = await apiClient.get<{data: {topics: ApiExamTopic[]}}>(
    `/exams/${programId}/content`,
  );
  return res.data.data.topics;
};

/** Endpoint: POST /exams/<program_id>/progress */
export const updateProgramProgress = async (
  programId: string,
  progressPercent: number,
): Promise<void> => {
  await apiClient.post(`/exams/${programId}/progress`, {progress_percent: progressPercent});
};

// --- Quiz / practice / mock-exam sessions -----------------------------------

export interface ApiExamQuestion {
  question_id: string;
  question_text: string;
  options: string[];
  explanation: string | null;
  correct_option: string | null;
}

export interface ApiExamSession {
  session_id: string;
  subject: string;
  questions: ApiExamQuestion[];
}

export interface ApiGradedAnswer {
  question_id: string;
  your_answer: string | null;
  correct_answer: string | null;
  is_correct: boolean;
  explanation: string | null;
  feedback: string | null;
}

export interface ApiExamSubmissionResult {
  score_percent: number;
  results: ApiGradedAnswer[];
}

/**
 * Starts a quiz or practice session. moduleId scopes it to that module's own
 * curated questions; omit it for a random pull across the whole subject.
 */
export const startModuleSession = async (
  kind: "quiz" | "practice",
  subject: string,
  moduleId?: string,
): Promise<ApiExamSession> => {
  const res = await apiClient.post<{data: ApiExamSession}>(`/exams/${kind === "quiz" ? "quiz" : "mock/practice"}`, {
    subject,
    module_id: moduleId,
  });
  return res.data.data;
};

/**
 * Starts a full mock-exam (test) session. subTopicId scopes it to that
 * sub-topic's own curated test questions; omit it for a random pull.
 */
export const startMockExam = async (
  subject: string,
  subTopicId?: string,
  limit?: number,
): Promise<ApiExamSession> => {
  const res = await apiClient.post<{data: ApiExamSession}>("/exams/mock/start", {
    subject,
    sub_topic_id: subTopicId,
    limit,
  });
  return res.data.data;
};

/**
 * Endpoint: PATCH /exams/submit/<session_id>?type=quiz|practice|exam --
 * `type` selects which activity_type the result is recorded under.
 */
export const submitExamSession = async (
  sessionId: string,
  answers: Record<string, string>,
  type: "quiz" | "practice" | "exam" = "exam",
): Promise<ApiExamSubmissionResult> => {
  const res = await apiClient.patch<{data: ApiExamSubmissionResult}>(
    `/exams/submit/${sessionId}`,
    {answers},
    {params: {type}},
  );
  return res.data.data;
};

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
