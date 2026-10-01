import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  activateUser,
  deactivateUser,
  getOnboardingOtherResponses,
  getPurposeBreakdown,
  getReferralSourceBreakdown,
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

export const useReferralSources = (role?: string) => {
  const query = useQuery({
    queryKey: ["admin-users", "referral-sources", role ?? "all"],
    queryFn: () => getReferralSourceBreakdown(role),
  });

  return {
    ...query,
    sources: query.data?.sources ?? [],
    totalRespondents: query.data?.total_respondents ?? 0,
    totalUsers: query.data?.total_users ?? 0,
  };
};

export const usePurposeBreakdown = (role?: string) => {
  const query = useQuery({
    queryKey: ["admin-users", "purpose-breakdown", role ?? "all"],
    queryFn: () => getPurposeBreakdown(role),
  });

  return {
    ...query,
    purposes: query.data?.purposes ?? [],
    totalRespondents: query.data?.total_respondents ?? 0,
    totalUsers: query.data?.total_users ?? 0,
  };
};

export const useOnboardingOtherResponses = (role?: string) => {
  const query = useQuery({
    queryKey: ["admin-users", "onboarding-other-responses", role ?? "all"],
    queryFn: () => getOnboardingOtherResponses(role),
  });

  return {
    ...query,
    referral: query.data?.referral ?? [],
    purpose: query.data?.purpose ?? [],
  };
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
