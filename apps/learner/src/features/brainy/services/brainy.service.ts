import {apiClient} from "@mcc/api";

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

/**
 * Endpoint: POST /brainy/chats -- one-shot Q&A, not a continuing thread:
 * the backend has no chat_id-continuation param, each call is scored
 * against the student's own course/exam/quiz history independently.
 */
export const sendChatMessage = async (
  message: string,
  context: Record<string, unknown> = {},
): Promise<ApiChatReply> => {
  const res = await apiClient.post<{data: ApiChatReply}>("/brainy/chats", {
    message,
    context,
  });
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
