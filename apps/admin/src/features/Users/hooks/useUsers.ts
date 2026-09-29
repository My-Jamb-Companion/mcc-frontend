import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  activateUser,
  deactivateUser,
  listUsers,
  updateUser,
  UpdateUserPayload,
} from "../services/users.service";

const USERS_KEY = ["admin-users"];

export const useUsers = () => {
  const query = useQuery({
    queryKey: USERS_KEY,
    queryFn: () => listUsers(),
  });

  return {...query, users: query.data ?? []};
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({userId, payload}: {userId: string; payload: UpdateUserPayload}) =>
      updateUser(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({queryKey: USERS_KEY}),
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({userId, reason}: {userId: string; reason: string}) =>
      deactivateUser(userId, reason),
    onSuccess: () => queryClient.invalidateQueries({queryKey: USERS_KEY}),
  });
};

export const useActivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => activateUser(userId),
    onSuccess: () => queryClient.invalidateQueries({queryKey: USERS_KEY}),
  });
};
