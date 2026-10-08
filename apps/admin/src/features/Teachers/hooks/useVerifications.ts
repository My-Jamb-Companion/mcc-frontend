import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  VerificationStatus,
  approveVerification,
  getPayoutDetails,
  listVerifications,
  rejectVerification,
} from "../services/verifications.service";

const KEY = ["admin-teacher-verifications"] as const;

/** The review queue for one status. Document links are short-lived, so the list is refetched on focus. */
export const useVerifications = (status: VerificationStatus) =>
  useQuery({queryKey: [...KEY, status], queryFn: () => listVerifications(status), staleTime: 0, refetchOnWindowFocus: true});

export const useApproveVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveVerification(id),
    onSuccess: () => queryClient.invalidateQueries({queryKey: KEY}),
  });
};

export const useRejectVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, reason}: {id: string; reason: string}) => rejectVerification(id, reason),
    onSuccess: () => queryClient.invalidateQueries({queryKey: KEY}),
  });
};

/** A teacher's payout bank details. Only fetched once asked for: the account number is decrypted for the admin. */
export const usePayoutDetails = (teacherId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: ["admin-teacher-payout", teacherId],
    queryFn: () => getPayoutDetails(teacherId as string),
    enabled: enabled && !!teacherId,
    staleTime: 0,
    gcTime: 0, // don't keep a decrypted account number in the cache once the panel closes
  });
