import {apiClient} from "@mcc/api";

export interface ApiConversation {
  user_id: string;
  full_name: string | null;
  email: string;
  role: string;
  last_body: string;
  last_direction: "outbound" | "inbound";
  last_at: string;
  message_count: number;
  unread_count: number;
}

export interface ApiConversationList {
  items: ApiConversation[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiThreadMessage {
  message_id: string;
  direction: "outbound" | "inbound";
  subject: string | null;
  body: string;
  delivered: boolean | null;
  sender_name: string | null;
  created_at: string;
  read: boolean;
}

export interface ApiThread {
  user: {user_id: string; full_name: string | null; email: string; role: string};
  messages: ApiThreadMessage[];
}

export interface ConversationFilters {
  q?: string;
  unread?: boolean;
  page?: number;
  limit?: number;
}

/** Endpoint: GET /admin/messages/conversations -- everyone the team has messaged or heard from, most recent first. */
export const listConversations = async (filters: ConversationFilters): Promise<ApiConversationList> =>
  (await apiClient.get<{data: ApiConversationList}>("/admin/messages/conversations", {
    params: {q: filters.q || undefined, unread: filters.unread || undefined, page: filters.page, limit: filters.limit},
  })).data.data;

/** Endpoint: GET /admin/messages/conversations/{userId} -- the whole thread. Opening it marks their messages read. */
export const getConversation = async (userId: string): Promise<ApiThread> =>
  (await apiClient.get<{data: ApiThread}>(`/admin/messages/conversations/${encodeURIComponent(userId)}`)).data.data;

/** Endpoint: GET /admin/messages/unread-count -- messages from students and teachers no admin has opened. */
export const getUnreadMessageCount = async (): Promise<number> =>
  (await apiClient.get<{data: {unread: number}}>("/admin/messages/unread-count")).data.data.unread;
