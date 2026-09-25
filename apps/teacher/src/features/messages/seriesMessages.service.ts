import { apiClient } from "@mcc/api";

export interface SeriesMessage {
  message_id: string;
  sender_role: "student" | "teacher";
  body: string;
  created_at: string;
}

/** Endpoint: GET /assignment/series/{seriesId}/messages -- the shared 1:1
 * thread for a CRA/teacher-assigned series (no course in common). */
export const getSeriesThread = async (seriesId: string): Promise<SeriesMessage[]> => {
  const res = await apiClient.get<{ success: boolean; data: { messages: SeriesMessage[] } }>(
    `/assignment/series/${encodeURIComponent(seriesId)}/messages`,
  );
  return res.data.data.messages;
};

/** Endpoint: POST /assignment/series/{seriesId}/messages */
export const postSeriesMessage = async (
  seriesId: string,
  body: string,
): Promise<{ message_id: string }> => {
  const res = await apiClient.post<{ success: boolean; data: { message_id: string } }>(
    `/assignment/series/${encodeURIComponent(seriesId)}/messages`,
    { body },
  );
  return res.data.data;
};
