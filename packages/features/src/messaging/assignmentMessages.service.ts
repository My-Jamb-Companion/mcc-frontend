import {apiClient} from "@mcc/api";

export interface ApiAssignmentMessage {
  message_id: string;
  sender_role: "student" | "cra";
  body: string;
  created_at: string;
}

/** Endpoint: GET /assignment/{assignmentId}/messages -- the student's thread with their coordinator, oldest first. */
export const getAssignmentThread = async (assignmentId: string): Promise<ApiAssignmentMessage[]> => {
  const res = await apiClient.get<{data: {messages: ApiAssignmentMessage[]}}>(
    `/assignment/${encodeURIComponent(assignmentId)}/messages`,
  );
  return res.data.data.messages;
};

/** Endpoint: POST /assignment/{assignmentId}/messages */
export const postAssignmentMessage = async (assignmentId: string, body: string): Promise<{message_id: string}> => {
  const res = await apiClient.post<{data: {message_id: string}}>(
    `/assignment/${encodeURIComponent(assignmentId)}/messages`,
    {body},
  );
  return res.data.data;
};
