import {apiClient} from "@mcc/api";
import {CATALOG_LABELS, CatalogItem, CatalogKind, normalizeCatalogItem} from "../helper/catalog";

export interface UpdateCatalogPayload {
  name?: string;
  is_active?: boolean;
}

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as {response?: {data?: {message?: string}}}).response?.data?.message;
    if (message) return message;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

const base = (kind: CatalogKind) => `/admin/exams/${CATALOG_LABELS[kind].endpoint}`;

/**
 * Lists exam types or subjects, including deactivated ones (pickers filter
 * those out themselves so an edited program can still show its own value).
 * Endpoint: GET /admin/exams/types | /admin/exams/subjects
 */
export const listCatalog = async (kind: CatalogKind): Promise<CatalogItem[]> => {
  const res = await apiClient.get<{data: Record<string, unknown>[]}>(base(kind), {
    params: {include_inactive: true},
  });
  return res.data.data.map((raw) => normalizeCatalogItem(kind, raw));
};

/** Endpoint: POST /admin/exams/types | /subjects. 409 if the name exists (any case). */
export const createCatalogItem = async (kind: CatalogKind, name: string): Promise<CatalogItem> => {
  const res = await apiClient.post<{data: Record<string, unknown>}>(base(kind), {name});
  return normalizeCatalogItem(kind, res.data.data);
};

/**
 * Rename and/or activate/deactivate. There is no delete: programs reference
 * these ON DELETE CASCADE, so deactivating is how one is retired.
 * Endpoint: PATCH /admin/exams/types/<id> | /subjects/<id>
 */
export const updateCatalogItem = async (
  kind: CatalogKind,
  id: string,
  payload: UpdateCatalogPayload,
): Promise<CatalogItem> => {
  const res = await apiClient.patch<{data: Record<string, unknown>}>(`${base(kind)}/${id}`, payload);
  return normalizeCatalogItem(kind, res.data.data);
};
