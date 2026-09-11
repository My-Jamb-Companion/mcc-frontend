import { apiClient } from "@mcc/api";

export interface TeacherCourse {
  course_id: string;
  title: string;
}

export interface ThreadSummary {
  student_id: string;
  student_name: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface ThreadMessage {
  message_id: string;
  sender_role: "student" | "instructor";
  body: string;
  timestamp_seconds: number | null;
  status: "delivered" | "seen" | "replied";
  created_at: string;
}

export const getCourses = async (): Promise<TeacherCourse[]> => {
  const res = await apiClient.get<{ success: boolean; data: { courses: TeacherCourse[] } }>(
    "/teacher/courses",
  );
  return res.data.data.courses;
};

export const getThreads = async (courseId: string): Promise<ThreadSummary[]> => {
  const res = await apiClient.get<{ success: boolean; data: { threads: ThreadSummary[] } }>(
    `/courses/${courseId}/instructor/threads`,
  );
  return res.data.data.threads;
};

export const getStudentThread = async (
  courseId: string,
  studentId: string,
): Promise<ThreadMessage[]> => {
  const res = await apiClient.get<{ success: boolean; data: ThreadMessage[] }>(
    `/courses/${courseId}/instructor/threads/${studentId}`,
  );
  return res.data.data;
};

export const replyToStudent = async (
  courseId: string,
  studentId: string,
  body: string,
): Promise<{ message_id: string }> => {
  const res = await apiClient.post<{ success: boolean; data: { message_id: string } }>(
    `/courses/${courseId}/instructor/threads/${studentId}/reply`,
    { body },
  );
  return res.data.data;
};

export const reportMessage = async (
  courseId: string,
  messageId: string,
  reason: string,
): Promise<{ id: string; status: string }> => {
  const res = await apiClient.post<{ success: boolean; data: { id: string; status: string } }>(
    `/courses/${courseId}/instructor/messages/${messageId}/report`,
    { reason },
  );
  return res.data.data;
};
