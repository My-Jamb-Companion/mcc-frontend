import {apiClient} from "@mcc/api";

/**
 * Lets an admin switch the model every Brainy-adjacent feature (chat,
 * flashcards, feedback, help, Admin Copilot, Parent Advisor) uses, without a
 * backend restart. Backend: app/features/admin/ai_settings.
 */

export interface ApiActiveModel {
  model_id: string;
  changed_by: string | null;
  changed_by_name: string | null;
  changed_at: string | null;
  change_reason: string | null;
}

export interface ApiAvailableModel {
  id: string;
  object?: string | null;
  owned_by?: string | null;
  created?: number | null;
  // Cheaper Inference's catalog carries extra provider-specific metadata
  // (pricing, context length, capabilities...) not all pinned above.
  [key: string]: unknown;
}

/** Endpoint: GET /admin/ai-settings/model */
export const getActiveModel = async (): Promise<ApiActiveModel> => {
  const res = await apiClient.get<{data: ApiActiveModel}>("/admin/ai-settings/model");
  return res.data.data;
};

/** Endpoint: PATCH /admin/ai-settings/model -- takes effect immediately, no redeploy. */
export const setActiveModel = async (input: {
  model_id: string;
  change_reason?: string;
}): Promise<ApiActiveModel> => {
  const res = await apiClient.patch<{data: ApiActiveModel}>("/admin/ai-settings/model", input);
  return res.data.data;
};

/** Endpoint: GET /admin/ai-settings/history */
export const listModelHistory = async (): Promise<ApiActiveModel[]> => {
  const res = await apiClient.get<{data: {history: ApiActiveModel[]}}>(
    "/admin/ai-settings/history",
  );
  return res.data.data.history;
};

/**
 * Endpoint: GET /admin/ai-settings/available-models
 *
 * Best-effort catalog for the picker. Resolves to an empty list rather than
 * throwing when the provider can't be reached -- reading/setting the active
 * model don't depend on this, so a catalog outage shouldn't block the screen.
 */
export const listAvailableModels = async (): Promise<ApiAvailableModel[]> => {
  try {
    const res = await apiClient.get<{data: {models: ApiAvailableModel[]}}>(
      "/admin/ai-settings/available-models",
    );
    return res.data.data.models;
  } catch {
    return [];
  }
};

export const aiSettingsErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as {response?: {data?: {message?: string}}})?.response?.data;
  return data?.message || fallback;
};
