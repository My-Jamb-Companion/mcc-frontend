import { apiClient } from "@mcc/api";

export interface CraProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
}

export const getProfile = async (): Promise<CraProfile> => {
  const res = await apiClient.get<{ success: boolean; data: CraProfile }>("/user/profile");
  return res.data.data;
};

export const updateProfile = async (
  input: Partial<Pick<CraProfile, "full_name" | "phone_number">>,
): Promise<void> => {
  await apiClient.patch("/user/profile", input);
};
