import {apiClient} from "@mcc/api";

export interface QaTester {
  user_id: string;
  full_name: string | null;
  email: string;
  is_active: boolean;
  created_at: string;
  created_by_name: string | null;
  last_login_at: string | null;
  /** Courses and exam programs they are enrolled in. */
  enrolments: number;
}

export interface QaTesterList {
  items: QaTester[];
  total: number;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as {response?: {data?: {message?: string}}}).response?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** Endpoint: GET /admin/qa-testers (super admins only). */
export const listQaTesters = async (search = ""): Promise<QaTesterList> => {
  const res = await apiClient.get<{data: QaTesterList}>("/admin/qa-testers", {
    params: search.trim() ? {search: search.trim()} : undefined,
  });
  return res.data.data;
};

/** Endpoint: POST /admin/qa-testers. 409 if the email is already taken. */
export const createQaTester = async (input: {full_name: string; email: string}): Promise<QaTester> => {
  const res = await apiClient.post<{data: QaTester}>("/admin/qa-testers", input);
  return res.data.data;
};

/** Endpoint: PATCH /admin/qa-testers/<id>. A deactivated tester cannot sign in. */
export const setQaTesterActive = async (userId: string, isActive: boolean): Promise<QaTester> => {
  const res = await apiClient.patch<{data: QaTester}>(`/admin/qa-testers/${userId}`, {is_active: isActive});
  return res.data.data;
};

/** Endpoint: POST /admin/qa-testers/<id>/send-code. Emails a password-reset code (3 an hour per email). */
export const sendQaTesterCode = async (userId: string): Promise<void> => {
  await apiClient.post(`/admin/qa-testers/${userId}/send-code`);
};

/** Endpoint: DELETE /admin/qa-testers/<id>. Removes the tester and everything it did. */
export const deleteQaTester = async (userId: string): Promise<void> => {
  await apiClient.delete(`/admin/qa-testers/${userId}`);
};
