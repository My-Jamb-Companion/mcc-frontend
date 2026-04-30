import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { usePasswordReset } from "./usePasswordReset";
import * as authService from "../services/auth.service";

// ─── mock the service layer ───────────────────────────────────────────────────
vi.mock("../services/auth.service", () => ({
  requestPasswordResetApi: vi.fn(),
  verifyResetCodeApi: vi.fn(),
  confirmNewPasswordApi: vi.fn(),
}));

const mockRequestApi = vi.mocked(authService.requestPasswordResetApi);
const mockVerifyApi = vi.mocked(authService.verifyResetCodeApi);
const mockConfirmApi = vi.mocked(authService.confirmNewPasswordApi);

// ─── wrapper ──────────────────────────────────────────────────────────────────
// Each test gets a FRESH QueryClient so mutation states never bleed between tests
function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// requestMutation — Step 1: user submits their email
// ─────────────────────────────────────────────────────────────────────────────
describe("requestMutation", () => {

  // TC-7.1
  it("calls requestPasswordResetApi with the email", async () => {
    mockRequestApi.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.requestMutation.mutate("user@example.com");
    });

    await waitFor(() =>
      expect(result.current.requestMutation.isSuccess).toBe(true),
    );

    expect(mockRequestApi).toHaveBeenCalledWith("user@example.com");
  });

  // TC-7.2
  it("isPending is true while waiting for the server", async () => {
    let resolveFn!: (value: undefined) => void;
    mockRequestApi.mockReturnValue(
      new Promise<undefined>((resolve) => { resolveFn = resolve; }),
    );

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.requestMutation.mutate("user@example.com");
    });

    await waitFor(() =>
      expect(result.current.requestMutation.isPending).toBe(true),
    );

    act(() => resolveFn(undefined));
  });

  // TC-7.3
  it("isError is true when the email is not found", async () => {
    mockRequestApi.mockRejectedValue(new Error("Email not found"));

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.requestMutation.mutate("unknown@example.com");
    });

    await waitFor(() =>
      expect(result.current.requestMutation.isError).toBe(true),
    );
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// verifyMutation — Step 2: user submits the OTP code
// ─────────────────────────────────────────────────────────────────────────────
describe("verifyMutation", () => {

  // TC-7.4
  it("returns the verification_token on success", async () => {
    mockVerifyApi.mockResolvedValue({ verification_token: "vt-xyz" });

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.verifyMutation.mutate({
        email: "user@example.com",
        code: "123456",
      });
    });

    await waitFor(() =>
      expect(result.current.verifyMutation.isSuccess).toBe(true),
    );

    // the hook maps verifyResetCodeApi result to just the token string
    expect(result.current.verifyMutation.data).toBe("vt-xyz");
  });

  // TC-7.5
  it("isError is true when the OTP is invalid", async () => {
    mockVerifyApi.mockRejectedValue(new Error("Invalid code"));

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.verifyMutation.mutate({
        email: "user@example.com",
        code: "000000",
      });
    });

    await waitFor(() =>
      expect(result.current.verifyMutation.isError).toBe(true),
    );
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// confirmMutation — Step 3: user sets their new password
// ─────────────────────────────────────────────────────────────────────────────
describe("confirmMutation", () => {

  // TC-7.6
  it("isPending is true while setting the new password", async () => {
    let resolveFn!: (value: undefined) => void;
    mockConfirmApi.mockReturnValue(
      new Promise<undefined>((resolve) => { resolveFn = resolve; }),
    );

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.confirmMutation.mutate({
        verificationToken: "vt-abc",
        newPassword: "newpassword123",
      });
    });

    await waitFor(() =>
      expect(result.current.confirmMutation.isPending).toBe(true),
    );

    act(() => resolveFn(undefined));
  });

  // TC-7.7
  it("isSuccess is true after password is changed", async () => {
    mockConfirmApi.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.confirmMutation.mutate({
        verificationToken: "vt-abc",
        newPassword: "newpassword123",
      });
    });

    await waitFor(() =>
      expect(result.current.confirmMutation.isSuccess).toBe(true),
    );
  });

  // TC-7.8
  it("isError is true when the verification token has expired", async () => {
    mockConfirmApi.mockRejectedValue(new Error("Token expired"));

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    act(() => {
      result.current.confirmMutation.mutate({
        verificationToken: "expired-token",
        newPassword: "newpassword123",
      });
    });

    await waitFor(() =>
      expect(result.current.confirmMutation.isError).toBe(true),
    );
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// Independence — mutations must not affect each other
// ─────────────────────────────────────────────────────────────────────────────
describe("mutation independence", () => {

  // TC-7.9
  it("an error in verifyMutation does not affect requestMutation or confirmMutation", async () => {
    mockRequestApi.mockResolvedValue(undefined);
    mockVerifyApi.mockRejectedValue(new Error("Invalid code"));
    mockConfirmApi.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePasswordReset(), { wrapper });

    // complete step 1 successfully
    act(() => {
      result.current.requestMutation.mutate("user@example.com");
    });
    await waitFor(() =>
      expect(result.current.requestMutation.isSuccess).toBe(true),
    );

    // fail step 2
    act(() => {
      result.current.verifyMutation.mutate({
        email: "user@example.com",
        code: "000000",
      });
    });
    await waitFor(() =>
      expect(result.current.verifyMutation.isError).toBe(true),
    );

    // step 1 should still be success, step 3 should still be idle
    expect(result.current.requestMutation.isSuccess).toBe(true);
    expect(result.current.confirmMutation.isIdle).toBe(true);
  });

});