import { apiClient } from "@mcc/api";

export interface ApiConversationItem {
  conversation_id: string;
  is_session: boolean;
  title: string;
  subject: string | null;
  mode: string | null;
  message_count: number;
  total_tokens: number;
  last_message_at: string | null;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export interface ApiConversationPage {
  items: ApiConversationItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiConversationMessage {
  chat_id: string;
  user_message: string;
  ai_response: string | null;
  timestamp: string;
  total_tokens: number | null;
  model: string | null;
  latency_ms: number | null;
}

export interface ApiConversationDetail {
  conversation_id: string;
  messages: ApiConversationMessage[];
}

/** Endpoint: GET /admin/ai-studio/conversations */
export const listConversations = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiConversationPage> => {
  const res = await apiClient.get<{ data: ApiConversationPage }>(
    "/admin/ai-studio/conversations",
    { params },
  );
  return res.data.data;
};

/** Endpoint: GET /admin/ai-studio/conversations/{id} */
export const getConversation = async (
  conversationId: string,
  isSession: boolean,
): Promise<ApiConversationDetail> => {
  const res = await apiClient.get<{ data: ApiConversationDetail }>(
    `/admin/ai-studio/conversations/${conversationId}`,
    { params: { is_session: isSession } },
  );
  return res.data.data;
};
