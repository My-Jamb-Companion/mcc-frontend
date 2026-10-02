import {apiClient} from "@mcc/api";

export type BrainyModeApi = "research" | "assignment" | "exam";

/**
 * What one completion cost, as the provider reported it. `attempts` is the
 * backend's own count -- a call retried past a rate limit took more than one
 * round trip, which is the only thing that explains a long latency.
 */
export interface ApiTokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  model?: string | null;
  latency_ms?: number | null;
  attempts?: number;
}

/** How one answered job was paid for (pricing model build step 6). */
export interface ApiJobCharge {
  free_tokens: number;
  allowance_tokens: number;
  gem_tokens: number;
  gems_charged: number;
  /** Gems the answer needed but the student didn't hold; not taken later. */
  gems_short: number;
}

/** Endpoint: GET /brainy/allowance -- what the student has left. */
export interface ApiAllowance {
  /** False for non-students, or before pricing is set up: nothing is charged. */
  metered: boolean;
  free_daily_tokens?: number | null;
  free_used_today?: number | null;
  free_left_today?: number | null;
  monthly_allowance_tokens?: number | null;
  paid_enrolments?: number | null;
  allowance_used_this_month?: number | null;
  allowance_left_this_month?: number | null;
  tokens_per_gem?: number | null;
  gems: number;
  earned_gems: number;
  purchased_gems: number;
  free_resets_at?: string | null;
  allowance_resets_at?: string | null;
}

/** Shown instead of the backend's "please try again" fallback when retrying cannot help. */
export const UNAVAILABLE_NOTICE =
  "Brainy is unavailable right now because of a problem on our side, not anything you did. " +
  "Retrying won't help yet -- please check back later.";

/** True when a failed reply is one the student can usefully retry. */
export const isRetryable = (result: Pick<ApiChatReply, "generated" | "failure">): boolean =>
  result.generated || result.failure !== "unavailable";

/** The text to show for a reply: the real answer, or honest copy for a failure that retrying cannot fix. */
export const chatReplyText = (result: ApiChatReply): string =>
  isRetryable(result) ? result.reply : UNAVAILABLE_NOTICE;

export const getAllowance = async (): Promise<ApiAllowance> =>
  (await apiClient.get<{data: ApiAllowance}>("/brainy/allowance")).data.data;

export interface ApiChatReply {
  chat_id: string;
  reply: string;
  generated: boolean;
  /**
   * Set only when `generated` is false. "busy" is transient -- retrying can
   * work. "unavailable" means the same request will keep failing until an
   * admin fixes configuration, the provider wallet or the model, so the
   * student should not be invited to retry.
   */
  failure?: "busy" | "unavailable" | null;
  /** Null when `generated` is false -- there was no completion to bill. */
  usage?: ApiTokenUsage | null;
  /** Null when nothing was metered. */
  charge?: ApiJobCharge | null;
}

export interface ApiChatHistoryItem {
  chat_id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
  /** Null for exchanges stored before token accounting, and for failed turns. */
  usage?: ApiTokenUsage | null;
  charge?: ApiJobCharge | null;
}

/** Endpoint: GET /brainy/usage -- the caller's own consumption. */
export interface ApiUsageSummary {
  tokens_today: number;
  jobs_today: number;
  tokens_30d: number;
  jobs_30d: number;
}

export interface ApiAttachment {
  filename: string;
  text: string;
}

export interface ApiAttachmentExtracted extends ApiAttachment {
  /** True when the document exceeded the prompt budget and was cut. */
  truncated: boolean;
}

export interface ApiSession {
  session_id: string;
  title: string;
  mode: BrainyModeApi;
  subject?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiSessionDetail extends ApiSession {
  messages: ApiChatHistoryItem[];
}

/**
 * Endpoint: POST /brainy/chats
 *
 * Pass `sessionId` to file this exchange under a thread (so it survives
 * logout and reappears in the sidebar); omit it for a one-off. `attachments`
 * carries text already extracted by uploadAttachment below -- the file itself
 * is never uploaded with the message.
 */
export const sendChatMessage = async (
  message: string,
  options: {
    sessionId?: string;
    attachments?: ApiAttachment[];
    context?: Record<string, unknown>;
  } = {},
): Promise<ApiChatReply> => {
  const res = await apiClient.post<{data: ApiChatReply}>(
    "/brainy/chats",
    {
      message,
      context: options.context ?? {},
      session_id: options.sessionId,
      attachments: options.attachments ?? [],
    },
    // apiClient's default 10s timeout is sized for ordinary CRUD calls, not
    // a real LLM completion -- gpt-5.6-luna alone can take ~9s, before any
    // retry. 30s gives real headroom without hanging a failed request forever.
    {timeout: 30000},
  );
  return res.data.data;
};

/**
 * Endpoint: POST /brainy/attachments -- multipart.
 *
 * The backend extracts prompt-ready text and returns it; the file is not
 * stored anywhere. Only .pdf/.txt/.md are accepted -- anything else comes
 * back as a 400 whose message names what to use instead.
 */
export const uploadAttachment = async (
  file: File,
): Promise<ApiAttachmentExtracted> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{data: ApiAttachmentExtracted}>(
    "/brainy/attachments",
    formData,
    {headers: {"Content-Type": "multipart/form-data"}},
  );
  return res.data.data;
};

/** Endpoint: GET /brainy/chats -- 50 most recent, newest first. */
export const getChatHistory = async (): Promise<ApiChatHistoryItem[]> => {
  const res = await apiClient.get<{data: ApiChatHistoryItem[]}>("/brainy/chats");
  return res.data.data;
};

/** Endpoint: DELETE /brainy/chats/<chat_id> */
export const deleteChat = async (chatId: string): Promise<void> => {
  await apiClient.delete(`/brainy/chats/${chatId}`);
};

/** Endpoint: GET /brainy/sessions -- the user's threads, most recent first. */
export const getSessions = async (): Promise<ApiSession[]> => {
  const res = await apiClient.get<{data: ApiSession[]}>("/brainy/sessions");
  return res.data.data;
};

/** Endpoint: GET /brainy/sessions/<id> -- thread plus messages, oldest first. */
export const getSession = async (sessionId: string): Promise<ApiSessionDetail> => {
  const res = await apiClient.get<{data: ApiSessionDetail}>(
    `/brainy/sessions/${sessionId}`,
  );
  return res.data.data;
};

/** Endpoint: POST /brainy/sessions */
export const createSession = async (input: {
  title: string;
  mode: BrainyModeApi;
  subject?: string;
}): Promise<ApiSession> => {
  const res = await apiClient.post<{data: ApiSession}>("/brainy/sessions", input);
  return res.data.data;
};

/** Endpoint: GET /brainy/usage */
export const getUsageSummary = async (): Promise<ApiUsageSummary> => {
  const res = await apiClient.get<{data: ApiUsageSummary}>("/brainy/usage");
  return res.data.data;
};

export interface CourseSuggestion {
  course_id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
}

/** Endpoint: GET /brainy/recommendations/courses?q= -- embedding-based,
 * self-hosted (unaffected by whether a generation provider is
 * configured). Empty content when nothing clears the relevance
 * threshold. */
export const getCourseRecommendations = async (query: string): Promise<CourseSuggestion[]> => {
  const res = await apiClient.get<{data: {content: CourseSuggestion[]}}>(
    "/brainy/recommendations/courses",
    {params: {q: query}},
  );
  return res.data.data.content;
};

/** Endpoint: GET /brainy/discover -- published catalogue sample, no
 * embedding involved. */
export const getDiscoverContent = async (): Promise<CourseSuggestion[]> => {
  const res = await apiClient.get<{data: {discover: CourseSuggestion[]}}>("/brainy/discover");
  return res.data.data.discover;
};

/** Endpoint: GET /brainy/prompts/suggestions -- static hardcoded list, not
 * personalised or AI-generated. */
export const getPromptSuggestions = async (): Promise<string[]> => {
  const res = await apiClient.get<{data: {suggestions: string[]}}>("/brainy/prompts/suggestions");
  return res.data.data.suggestions;
};

export interface ApiAnalysisResult {
  feedback: string;
  generated: boolean;
  charge?: ApiJobCharge | null;
}

/** Endpoint: POST /brainy/analysis -- blends the supplied session numbers
 * with the student's real history; subjects recently averaging under 50%
 * are folded into weak_topics even if the caller didn't send them. */
export const getAnalysis = async (input: {
  total_questions: number;
  correct_answers: number;
  subject?: string;
  weak_topics?: string[];
}): Promise<ApiAnalysisResult> => {
  const res = await apiClient.post<{data: ApiAnalysisResult}>("/brainy/analysis", input, {
    timeout: 30000,
  });
  return res.data.data;
};

export interface ApiAssistanceResult {
  explanation: string;
  generated: boolean;
  charge?: ApiJobCharge | null;
}

/** Endpoint: POST /brainy/help -- an explanation for one specific
 * question, by id. */
export const getQuestionHelp = async (questionId: string): Promise<ApiAssistanceResult> => {
  const res = await apiClient.post<{data: ApiAssistanceResult}>(
    "/brainy/help",
    {question_id: questionId},
    {timeout: 30000},
  );
  return res.data.data;
};

/** Endpoint: DELETE /brainy/sessions/<id> */
export const deleteSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/brainy/sessions/${sessionId}`);
};
