import {apiClient} from "@mcc/api";

/** Identity-verification review queue and payout details. Endpoints: /admin/teachers/verifications, /admin/teachers/<id>/payout-details. */

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface ApiVerification {
  id: string;
  teacher_user_id: string;
  teacher_name: string | null;
  teacher_email: string;
  id_type: string;
  id_number: string;
  /** verified | unavailable: a mismatch or not-found NIN never reaches the queue. */
  nin_verification_status: string;
  status: VerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  /** Short-lived signed links, fresh on every read. */
  id_document_url: string;
  teaching_certificate_url: string | null;
  selfie_url: string;
}

export interface ApiPayoutDetails {
  bank_name?: string | null;
  account_number?: string | null;
  account_name?: string | null;
}

export const listVerifications = async (status?: VerificationStatus): Promise<ApiVerification[]> =>
  (await apiClient.get<{data: {verifications: ApiVerification[]}}>("/admin/teachers/verifications", {
    params: status ? {status} : {},
  })).data.data.verifications;

export const approveVerification = async (id: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/verifications/${id}/approve`);
};

export const rejectVerification = async (id: string, reason: string): Promise<void> => {
  await apiClient.patch(`/admin/teachers/verifications/${id}/reject`, {reason});
};

export const getPayoutDetails = async (teacherId: string): Promise<ApiPayoutDetails> =>
  (await apiClient.get<{data: ApiPayoutDetails}>(`/admin/teachers/${teacherId}/payout-details`)).data.data ?? {};
