import { User } from "@mcc/types";
import { tokenManager } from "@mcc/api";

const USER_KEY = "mcc_user";
const AUTH_COOKIE = "mcc_auth";

export const saveSession = (user: User, accessToken: string): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Strict; max-age=86400`;
  tokenManager.set(accessToken);
};

export const clearSession = (): void => {
  localStorage.removeItem(USER_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  tokenManager.clear();
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};
