import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {askGuardian, getConsentState, submitAge} from "../services/consent.service";

export const CONSENT_KEY = ["consent", "me"] as const;

/** Whether this student is a child waiting on a guardian, or has no date of birth on file yet. */
export const useConsentState = () =>
  useQuery({queryKey: CONSENT_KEY, queryFn: getConsentState, staleTime: 60_000});

export const useSubmitAge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAge,
    onSuccess: (state) => queryClient.setQueryData(CONSENT_KEY, state),
  });
};

export const useAskGuardian = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: askGuardian,
    onSuccess: (state) => queryClient.setQueryData(CONSENT_KEY, state),
  });
};
