import {apiClient} from "@mcc/api";

export type BrainyModeApi = "research" | "assignment" | "exam";

export interface ApiChatReply {
  chat_id: string;
  reply: string;
  generated: boolean;
}

export interface ApiChatHistoryItem {
  chat_id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
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
  const res = await apiClient.post<{data: ApiChatReply}>("/brainy/chats", {
    message,
    context: options.context ?? {},
    session_id: options.sessionId,
    attachments: options.attachments ?? [],
  });
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

/** Endpoint: DELETE /brainy/sessions/<id> */
export const deleteSession = async (sessionId: string): Promise<void> => {
  await apiClient.delete(`/brainy/sessions/${sessionId}`);
};
