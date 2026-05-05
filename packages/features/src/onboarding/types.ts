export interface OnboardingPayload {
  username: string;
  preferred_language: string;
  self_description: string;
  referral_source: string;
  purpose: string[];
}

export interface OnboardingResponseData {
  redirect_url: string;
  enrollment_status: "none" | "enrolled" | string;
}
