import {apiClient} from "@mcc/api";

export interface ApiMessageTemplate {
  template_id: string;
  name: string;
  subject: string;
  body: string;
}

interface SendMessagePayload {
  recipient_id: string;
  body?: string;
  template_id?: string;
  subject?: string;
}

/**
 * Sends a message to a student or teacher.
 * Endpoint: POST /admin/messages
 */
export const sendMessage = async (
  payload: SendMessagePayload,
): Promise<{message_id: string; delivered: boolean}> => {
  const res = await apiClient.post<{
    data: {message_id: string; recipient_id: string; delivered: boolean};
  }>("/admin/messages", payload);

  return res.data.data;
};

/**
 * Lists message templates for the Send Message template picker.
 * Endpoint: GET /admin/messages/templates
 */
export const listMessageTemplates = async (): Promise<ApiMessageTemplate[]> => {
  const res = await apiClient.get<{data: ApiMessageTemplate[]}>(
    "/admin/messages/templates",
  );

  return res.data.data;
};
