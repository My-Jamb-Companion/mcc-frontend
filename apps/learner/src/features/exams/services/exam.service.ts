import {apiClient, whenSessionReady} from "@mcc/api";
import type {ApiGamificationUpdate, ApiProgressUpdate} from "@/src/features/rewards/services/rewards.service";
import type {ApiLessonCompleted, ApiLessonProgress} from "@/src/features/courses/services/course.service";
import type {ApiFormatOffer, LiveFormat} from "@/src/features/courses/helper/liveFormats";

export interface ApiTierPrice {
  tier_id: string;
  tier_name: string;
  price: number | string;
  /** Admin-written line saying who this price is for. Empty when none. */
  description?: string;
}

export interface ApiExamProgram {
  program_id: string;
  exam_name?: string | null;
  subject_name?: string | null;
  subject_id?: string | null;
  description?: string | null;
  price: number | string;
  level: string;
  cover_image_url?: string | null;
  /** Every published tier's price, for a tier picker; empty if nothing is published. */
  tier_prices: ApiTierPrice[];
  /** The live-teaching formats on sale (self-paced, live group, live 1-to-1), each with its tier prices. */
  formats?: ApiFormatOffer[];
}

export interface ProgramListFilters {
  search?: string;
  subject_id?: string;
  level?: string;
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
  /** Admin-authored lesson HTML. Mutually exclusive with video_url. */
  content?: string | null;
  order_index: number;
}

export interface ApiExamModule {
  module_id: string;
  title: string;
  order_index: number;
  lectures: ApiExamLecture[];
  /** How many Exercise questions the module has. `quiz_count` is the same number under its old name. */
  exercise_count?: number;
  quiz_count: number;
  practice_count: number;
}

export interface ApiExamSubTopic {
  sub_topic_id: string;
  title: string;
  description: string | null;
  order_index: number;
  modules: ApiExamModule[];
  /** How many questions the sub-topic's own (unit) Exercise has. `test_count` is the same number under its old name. */
  exercise_count?: number;
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

/** Endpoint: GET /exams/<program_id>/progress -- the lectures already finished, for the ticks after a reload. */
export const getProgramProgress = async (programId: string): Promise<ApiLessonProgress> => {
  const res = await apiClient.get<{data: ApiLessonProgress}>(`/exams/${programId}/progress`);
  return res.data.data;
};

/** Endpoint: POST /exams/<program_id>/lectures/<lecture_id>/complete */
export const completeProgramLecture = async (programId: string, lectureId: string): Promise<ApiLessonCompleted> => {
  const res = await apiClient.post<{data: ApiLessonCompleted}>(`/exams/${programId}/lectures/${lectureId}/complete`);
  return res.data.data;
};

/** Endpoint: POST /exams/<program_id>/progress */
export const updateProgramProgress = async (
  programId: string,
  progressPercent: number,
): Promise<ApiProgressUpdate | undefined> => {
  const res = await apiClient.post<{data?: ApiProgressUpdate}>(`/exams/${programId}/progress`, {
    progress_percent: progressPercent,
  });
  return res.data.data;
};

// --- Practice and Exercise, played one question at a time ------------------
// The questions carry no answers: the server checks each answer, gives hints and shows the answer.

export type AssessmentMode = "practice" | "exercise";

export interface ApiAssessmentQuestion {
  question_id: string;
  question_text: string;
  description?: string | null;
  question_type: string;
  options: string[];
}

export interface ApiAssessmentSession {
  session_id: string;
  mode: AssessmentMode;
  /** The module's or sub-topic's title. */
  title: string;
  node_type: "module" | "sub_topic";
  node_id: string;
  question_count: number;
  questions: ApiAssessmentQuestion[];
  /** Exercise only: minutes allowed (auto-submitted at zero); null = untimed. */
  time_limit_minutes: number | null;
  /** Exercise only: percent needed to pass; null = no pass/fail. */
  passing_score: number | null;
  estimated_minutes: {min: number; max: number};
}

export interface ApiCheckResult {
  is_correct: boolean;
  attempt_no: number;
  /** Right on the first answer with no hint taken: what counts as mastery. */
  first_try: boolean;
  hints_used: number;
  /** Only once the question is answered correctly. */
  correct_answer: string | null;
  explanation: string | null;
  /** Practice: the author's response to the option picked. */
  option_feedback: string | null;
  already_solved: boolean;
}

export interface ApiHint {
  step: number;
  total: number;
  text: string;
  /** The final step works the answer through. */
  last: boolean;
  /** Every step shown so far, oldest first. */
  steps: string[];
}

export interface ApiReveal {
  correct_answer: string;
  explanation: string | null;
}

export interface ApiGradedAnswer {
  question_id: string;
  your_answer: string | null;
  correct_answer: string | null;
  /** Right first time, with no hint before it and no reveal. */
  is_correct: boolean;
  explanation: string | null;
  feedback: string | null;
  /** The author's response to each option, for review. */
  option_feedback?: (string | null)[] | null;
  attempts?: number | null;
  hints_used?: number | null;
  revealed?: boolean | null;
  solved_eventually?: boolean | null;
}

export interface ApiTopicResult {
  node_type: "module" | "sub_topic";
  node_id: string;
  title: string;
  correct: number;
  total: number;
  percent: number;
  /** 0 to 5 in half steps. */
  stars: number;
}

export interface ApiRecommendedLesson {
  module_id: string;
  module_title: string;
  lecture_id: string;
  lecture_title: string;
}

export interface ApiExamSubmissionResult {
  score_percent: number;
  /** What this submission earned: points, daily goal, streak. Absent from older servers. */
  gamification?: ApiGamificationUpdate;
  passing_score?: number | null;
  /** score_percent >= passing_score; null/absent without a pass mark. */
  passed?: boolean | null;
  results: ApiGradedAnswer[];
  topic_breakdown?: ApiTopicResult[];
  recommended_lessons?: ApiRecommendedLesson[];
}

/** Endpoint: POST /exams/assessments/start -- Practice (module) or Exercise (module or sub-topic). */
export const startAssessment = async (
  mode: AssessmentMode,
  node: {moduleId?: string; subTopicId?: string},
): Promise<ApiAssessmentSession> => {
  const res = await apiClient.post<{data: ApiAssessmentSession}>("/exams/assessments/start", {
    mode,
    module_id: node.moduleId,
    sub_topic_id: node.subTopicId,
  });
  return res.data.data;
};

/** Endpoint: POST /exams/assessments/<session_id>/check */
export const checkAssessmentAnswer = async (
  sessionId: string,
  questionId: string,
  answer: string,
): Promise<ApiCheckResult> => {
  const res = await apiClient.post<{data: ApiCheckResult}>(`/exams/assessments/${sessionId}/check`, {
    question_id: questionId,
    answer,
  });
  return res.data.data;
};

/** Endpoint: POST /exams/assessments/<session_id>/hint -- the next hint step. */
export const getAssessmentHint = async (sessionId: string, questionId: string): Promise<ApiHint> => {
  const res = await apiClient.post<{data: ApiHint}>(`/exams/assessments/${sessionId}/hint`, {question_id: questionId});
  return res.data.data;
};

/** Endpoint: POST /exams/assessments/<session_id>/reveal -- skip: show the answer. */
export const revealAssessmentAnswer = async (sessionId: string, questionId: string): Promise<ApiReveal> => {
  const res = await apiClient.post<{data: ApiReveal}>(`/exams/assessments/${sessionId}/reveal`, {question_id: questionId});
  return res.data.data;
};

/** Endpoint: PATCH /exams/submit/<session_id> -- a played session is graded from what happened in it. */
export const submitAssessment = async (sessionId: string): Promise<ApiExamSubmissionResult> => {
  const res = await apiClient.patch<{data: ApiExamSubmissionResult}>(`/exams/submit/${sessionId}`, {});
  return res.data.data;
};

/**
 * Endpoint: GET /exams/programs (public catalogue). Waits for the token, as
 * getCourses does. search/subject_id/level are all optional and
 * independent -- omitting all three is the full unfiltered catalogue.
 */
export const getPrograms = async (filters: ProgramListFilters = {}): Promise<ApiExamProgram[]> => {
  await whenSessionReady();
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.subject_id) params.set("subject_id", filters.subject_id);
  if (filters.level) params.set("level", filters.level);
  const qs = params.toString();
  const res = await apiClient.get<{data: {programs: ApiExamProgram[]}}>(
    `/exams/programs${qs ? `?${qs}` : ""}`,
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
  liveFormat?: LiveFormat,
): Promise<RegisterResult> => {
  const res = await apiClient.post<{data: RegisterResult}>("/exams/register", {
    program_id: programId,
    email,
    tier_id: tierId,
    live_format: liveFormat,
  });
  return res.data.data;
};
