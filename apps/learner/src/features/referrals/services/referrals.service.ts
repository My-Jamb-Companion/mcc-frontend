import {apiClient} from "@mcc/api";

export interface ApiInviteSent {
  invite_id: string;
  referral_code: string;
  sent_to: string;
  sent_at: string;
}

export interface ApiReferralInvite {
  email: string;
  status: "pending" | "signed_up";
  invited_at: string | null;
  signed_up_at: string | null;
}

export interface ApiReferralStatus {
  total_invited: number;
  successful: number;
  pending: number;
  rewards_earned: {gems: number};
  invites: ApiReferralInvite[];
}

/** Endpoint: POST /referrals/invite */
export const sendReferralInvite = async (email: string): Promise<ApiInviteSent> => {
  const res = await apiClient.post<{data: ApiInviteSent}>("/referrals/invite", {email});
  return res.data.data;
};

/** Endpoint: GET /referrals/status */
export const getReferralStatus = async (): Promise<ApiReferralStatus> => {
  const res = await apiClient.get<{data: ApiReferralStatus}>("/referrals/status");
  return res.data.data;
};
