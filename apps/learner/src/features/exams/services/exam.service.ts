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
  /** Practice questions across every set. */
  practice_count: number;
  /** The module's Practice sets in the order authored; the default set is called "Practice". Absent on an older server. */
  practice_sets?: ApiPracticeSet[];
}

export interface ApiPracticeSet {
  name: string;
  count: number;
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
  /** Practice: the set being played, when one was chosen. */
  set_name?: string | null;
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

export interface ApiLevelUp {
  node_id: string;
  title: string;
  from: ReadinessLevel;
  to: ReadinessLevel;
}

/** What a played session did to the program's readiness. */
export interface ApiSessionReadiness {
  readiness_percent: number;
  readiness_before: number;
  leveled_up: ApiLevelUp[];
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
  readiness?: ApiSessionReadiness | null;
}

/** Endpoint: POST /exams/assessments/start -- Practice (module) or Exercise (module or sub-topic). */
export const startAssessment = async (
  mode: AssessmentMode,
  node: {moduleId?: string; subTopicId?: string; practiceSet?: string},
): Promise<ApiAssessmentSession> => {
  const res = await apiClient.post<{data: ApiAssessmentSession}>("/exams/assessments/start", {
    mode,
    module_id: node.moduleId,
    sub_topic_id: node.subTopicId,
    ...(node.practiceSet ? {practice_set: node.practiceSet} : {}),
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

// --- Mastery and readiness ---------------------------------------------------

export type ReadinessLevel = "not_started" | "attempted" | "familiar" | "proficient" | "ready";

export interface ApiReadinessTile {
  node_type: "module" | "sub_topic";
  node_id: string;
  title: string;
  level: ReadinessLevel;
  /** 0 to 1: share of the topic's questions played x share of those right first time. */
  score: number;
  answered: number;
  total: number;
}

export interface ApiReadinessUnit {
  sub_topic_id: string;
  title: string;
  topic_title: string;
  tiles: ApiReadinessTile[];
}

export interface ApiPredictedScore {
  available: boolean;
  /** Percent. */
  low: number | null;
  high: number | null;
  confidence: "low" | "medium" | "high" | null;
  answered: number;
  /** Questions that must be answered before a range is shown. */
  needed: number;
  /** How many of the latest mock exams the estimate leans on; they count for more than practice. */
  mocks?: number;
  /** Why there is no range yet. */
  message: string | null;
}

export interface ApiWeakTopic {
  node_type: "module" | "sub_topic";
  node_id: string;
  title: string;
  level: ReadinessLevel;
  score: number;
  /** A lecture to revisit. */
  lecture_id: string | null;
}

export interface ApiProgramReadiness {
  program_id: string;
  readiness_percent: number;
  answered: number;
  total: number;
  units: ApiReadinessUnit[];
  predicted: ApiPredictedScore;
  weakest: ApiWeakTopic[];
  levels: Partial<Record<ReadinessLevel, number>>;
}

export interface ApiReadinessSummary {
  program_id: string;
  exam_name?: string | null;
  subject_name?: string | null;
  readiness_percent: number;
  answered: number;
  predicted: ApiPredictedScore;
}

/** Endpoint: GET /exams/<program_id>/readiness */
export const getProgramReadiness = async (programId: string): Promise<ApiProgramReadiness> => {
  const res = await apiClient.get<{data: ApiProgramReadiness}>(`/exams/${programId}/readiness`);
  return res.data.data;
};

/** Endpoint: GET /exams/readiness -- readiness for each registered program, for the dashboard. */
export const getReadinessOverview = async (): Promise<ApiReadinessSummary[]> => {
  const res = await apiClient.get<{data: {programs: ApiReadinessSummary[]}}>("/exams/readiness");
  return res.data.data.programs;
};


// --- Mock exams --------------------------------------------------------------

export interface ApiMockPaper {
  paper_id: string;
  title: string;
  description: string | null;
  mode: "auto" | "fixed";
  duration_minutes: number;
  question_count: number;
  passing_score: number | null;
  /** A paper for paid students only, and the registration is free. */
  locked: boolean;
  attempts: number;
  best_percent: number | null;
  last_percent: number | null;
  /** An attempt that can still be resumed. */
  in_progress: {session_id: string; remaining_seconds: number} | null;
}

export interface ApiMockPaperInfo {
  paper_id: string;
  title: string;
  description?: string | null;
  duration_minutes: number;
  passing_score: number | null;
}

export interface ApiMockQuestion {
  question_id: string;
  question_text: string;
  description: string | null;
  /** Directions shown above the question. */
  instruction?: string | null;
  /** A reading passage the question refers to; questions that share one come together. */
  passage?: string | null;
  question_type: string;
  options: string[];
}

/** What is autosaved as the student goes. An answer is the option picked (a list for multiple choice). */
export interface ApiMockState {
  answers: Record<string, string | string[]>;
  flagged: string[];
  spent: Record<string, number>;
  current: number;
}

export interface ApiMockSession {
  session_id: string;
  paper: ApiMockPaperInfo;
  questions: ApiMockQuestion[];
  /** By the server's clock: count down from this, not from the device's. */
  remaining_seconds: number;
  deadline_at: string | null;
  state: ApiMockState;
}

export interface ApiMockReviewRow {
  question_id: string;
  question_text: string;
  instruction?: string | null;
  passage?: string | null;
  question_type: string;
  options: string[];
  your_answer: string | string[] | null;
  correct_answer: string;
  is_correct: boolean;
  explanation: string | null;
  option_feedback?: (string | null)[] | null;
  seconds: number;
  flagged: boolean;
}

export interface ApiMockTopicResult {
  node_type: "module" | "sub_topic" | "topic" | "general";
  node_id: string;
  title: string;
  correct: number;
  total: number;
  percent: number;
  stars: number;
}

export interface ApiMockResult {
  session_id: string;
  finished: true;
  paper: ApiMockPaperInfo;
  score_percent: number;
  correct: number;
  total: number;
  passed: boolean | null;
  seconds_used: number;
  topic_breakdown: ApiMockTopicResult[];
  results: ApiMockReviewRow[];
  gamification?: ApiGamificationUpdate | null;
  readiness?: ApiSessionReadiness | null;
}

export interface ApiMockAttempt {
  session_id: string;
  total: number;
  correct: number;
  percent: number;
  passed: boolean | null;
  seconds_used: number;
  finished_at: string;
}

/** Changes since the last save; every part is optional. */
export interface ApiMockStateUpdate {
  answers?: Record<string, string | string[] | null>;
  flagged?: string[];
  spent?: Record<string, number>;
  current?: number;
}

/** Endpoint: GET /exams/<program_id>/mocks */
export const getMockPapers = async (programId: string): Promise<ApiMockPaper[]> => {
  const res = await apiClient.get<{data: {papers: ApiMockPaper[]}}>(`/exams/${programId}/mocks`);
  return res.data.data.papers;
};

/** Endpoint: POST /exams/mocks/<paper_id>/start -- begins an attempt, or resumes the one in progress. */
export const startMockExam = async (paperId: string): Promise<ApiMockSession> => {
  const res = await apiClient.post<{data: ApiMockSession}>(`/exams/mocks/${paperId}/start`);
  return res.data.data;
};

/** Endpoint: GET /exams/mocks/sessions/<session_id> -- an attempt in progress, or its result once finished. */
export const getMockSession = async (sessionId: string): Promise<ApiMockSession | ApiMockResult> => {
  const res = await apiClient.get<{data: ApiMockSession | ApiMockResult}>(`/exams/mocks/sessions/${sessionId}`);
  return res.data.data;
};

/** Endpoint: PUT /exams/mocks/sessions/<session_id>/state -- autosave. */
export const saveMockState = async (
  sessionId: string,
  update: ApiMockStateUpdate,
): Promise<{saved: boolean; remaining_seconds: number}> => {
  const res = await apiClient.put<{data: {saved: boolean; remaining_seconds: number}}>(
    `/exams/mocks/sessions/${sessionId}/state`,
    update,
  );
  return res.data.data;
};

/** Endpoint: POST /exams/mocks/sessions/<session_id>/submit */
export const submitMockExam = async (sessionId: string, update?: ApiMockStateUpdate): Promise<ApiMockResult> => {
  const res = await apiClient.post<{data: ApiMockResult}>(`/exams/mocks/sessions/${sessionId}/submit`, update ?? {});
  return res.data.data;
};

/** Endpoint: GET /exams/mocks/<paper_id>/attempts */
export const getMockAttempts = async (paperId: string): Promise<ApiMockAttempt[]> => {
  const res = await apiClient.get<{data: {attempts: ApiMockAttempt[]}}>(`/exams/mocks/${paperId}/attempts`);
  return res.data.data.attempts;
};
