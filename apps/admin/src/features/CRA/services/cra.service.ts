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
