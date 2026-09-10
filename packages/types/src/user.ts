// Mirrors the backend's users.role values exactly (a free VARCHAR there, not
// an enum) -- "instructor" was never a real value the backend produces
// (always "teacher"), and nothing in this codebase compared against it
// either; corrected rather than carried forward. "parent" added for the
// multi-portal plan's Phase 1 (docs/multi-portal-plan.md, backend repo).
export type Role = "student" | "teacher" | "admin" | "parent";

export interface User {
  user_id: string;
  email: string;
  role: Role;
  is_onboarded?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
