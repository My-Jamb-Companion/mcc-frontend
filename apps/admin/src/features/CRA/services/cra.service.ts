import {apiClient} from "@mcc/api";

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as {response?: {data?: {message?: string}}}).response
      ?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export interface CreateCraPayload {
  full_name: string;
  email: string;
  phone?: string;
}

export interface ApiCraCreated {
  cra_id: string;
  full_name: string;
  email: string;
}

/**
 * Provisions a new CRA account. CRAs don't self-register -- this is the
 * only way to get one into the system short of a raw DB insert.
 * Endpoint: POST /admin/cra
 */
export const createCra = async (
  payload: CreateCraPayload,
): Promise<ApiCraCreated> => {
  const res = await apiClient.post<{data: ApiCraCreated}>("/admin/cra", payload);
  return res.data.data;
};

export interface ApiCra {
  cra_id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ApiCraList {
  items: ApiCra[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Endpoint: GET /admin/cra -- under the CRAs access area, so an admin who manages CRAs doesn't need
 * the Users area (the generic /admin/users routes live there).
 */
export const listCras = async (search: string): Promise<ApiCraList> =>
  (await apiClient.get<{data: ApiCraList}>("/admin/cra", {params: {limit: 200, ...(search ? {search} : {})}})).data.data;

/** Endpoint: PATCH /admin/cra/{id} -- name and phone; the email is their sign-in. */
export const updateCra = async (id: string, payload: {full_name?: string; phone?: string}): Promise<ApiCra> =>
  (await apiClient.patch<{data: ApiCra}>(`/admin/cra/${id}`, payload)).data.data;

/** Endpoint: PATCH /admin/cra/{id}/deactivate -- a reason is required. */
export const deactivateCra = async (id: string, reason: string): Promise<void> => {
  await apiClient.patch(`/admin/cra/${id}/deactivate`, {reason});
};

/** Endpoint: PATCH /admin/cra/{id}/activate */
export const activateCra = async (id: string): Promise<void> => {
  await apiClient.patch(`/admin/cra/${id}/activate`);
};
