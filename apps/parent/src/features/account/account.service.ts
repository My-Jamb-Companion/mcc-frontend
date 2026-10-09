import { apiClient } from "@mcc/api";

export interface ParentProfile {
  user_id: string;
  email: string;
  full_name?: string | null;
  phone_number?: string | null;
}

export interface ParentProfileUpdate {
  full_name?: string;
  phone_number?: string;
}

/** Endpoint: GET /user/profile */
export const getProfile = async (): Promise<ParentProfile> => {
  const res = await apiClient.get<{ data: ParentProfile }>("/user/profile");
  return res.data.data;
};

/** Endpoint: PATCH /user/profile */
export const updateProfile = async (payload: ParentProfileUpdate): Promise<void> => {
  await apiClient.patch("/user/profile", payload);
};
