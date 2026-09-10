import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { getProfile, updateProfile } from "./account.service";

const QUERY_KEY = ["teacher", "profile"];

export const useProfile = () => useQuery({ queryKey: QUERY_KEY, queryFn: getProfile });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      showSuccess("Profile updated");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't update your profile")),
  });
};
