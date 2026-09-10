import { apiClient } from "@mcc/api";

export interface TeacherProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  teaching_subject: string | null;
}

export const getProfile = async (): Promise<TeacherProfile> => {
  const res = await apiClient.get<{ success: boolean; data: TeacherProfile }>("/user/profile");
  return res.data.data;
};

export const updateProfile = async (
  input: Partial<Pick<TeacherProfile, "full_name" | "phone_number" | "teaching_subject">>,
): Promise<void> => {
  await apiClient.patch("/user/profile", input);
};
