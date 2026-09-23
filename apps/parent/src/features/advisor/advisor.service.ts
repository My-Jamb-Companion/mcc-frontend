import { apiClient } from "@mcc/api";

export interface AdvisorReply {
  reply: string;
  generated: boolean;
}

export const askAdvisor = async (childId: string, message: string): Promise<AdvisorReply> => {
  const res = await apiClient.post<{ success: boolean; data: AdvisorReply }>(
    `/parent/children/${childId}/advisor`,
    { message },
  );
  return res.data.data;
};
