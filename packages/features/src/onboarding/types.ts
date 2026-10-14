export interface OnboardingPayload {
  username: string;
  preferred_language: string;
  self_description: string;
  referral_source: string;
  referral_source_other?: string;
  purpose: string[];
  purpose_other?: string;
  /** YYYY-MM-DD; needed unless a parent already recorded it. */
  date_of_birth?: string;
  /** Needed when the student is under 18 and no parent created the account. */
  guardian_email?: string;
}

export interface OnboardingResponseData {
  redirect_url: string;
  enrollment_status: "none" | "enrolled" | string;
}
