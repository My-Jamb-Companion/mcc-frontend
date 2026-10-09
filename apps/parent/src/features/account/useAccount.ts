import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "./account.service";

const KEY = ["parent", "profile"];

export const useProfile = () => useQuery({ queryKey: KEY, queryFn: getProfile });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
