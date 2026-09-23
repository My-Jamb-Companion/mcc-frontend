import { apiClient } from "@mcc/api";

export interface AdvisorReply {
  reply: string;
  generated: boolean;
}

export const askAdvisor = async (childId: string, message: string): Promise<AdvisorReply> => {
  const res = await apiClient.post<{ success: boolean; data: AdvisorReply }>(
    `/parent/children/${childId}/advisor`,
    { message },
    // apiClient's default 10s timeout is sized for ordinary CRUD calls, not
    // a real LLM completion -- gpt-5.6-luna alone can take ~9s, before any
    // retry. 30s gives real headroom without hanging a failed request forever.
    { timeout: 30000 },
  );
  return res.data.data;
};
