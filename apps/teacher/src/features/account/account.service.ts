import { apiClient } from "@mcc/api";

export interface TeacherProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  teaching_subject: string | null;
  self_description: string | null;
  teaching_style: string[];
}

export const getProfile = async (): Promise<TeacherProfile> => {
  const res = await apiClient.get<{ success: boolean; data: TeacherProfile }>("/user/profile");
  return res.data.data;
};

export const updateProfile = async (
  input: Partial<
    Pick<TeacherProfile, "full_name" | "phone_number" | "teaching_subject" | "self_description" | "teaching_style">
  >,
): Promise<void> => {
  await apiClient.patch("/user/profile", input);
};

export const uploadProfilePhotoApi = async (
  file: File,
): Promise<{ profile_photo_url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{ success: boolean; data: { profile_photo_url: string } }>(
    "/user/profile/photo",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
};
