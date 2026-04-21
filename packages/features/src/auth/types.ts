export type Role = "learner" | "instructor" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  token: string;
}
