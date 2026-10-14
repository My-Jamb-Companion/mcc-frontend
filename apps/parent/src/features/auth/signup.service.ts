import { apiClient } from "@mcc/api";

export interface ParentChildSignupInput {
  parent_email: string;
  parent_password: string;
  parent_full_name?: string;
  child_email: string;
  child_password: string;
  child_full_name?: string;
  relationship?: string;
  /** YYYY-MM-DD. How the platform knows whether the child is under 18. */
  child_date_of_birth: string;
  /** Must be true: the parent consents for the child. */
  guardian_consent: boolean;
}

export const signupParentAndChild = async (input: ParentChildSignupInput): Promise<void> => {
  await apiClient.post("/parent/signup", input);
};
