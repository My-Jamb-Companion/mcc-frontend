import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createCategory,
  listCategories,
  updateCategory,
  UpdateCategoryPayload,
} from "../services/category.service";

const PICKER_KEY = ["categories"];
const ADMIN_KEY = ["admin-categories"];

/**
 * Category picker options from the live backend (GET /admin/categories),
 * shared by course and exam-program creation (Step1.tsx in both).
 */
export const useCategoryOptions = () => {
  const query = useQuery({
    queryKey: PICKER_KEY,
    queryFn: () => listCategories(),
  });

  const options = (query.data ?? []).map((c) => ({
    label: c.name,
    value: c.name.toLowerCase(),
  }));

  return {...query, options};
};

/** Full list (including inactive) for the Categories management page. */
export const useCategories = () => {
  const query = useQuery({
    queryKey: ADMIN_KEY,
    queryFn: () => listCategories(true),
  });

  return {...query, categories: query.data ?? []};
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    // Invalidate both this page's own list and the course/exam-creation
    // picker's key, so a newly created category shows up immediately there too.
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ADMIN_KEY});
      queryClient.invalidateQueries({queryKey: PICKER_KEY});
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({categoryId, payload}: {categoryId: string; payload: UpdateCategoryPayload}) =>
      updateCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ADMIN_KEY});
      queryClient.invalidateQueries({queryKey: PICKER_KEY});
    },
  });
};
