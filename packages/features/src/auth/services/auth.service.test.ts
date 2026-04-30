import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@mcc/api";
import {
  loginApi,
  signupApi,
  logoutApi,
  requestPasswordResetApi,
  verifyResetCodeApi,
  confirmNewPasswordApi,
  resendVerificationApi,
  getGoogleAuthUrlApi,
} from "./auth.service";

// ─── mock the entire @mcc/api module ─────────────────────────────────────────
// This means no real HTTP calls happen — apiClient.post/get are fake functions
vi.mock("@mcc/api", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockPost = vi.mocked(apiClient.post);
const mockGet = vi.mocked(apiClient.get);

// reset all mocks before each test so they don't bleed into each other
beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// loginApi
// ─────────────────────────────────────────────────────────────────────────────
describe("loginApi", () => {
  const mockLoginResponse = {
    access_token: "access-tok",
    refresh_token: "refresh-tok",
    token_type: "Bearer",
    expires_in: 3600,
    user: { user_id: "1", email: "user@example.com" },
  };

  // TC-3.1
  it("calls POST /auth/login with email and password", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: mockLoginResponse } });

    await loginApi("user@example.com", "password123");

    expect(mockPost).toHaveBeenCalledWith("/auth/login", {
      email: "user@example.com",
      password: "password123",
    });
  });

  // TC-3.2
  it("returns the unwrapped user and tokens from the server response", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: mockLoginResponse } });

    const result = await loginApi("user@example.com", "password123");

    expect(result.user.user_id).toBe("1");
    expect(result.access_token).toBe("access-tok");
    expect(result.refresh_token).toBe("refresh-tok");
  });

  // TC-3.3
  it("throws when the server responds with an error", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    await expect(loginApi("a@b.com", "wrong")).rejects.toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// signupApi
// ─────────────────────────────────────────────────────────────────────────────
describe("signupApi", () => {
  // TC-3.4
  it("calls POST /auth/signup with email and password", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await signupApi("new@user.com", "password");

    expect(mockPost).toHaveBeenCalledWith("/auth/signup", {
      email: "new@user.com",
      password: "password",
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// logoutApi
// ─────────────────────────────────────────────────────────────────────────────
describe("logoutApi", () => {
  // TC-3.5
  it("calls POST /auth/logout", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await logoutApi();

    expect(mockPost).toHaveBeenCalledWith("/auth/logout");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requestPasswordResetApi
// ─────────────────────────────────────────────────────────────────────────────
describe("requestPasswordResetApi", () => {
  // TC-3.6
  it("calls POST /auth/password-reset/request with email", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await requestPasswordResetApi("user@example.com");

    expect(mockPost).toHaveBeenCalledWith("/auth/password-reset/request", {
      email: "user@example.com",
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyResetCodeApi
// ─────────────────────────────────────────────────────────────────────────────
describe("verifyResetCodeApi", () => {
  // TC-3.7
  it("returns the verification_token from the server response", async () => {
    mockPost.mockResolvedValueOnce({
      data: { data: { verification_token: "vt-abc" } },
    });

    const result = await verifyResetCodeApi("user@example.com", "123456");

    expect(result.verification_token).toBe("vt-abc");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// confirmNewPasswordApi
// ─────────────────────────────────────────────────────────────────────────────
describe("confirmNewPasswordApi", () => {
  // TC-3.8
  it("calls POST /auth/password-reset/confirmation with token and new password", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await confirmNewPasswordApi("vt-abc", "newpassword123");

    expect(mockPost).toHaveBeenCalledWith("/auth/password-reset/confirmation", {
      verification_token: "vt-abc",
      new_password: "newpassword123",
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getGoogleAuthUrlApi
// ─────────────────────────────────────────────────────────────────────────────
describe("getGoogleAuthUrlApi", () => {
  // TC-3.9
  it("calls GET /auth/authorize/google and returns url and state", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          authorization_url: "https://accounts.google.com/oauth",
          state: "random-state-string",
        },
      },
    });

    const result = await getGoogleAuthUrlApi();

    expect(mockGet).toHaveBeenCalledWith("/auth/authorize/google");
    expect(result.authorization_url).toBe("https://accounts.google.com/oauth");
    expect(result.state).toBe("random-state-string");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resendVerificationApi
// ─────────────────────────────────────────────────────────────────────────────
describe("resendVerificationApi", () => {
  // TC-3.10
  it("calls POST /auth/email/resend with email", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await resendVerificationApi("user@example.com");

    expect(mockPost).toHaveBeenCalledWith("/auth/email/resend", {
      email: "user@example.com",
    });
  });
});
