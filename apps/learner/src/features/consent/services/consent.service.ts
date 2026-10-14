import {apiClient} from "@mcc/api";

export type ConsentStatus =
  | "not_required"
  | "age_unknown"
  | "missing"
  | "pending"
  | "granted"
  | "declined"
  | "expired"
  | "revoked";

export interface ConsentState {
  is_student: boolean;
  age_known: boolean;
  is_minor: boolean;
  status: ConsentStatus;
  /** True while a child has no guardian's consent: no payments, Brainy, live classes or leaderboard. */
  restricted: boolean;
  guardian_email_masked: string | null;
  requested_at: string | null;
  expires_at: string | null;
}

/** Endpoint: GET /consent/me */
export const getConsentState = async (): Promise<ConsentState> =>
  (await apiClient.get<{data: ConsentState}>("/consent/me")).data.data;

/** Endpoint: POST /consent/me -- records the date of birth (once) and, for a child, asks their guardian. */
export const submitAge = async (input: {date_of_birth: string; guardian_email?: string}): Promise<ConsentState> =>
  (await apiClient.post<{data: ConsentState}>("/consent/me", input)).data.data;

/** Endpoint: POST /consent/me/guardian -- a new approval link, replacing any unanswered one. */
export const askGuardian = async (guardianEmail: string): Promise<ConsentState> =>
  (await apiClient.post<{data: ConsentState}>("/consent/me/guardian", {guardian_email: guardianEmail})).data.data;
