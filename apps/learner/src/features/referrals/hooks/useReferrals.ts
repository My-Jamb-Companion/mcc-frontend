import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getReferralStatus, sendReferralInvite} from "../services/referrals.service";

export const useReferralStatus = () => {
  const query = useQuery({queryKey: ["referrals", "status"], queryFn: getReferralStatus});
  return {...query, status: query.data};
};

export const useSendReferralInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendReferralInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["referrals", "status"]});
    },
  });
};
