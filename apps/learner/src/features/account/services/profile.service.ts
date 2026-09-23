import {apiClient} from "@mcc/api";

export interface ApiProfileAddress {
  country?: string | null;
  state?: string | null;
  city?: string | null;
  street?: string | null;
}

export interface ApiProfile {
  user_id: string;
  email: string;
  role: string;
  is_active: boolean;
  full_name?: string | null;
  username?: string | null;
  parent_name?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  education_level?: string | null;
  profile_photo_url?: string | null;
  notification_prefs?: Record<string, boolean>;
  address?: ApiProfileAddress;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  username?: string;
  parent_name?: string;
  phone_number?: string;
  gender?: string;
  education_level?: string;
  address?: ApiProfileAddress;
  profile_photo_url?: string;
}

/** Endpoint: GET /user/profile */
export const getProfile = async (): Promise<ApiProfile> => {
  const res = await apiClient.get<{data: ApiProfile}>("/user/profile");
  return res.data.data;
};

/** Endpoint: PATCH /user/profile */
export const updateProfile = async (
  payload: ProfileUpdatePayload,
): Promise<Partial<ApiProfile>> => {
  const res = await apiClient.patch<{data: Partial<ApiProfile>}>(
    "/user/profile",
    payload,
  );
  return res.data.data;
};

/** Endpoint: POST /user/profile/photo */
export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{data: {profile_photo_url: string}}>(
    "/user/profile/photo",
    formData,
    {headers: {"Content-Type": "multipart/form-data"}},
  );
  return res.data.data.profile_photo_url;
};

/** Endpoint: PUT /user/profile/password */
export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await apiClient.put("/user/profile/password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
};

export interface NotificationPrefs {
  email_notifications: Record<string, boolean>;
  push_notifications: Record<string, boolean>;
}

/** Endpoint: GET /user/settings/notifications */
export const getNotificationSettings = async (): Promise<NotificationPrefs> => {
  const res = await apiClient.get<{data: NotificationPrefs}>(
    "/user/settings/notifications",
  );
  return res.data.data;
};

/** Endpoint: PATCH /user/settings/notifications */
export const updateNotificationSettings = async (
  payload: Partial<NotificationPrefs>,
): Promise<NotificationPrefs> => {
  const res = await apiClient.patch<{data: {settings: NotificationPrefs}}>(
    "/user/settings/notifications",
    payload,
  );
  return res.data.data.settings;
};
