export type Role = "student" | "instructor" | "admin";

export interface User {
  user_id: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
