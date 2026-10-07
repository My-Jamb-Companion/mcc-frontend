import {apiClient} from "@mcc/api";

export {getApiErrorMessage} from "@/src/features/categories/services/category.service";

export interface ApiProfile {
  user_id: string;
  email: string;
  role: string;
  full_name?: string | null;
  username?: string | null;
  phone_number?: string | null;
  profile_photo_url?: string | null;
}

export interface ProfileUpdate {
  full_name?: string;
  username?: string;
  phone_number?: string;
}

/** The signed-in account's profile. Endpoint: GET /user/profile (any role) */
export const getProfile = async (): Promise<ApiProfile> => {
  const res = await apiClient.get<{data: ApiProfile}>("/user/profile");
  return res.data.data;
};

/** Endpoint: PATCH /user/profile */
export const updateProfile = async (input: ProfileUpdate): Promise<void> => {
  await apiClient.patch("/user/profile", input);
};

/** Endpoint: POST /user/profile/photo (multipart). 503 when storage isn't configured. */
export const uploadProfilePhoto = async (file: File): Promise<{profile_photo_url: string}> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{data: {profile_photo_url: string}}>("/user/profile/photo", formData, {
    headers: {"Content-Type": "multipart/form-data"},
  });
  return res.data.data;
};

/** Endpoint: PUT /user/profile/password. 401 when the current password is wrong. */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await apiClient.put("/user/profile/password", {current_password: currentPassword, new_password: newPassword});
};
