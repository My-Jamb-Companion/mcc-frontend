import { User } from "../types";

export const mockUsers: Record<string, User> = {
  learner: {
    id: "1",
    name: "John Learner",
    role: "learner",
    token: "learner-token",
  },
  instructor: {
    id: "2",
    name: "Jane Instructor",
    role: "instructor",
    token: "instructor-token",
  },
  admin: {
    id: "3",
    name: "Admin User",
    role: "admin",
    token: "admin-token",
  },
};