import {apiClient} from "@mcc/api";

export interface ApiCategory {
  category_id: string;
  name: string;
  is_active: boolean;
}

/**
 * Lists categories for course/exam category pickers.
 * Endpoint: GET /admin/categories
 */
export const listCategories = async (): Promise<ApiCategory[]> => {
  const res = await apiClient.get<{data: {categories: ApiCategory[]}}>(
    "/admin/categories",
  );

  return res.data.data.categories;
};
