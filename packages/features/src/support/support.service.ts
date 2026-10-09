import {apiClient} from "@mcc/api";

export interface ApiSupportMessage {
  message_id: string;
  /** outbound = from the MCC team to the caller, inbound = from the caller to the team. */
  direction: "outbound" | "inbound";
  subject?: string | null;
  body: string;
  sender_name?: string | null;
  created_at: string;
  read: boolean;
}

export interface ApiSupportThread {
  messages: ApiSupportMessage[];
  /** How many of the team's messages were unread before this call. */
  unread: number;
}

/** Endpoint: GET /support/messages -- the caller's conversation with the MCC team. Opening it marks the team's messages read. */
export const getSupportThread = async (): Promise<ApiSupportThread> =>
  (await apiClient.get<{data: ApiSupportThread}>("/support/messages")).data.data;

/** Endpoint: POST /support/messages -- write to the MCC team. */
export const sendSupportMessage = async (body: string): Promise<{message_id: string}> =>
  (await apiClient.post<{data: {message_id: string}}>("/support/messages", {body})).data.data;

/** Endpoint: GET /support/messages/unread-count -- the team's messages the caller has not opened. */
export const getSupportUnread = async (): Promise<number> =>
  (await apiClient.get<{data: {unread: number}}>("/support/messages/unread-count")).data.data.unread;
