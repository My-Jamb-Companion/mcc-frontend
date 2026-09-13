import {apiClient} from "@mcc/api";

/**
 * Disables a teacher's account.
 * Endpoint: PATCH /admin/teachers/{teacher_id}/disable
 *
 * The route calls request.get_json() (not silent), which 415s without a
 * JSON body -- pass {} explicitly rather than omitting the body, unlike
 * the other bodyless mutations in this app whose routes never parse a body.
 */
export const disableTeacher = async (teacherId: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/${teacherId}/disable`, {});
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
