import { apiClient } from "@mcc/api";

export interface CopilotReply {
  reply: string;
  generated: boolean;
}

/** Endpoint: POST /admin/copilot/chat */
export const askCopilot = async (message: string): Promise<CopilotReply> => {
  const res = await apiClient.post<{ data: CopilotReply }>("/admin/copilot/chat", { message });
  return res.data.data;
};
