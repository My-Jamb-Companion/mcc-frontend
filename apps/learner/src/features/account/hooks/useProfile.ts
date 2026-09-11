import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  getNotificationSettings,
  getProfile,
  updateNotificationSettings,
  updatePassword,
  updateProfile,
  uploadProfilePhoto,
  ProfileUpdatePayload,
} from "../services/profile.service";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["profile"]});
    },
  });
};

export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadProfilePhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["profile"]});
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({currentPassword, newPassword}: {currentPassword: string; newPassword: string}) =>
      updatePassword(currentPassword, newPassword),
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ["notification-settings"],
    queryFn: getNotificationSettings,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["notification-settings"]});
    },
  });
};
