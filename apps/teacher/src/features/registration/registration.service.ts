import { apiClient } from "@mcc/api";
import { TeacherRegistrationInputs } from "./types";

export interface TeacherRegistrationResult {
  user_id: string;
  email: string;
  status: "pending";
}

/**
 * confirm_password/agree_to_terms are frontend-only concerns -- the backend
 * schema (POST /auth/teacher-signup) doesn't accept them.
 */
export const registerTeacherApi = async (
  data: TeacherRegistrationInputs,
): Promise<TeacherRegistrationResult> => {
  const { confirm_password: _confirm_password, agree_to_terms: _agree_to_terms, ...payload } = data;
  const res = await apiClient.post<{ success: boolean; data: TeacherRegistrationResult }>(
    "/auth/teacher-signup",
    payload,
  );
  return res.data.data;
};
