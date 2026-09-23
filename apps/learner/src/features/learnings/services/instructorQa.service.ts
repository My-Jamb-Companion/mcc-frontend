import {apiClient} from "@mcc/api";

export interface ApiInstructorMessage {
  message_id: string;
  sender_role: "student" | "instructor";
  body: string;
  timestamp_seconds?: number | null;
  status: "delivered" | "seen" | "replied";
  created_at: string;
}

/** Endpoint: GET /courses/<course_id>/instructor/messages -- the caller's own thread. */
export const getInstructorThread = async (courseId: string): Promise<ApiInstructorMessage[]> => {
  const res = await apiClient.get<{data: ApiInstructorMessage[]}>(
    `/courses/${courseId}/instructor/messages`,
  );
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/instructor/messages */
export const sendInstructorMessage = async (
  courseId: string,
  body: string,
  timestampSeconds?: number,
): Promise<{message_id: string}> => {
  const res = await apiClient.post<{data: {message_id: string}}>(
    `/courses/${courseId}/instructor/messages`,
    {body, timestamp_seconds: timestampSeconds},
  );
  return res.data.data;
};

/** Endpoint: POST /courses/<course_id>/instructor/messages/<message_id>/report */
export const reportInstructorMessage = async (
  courseId: string,
  messageId: string,
  reason: string,
): Promise<void> => {
  await apiClient.post(`/courses/${courseId}/instructor/messages/${messageId}/report`, {reason});
};
