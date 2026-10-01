import {apiClient} from "@mcc/api";

export interface ApiCategory {
  category_id: string;
  name: string;
  is_active: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  is_active?: boolean;
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
 * Lists categories for course/exam category pickers (active-only by
 * default) or the Categories management page (includeInactive).
 * Endpoint: GET /admin/categories
 */
export const listCategories = async (
  includeInactive = false,
): Promise<ApiCategory[]> => {
  const res = await apiClient.get<{data: {categories: ApiCategory[]}}>(
    "/admin/categories",
    {params: includeInactive ? {include_inactive: true} : undefined},
  );

  return res.data.data.categories;
};

/**
 * Endpoint: POST /admin/categories. 409 if the name already exists
 * (case-insensitive).
 */
export const createCategory = async (name: string): Promise<ApiCategory> => {
  const res = await apiClient.post<{data: ApiCategory}>("/admin/categories", {name});
  return res.data.data;
};

/**
 * Rename and/or activate/deactivate a category. No delete endpoint exists --
 * category_id is referenced ON DELETE CASCADE by both courses and exam
 * programs, so deactivating is how a category is retired.
 * Endpoint: PATCH /admin/categories/<category_id>
 */
export const updateCategory = async (
  categoryId: string,
  payload: UpdateCategoryPayload,
): Promise<ApiCategory> => {
  const res = await apiClient.patch<{data: ApiCategory}>(
    `/admin/categories/${categoryId}`,
    payload,
  );
  return res.data.data;
};
