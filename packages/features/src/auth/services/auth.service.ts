import { apiClient } from "@mcc/api";
import { User, AuthTokens } from "@mcc/types";

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export const loginApi = async (
  email: string,
  password: string
): Promise<LoginResponseData> => {
  const res = await apiClient.post<{ success: boolean; data: LoginResponseData }>(
    "/auth/login",
    { email, password }
  );
  return res.data.data;
};

export const signupApi = async (email: string, password: string): Promise<void> => {
  await apiClient.post("/auth/signup", { email, password });
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const refreshTokenApi = async (token?: string): Promise<AuthTokens> => {
  const res = await apiClient.post<{ success: boolean; data: AuthTokens }>(
    "/auth/token/refresh",
    token ? { refresh_token: token } : {}
  );
  return res.data.data;
};

export const requestPasswordResetApi = async (email: string): Promise<void> => {
  await apiClient.post("/auth/password-reset/request", { email });
};

export const verifyResetCodeApi = async (
  email: string,
  code: string
): Promise<{ verification_token: string }> => {
  const res = await apiClient.post<{
    success: boolean;
    data: { verification_token: string };
  }>("/auth/password-reset/verification", { email, code });
  return res.data.data;
};

export const confirmNewPasswordApi = async (
  verificationToken: string,
  newPassword: string
): Promise<void> => {
  await apiClient.post("/auth/password-reset/confirmation", {
    verification_token: verificationToken,
    new_password: newPassword,
  });
};

export const resendVerificationApi = async (email: string): Promise<void> => {
  await apiClient.post("/auth/email/resend", { email });
};

export const getGoogleAuthUrlApi = async (): Promise<{
  authorization_url: string;
  state: string;
}> => {
  const redirectUri = `${window.location.origin}/auth/google/success`;
  const res = await apiClient.get<{
    success: boolean;
    data: { authorization_url: string; state: string };
  }>("/auth/authorize/google", { params: { redirect_uri: redirectUri } });
  return res.data.data;
};

export interface GoogleExchangeResponseData {
  user: User;
  access_token: string;
  refresh_token: string;
  redirect_url: string;
}

export const googleExchangeApi = async (
  code: string
): Promise<GoogleExchangeResponseData> => {
  const res = await apiClient.post<{
    success: boolean;
    data: GoogleExchangeResponseData;
  }>("/auth/google/exchange", { code });
  return res.data.data;
};

export const getFacebookAuthUrlApi = async (): Promise<{
  authorization_url: string;
  state: string;
}> => {
  const redirectUri = `${window.location.origin}/auth/facebook/success`;
  const res = await apiClient.get<{
    success: boolean;
    data: { authorization_url: string; state: string };
  }>("/auth/authorize/facebook", { params: { redirect_uri: redirectUri } });
  return res.data.data;
};

export interface FacebookExchangeResponseData {
  user: User;
  access_token: string;
  refresh_token: string;
  redirect_url: string;
}

export const facebookExchangeApi = async (
  code: string
): Promise<FacebookExchangeResponseData> => {
  const res = await apiClient.post<{
    success: boolean;
    data: FacebookExchangeResponseData;
  }>("/auth/facebook/exchange", { code });
  return res.data.data;
};
