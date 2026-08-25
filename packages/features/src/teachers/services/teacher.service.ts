import { apiClient } from "@mcc/api";
import { GetTeachersParams, GetTeachersResponse, Teacher } from "../types";

/**
 * Fetches the list of teachers/instructors from GET /admin/teachers endpoint.
 */
export const getTeachersApi = async (
  params?: GetTeachersParams
): Promise<Teacher[]> => {
  try {
    const res = await apiClient.get<GetTeachersResponse | any>(
      "/admin/teachers",
      { params }
    );

    const payload = res?.data;

    // 1. Enveloped pagination format: { success: true, data: { items: [...] } }
    if (payload?.data?.items && Array.isArray(payload.data.items)) {
      return payload.data.items;
    }

    // 2. Direct pagination format: { items: [...] }
    if (payload?.items && Array.isArray(payload.items)) {
      return payload.items;
    }

    // 3. Enveloped array format: { success: true, data: [...] }
    if (payload?.data && Array.isArray(payload.data)) {
      return payload.data;
    }

    // 4. Raw array format: [...]
    if (Array.isArray(payload)) {
      return payload;
    }

    // 5. Fallback: search object properties for array of items/teachers
    if (payload && typeof payload === "object") {
      if (Array.isArray(payload.teachers)) return payload.teachers;
      if (Array.isArray(payload.results)) return payload.results;
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch teachers from /admin/teachers:", error);
    return [];
  }
};
