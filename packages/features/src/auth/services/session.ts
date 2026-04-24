import { User } from "@mcc/types";

const ACCESS_TOKEN_KEY = "mcc_access_token";
const REFRESH_TOKEN_KEY = "mcc_refresh_token";
const USER_KEY = "mcc_user";
const AUTH_COOKIE = "mcc_auth";

export const saveSession = (
  user: User,
  accessToken: string,
  refreshToken: string
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${AUTH_COOKIE}=1; path=/; SameSite=Strict; max-age=86400`;
};

export const clearSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
};

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};
