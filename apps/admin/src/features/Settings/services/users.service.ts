import {apiClient} from "@mcc/api";

export interface ApiUser {
  user_id: string;
  email: string;
  role: "student" | "teacher" | "admin" | "parent";
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

/**
 * Lists platform users for the Settings & Permissions table.
 * Endpoint: GET /admin/users
 */
export const listUsers = async (params?: ListUsersParams): Promise<ApiUser[]> => {
  const res = await apiClient.get<{data: {users: ApiUser[]; total: number}}>(
    "/admin/users",
    {params},
  );

  return res.data.data.users;
};
