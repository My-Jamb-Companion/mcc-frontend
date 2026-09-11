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
