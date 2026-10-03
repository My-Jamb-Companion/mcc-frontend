import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  AdminInput,
  createAdmin,
  getAccessCatalog,
  getMyAccess,
  listAdmins,
  resendAdminInvite,
  updateAdmin,
} from "../services/adminAccess.service";

const ME_KEY = ["admin-access", "me"];
const ADMINS_KEY = ["admin-access", "admins"];

/**
 * The signed-in admin's access. Refetched when the window regains focus, so a
 * change made by a super admin shows up without a fresh login. If the server
 * can't answer, `data` stays undefined and the console shows everything (the
 * server still refuses what it must).
 */
export const useMyAccess = () =>
  useQuery({queryKey: ME_KEY, queryFn: getMyAccess, staleTime: 30_000, retry: false, refetchOnWindowFocus: true});

export const useAccessCatalog = (enabled = true) =>
  useQuery({queryKey: ["admin-access", "catalog"], queryFn: getAccessCatalog, enabled, staleTime: 5 * 60_000});

export const useAdmins = (enabled = true) =>
  useQuery({queryKey: ADMINS_KEY, queryFn: listAdmins, enabled});

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminInput) => createAdmin(input),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ADMINS_KEY}),
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({userId, input}: {userId: string; input: AdminInput}) => updateAdmin(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ADMINS_KEY});
      queryClient.invalidateQueries({queryKey: ["admin-users"]});
    },
  });
};

export const useResendAdminInvite = () => useMutation({mutationFn: (userId: string) => resendAdminInvite(userId)});
