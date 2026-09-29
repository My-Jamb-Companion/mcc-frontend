import {apiClient} from "@mcc/api";

export interface ApiLinkedParent {
  linked: boolean;
  parent_name: string | null;
  parent_email: string | null;
}

/** Endpoint: GET /student/parent -- whether the caller is a linked child
 * in the real parent_children table (not to be confused with the legacy,
 * unstructured users_profile.parent_name free-text field). */
export const getLinkedParent = async (): Promise<ApiLinkedParent> => {
  const res = await apiClient.get<{data: ApiLinkedParent}>("/student/parent");
  return res.data.data;
};
