export interface OnboardingPayload {
  username: string;
  preferred_language: string;
  self_description: string;
  referral_source: string;
  referral_source_other?: string;
  purpose: string[];
  purpose_other?: string;
}

export interface OnboardingResponseData {
  redirect_url: string;
  enrollment_status: "none" | "enrolled" | string;
}
