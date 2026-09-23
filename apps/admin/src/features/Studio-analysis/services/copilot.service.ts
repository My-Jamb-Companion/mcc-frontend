import { apiClient } from "@mcc/api";

export interface CopilotReply {
  reply: string;
  generated: boolean;
}

/** Endpoint: POST /admin/copilot/chat */
export const askCopilot = async (message: string): Promise<CopilotReply> => {
  const res = await apiClient.post<{ data: CopilotReply }>(
    "/admin/copilot/chat",
    { message },
    // apiClient's default 10s timeout is sized for ordinary CRUD calls, not
    // a real LLM completion -- gpt-5.6-luna alone can take ~9s, before any
    // retry. 30s gives real headroom without hanging a failed request forever.
    { timeout: 30000 },
  );
  return res.data.data;
};
