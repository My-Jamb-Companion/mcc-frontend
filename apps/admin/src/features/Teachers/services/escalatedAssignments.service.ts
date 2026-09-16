import {apiClient} from "@mcc/api";

export interface EscalatedAssignment {
  assignment_id: string;
  student_name: string | null;
  student_email: string;
  purpose: "course" | "exam";
  target_id: string;
  subject_name: string | null;
  weekly_day_of_week: number | null;
  weekly_start_time: string | null;
  weekly_duration_minutes: number | null;
  escalated_at: string;
}

/**
 * Lists students stuck at teacher_escalated -- the auto-matcher found no
 * available, subject-matched teacher for their onboarding call's agreed
 * weekly slot. Passing `subject` filters to that subject (case-insensitive
 * exact match); omitted returns everyone escalated.
 * Endpoint: GET /assignment/escalated
 */
export const getEscalatedAssignments = async (
  subject?: string,
): Promise<EscalatedAssignment[]> => {
  const res = await apiClient.get<{success: boolean; data: {assignments: EscalatedAssignment[]}}>(
    "/assignment/escalated",
    {params: subject ? {subject} : undefined},
  );
  return res.data.data.assignments;
};

/**
 * Resolves a teacher_escalated assignment by assigning it to a teacher.
 * Endpoint: POST /assignment/{assignment_id}/assign-teacher
 */
export const assignTeacherToAssignment = async (
  assignmentId: string,
  teacherUserId: string,
): Promise<void> => {
  await apiClient.post(`/assignment/${assignmentId}/assign-teacher`, {
    teacher_user_id: teacherUserId,
  });
};
