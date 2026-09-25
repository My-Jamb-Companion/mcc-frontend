import {apiClient} from "@mcc/api";

export interface ApiSeriesMessage {
  message_id: string;
  sender_role: "student" | "teacher";
  body: string;
  created_at: string;
}

/** Endpoint: GET /assignment/series/{seriesId}/messages -- the shared 1:1
 * thread for a CRA/teacher-assigned series (no course in common). */
export const getSeriesThread = async (seriesId: string): Promise<ApiSeriesMessage[]> => {
  const res = await apiClient.get<{data: {messages: ApiSeriesMessage[]}}>(
    `/assignment/series/${encodeURIComponent(seriesId)}/messages`,
  );
  return res.data.data.messages;
};

/** Endpoint: POST /assignment/series/{seriesId}/messages */
export const postSeriesMessage = async (
  seriesId: string,
  body: string,
): Promise<{message_id: string}> => {
  const res = await apiClient.post<{data: {message_id: string}}>(
    `/assignment/series/${encodeURIComponent(seriesId)}/messages`,
    {body},
  );
  return res.data.data;
};
