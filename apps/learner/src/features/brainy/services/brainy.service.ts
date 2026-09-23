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

export const getAllowance = async (): Promise<ApiAllowance> =>
  (await apiClient.get<{data: ApiAllowance}>("/brainy/allowance")).data.data;

export interface ApiChatReply {
  chat_id: string;
  reply: string;
  generated: boolean;
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

/** Endpoint: DELETE /brainy/sessions/<id> */
export const deleteSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/brainy/sessions/${sessionId}`);
};
