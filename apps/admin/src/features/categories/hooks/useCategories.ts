import {useQuery} from "@tanstack/react-query";
import {listCategories} from "../services/category.service";

/**
 * Category picker options from the live backend (GET /admin/categories),
 * shared by course and exam-program creation (Step1.tsx in both).
 */
export const useCategoryOptions = () => {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const options = (query.data ?? []).map((c) => ({
    label: c.name,
    value: c.name.toLowerCase(),
  }));

  return {...query, options};
};
