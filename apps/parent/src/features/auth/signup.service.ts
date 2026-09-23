import { apiClient } from "@mcc/api";

export interface ParentChildSignupInput {
  parent_email: string;
  parent_password: string;
  parent_full_name?: string;
  child_email: string;
  child_password: string;
  child_full_name?: string;
  relationship?: string;
}

export const signupParentAndChild = async (input: ParentChildSignupInput): Promise<void> => {
  await apiClient.post("/parent/signup", input);
};
