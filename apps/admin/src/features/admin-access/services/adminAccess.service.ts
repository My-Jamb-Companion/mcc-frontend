import {apiClient} from "@mcc/api";
import type {MyAccess} from "../helper/access";

export {getApiErrorMessage} from "@/src/features/categories/services/category.service";

export interface AccessArea {
  key: string;
  label: string;
  description: string;
  group: string;
}

export interface AccessPreset {
  key: string;
  label: string;
  description: string;
  is_super: boolean;
  permissions: Record<string, string>;
}

export interface AccessCatalog {
  areas: AccessArea[];
  levels: string[];
  presets: AccessPreset[];
}

export interface ApiAdmin {
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  email_verified: boolean;
  level: "super" | "limited";
  preset: string;
  preset_label: string;
  permissions: Record<string, "none" | "view" | "manage">;
  created_at: string | null;
}

export interface AdminInput {
  full_name?: string;
  email?: string;
  phone_number?: string;
  preset?: string;
  permissions?: Record<string, "view" | "manage">;
  is_active?: boolean;
}

/** The signed-in admin's own access. Endpoint: GET /admin/access/me */
export const getMyAccess = async (): Promise<MyAccess> => {
  const res = await apiClient.get<{data: MyAccess}>("/admin/access/me");
  return res.data.data;
};

/** Areas, levels and templates. Super admin only. Endpoint: GET /admin/admins/catalog */
export const getAccessCatalog = async (): Promise<AccessCatalog> => {
  const res = await apiClient.get<{data: AccessCatalog}>("/admin/admins/catalog");
  return res.data.data;
};

/** Endpoint: GET /admin/admins */
export const listAdmins = async (): Promise<ApiAdmin[]> => {
  const res = await apiClient.get<{data: {admins: ApiAdmin[]}}>("/admin/admins");
  return res.data.data.admins;
};

/** Endpoint: POST /admin/admins. 409 when the email is already a user. */
export const createAdmin = async (input: AdminInput): Promise<ApiAdmin & {invite_sent: boolean}> => {
  const res = await apiClient.post<{data: ApiAdmin & {invite_sent: boolean}}>("/admin/admins", input);
  return res.data.data;
};

/** Endpoint: PATCH /admin/admins/<id> */
export const updateAdmin = async (userId: string, input: AdminInput): Promise<ApiAdmin> => {
  const res = await apiClient.patch<{data: ApiAdmin}>(`/admin/admins/${userId}`, input);
  return res.data.data;
};

/** Endpoint: POST /admin/admins/<id>/resend-invite */
export const resendAdminInvite = async (userId: string): Promise<{invite_sent: boolean}> => {
  const res = await apiClient.post<{data: {invite_sent: boolean}}>(`/admin/admins/${userId}/resend-invite`);
  return res.data.data;
};
