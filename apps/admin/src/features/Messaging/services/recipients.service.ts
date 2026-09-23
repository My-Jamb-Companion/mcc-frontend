import {apiClient} from "@mcc/api";

export interface ApiRecipient {
  user_id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher";
}

/**
 * Powers the recipient picker in Send Message / Share Session Link flows.
 * Endpoint: GET /admin/recipients/search
 */
export const searchRecipients = async (
  q: string,
  role?: "student" | "teacher",
): Promise<ApiRecipient[]> => {
  if (!q.trim()) return [];

  const res = await apiClient.get<{data: ApiRecipient[]}>(
    "/admin/recipients/search",
    {params: {q, role}},
  );

  return res.data.data;
};
