import {apiClient} from "@mcc/api";

export interface ApiUser {
  user_id: string;
  email: string;
  role: "student" | "teacher" | "admin" | "parent" | "cra";
  is_active: boolean;
  email_verified: boolean;
  auth_provider: string;
  full_name?: string | null;
  username?: string | null;
  phone_number?: string | null;
  created_at: string;
}

interface ListUsersParams {
  role?: string;
  search?: string;
  is_active?: string;
  page?: number;
  limit?: number;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as {response?: {data?: {message?: string}}}).response
      ?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/**
 * Lists platform users for the admin Users table.
 * Endpoint: GET /admin/users
 */
export const listUsers = async (params?: ListUsersParams): Promise<ApiUser[]> => {
  const res = await apiClient.get<{data: {users: ApiUser[]; total: number}}>(
    "/admin/users",
    {params},
  );

  return res.data.data.users;
};

export interface UpdateUserPayload {
  full_name?: string;
  phone_number?: string;
}

/**
 * Updates a user's profile fields (any role). email and role aren't here --
 * email is a login-identity change and role changes have cross-table
 * consequences, neither belongs in a generic profile edit.
 * Endpoint: PATCH /admin/users/<id>
 */
export const updateUser = async (
  userId: string,
  payload: UpdateUserPayload,
): Promise<void> => {
  await apiClient.patch(`/admin/users/${userId}`, payload);
};

/**
 * Deactivates (soft-deletes) a user account. Hard deletion isn't supported
 * by design -- reason is required and recorded to the account's status
 * history.
 * Endpoint: PATCH /admin/users/<id>/deactivate
 */
export const deactivateUser = async (userId: string, reason: string): Promise<void> => {
  await apiClient.patch(`/admin/users/${userId}/deactivate`, {reason});
};

/**
 * Reactivates a previously deactivated user account.
 * Endpoint: PATCH /admin/users/<id>/activate
 */
export const activateUser = async (userId: string): Promise<void> => {
  await apiClient.patch(`/admin/users/${userId}/activate`);
};
