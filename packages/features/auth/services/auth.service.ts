import { User, Role } from "../types";
import { mockUsers } from "./auth.mock";

export const login = async (role: Role): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUsers[role]), 500);
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  return new Promise((resolve) => {
    const stored = localStorage.getItem("user");
    resolve(stored ? JSON.parse(stored) : null);
  });
};