import {apiClient} from "@mcc/api";

/**
 * Disables a teacher's account: they can't sign in or teach until it is enabled again. The backend
 * requires a reason and records it in the account audit trail.
 * Endpoint: PATCH /admin/teachers/{teacher_id}/disable
 */
export const disableTeacher = async (teacherId: string, reason: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/${teacherId}/disable`, {reason});
};

/**
 * Switches a disabled teacher back on.
 * Endpoint: PATCH /admin/teachers/{teacher_id}/enable
 */
export const enableTeacher = async (teacherId: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/${teacherId}/enable`);
};

/**
 * Approves a pending teacher's application.
 * Endpoint: PATCH /admin/teachers/{teacher_id}/approve
 */
export const approveTeacher = async (teacherId: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/${teacherId}/approve`);
};

/**
 * Rejects a pending teacher's application. `reason` is required by the
 * backend (min_length 1) and is included in the rejection email sent to
 * the applicant.
 * Endpoint: PATCH /admin/teachers/{teacher_id}/reject
 */
export const rejectTeacher = async (teacherId: string, reason: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/${teacherId}/reject`, {reason});
};
