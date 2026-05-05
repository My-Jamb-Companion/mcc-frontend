import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useOnboarding } from "./useOnboarding";
import * as onboardingService from "../services/onboarding.service";
import type { OnboardingPayload } from "../types";

// ─── mock the service layer ───────────────────────────────────────────────────
vi.mock("../services/onboarding.service", () => ({
  completeOnboardingApi: vi.fn(),
}));

const mockCompleteApi = vi.mocked(onboardingService.completeOnboardingApi);

// ─── shared fixtures ──────────────────────────────────────────────────────────
const mockPayload: OnboardingPayload = {
  username: "mac",
  preferred_language: "en-gb",
  self_description: "undergrad",
  referral_source: "tiktok,instagram",
  purpose: ["exam", "skill"],
};

const mockResponse = {
  redirect_url: "https://mcc-frontend-learner.vercel.app/dashboard",
  enrollment_status: "none",
};

// ─── QueryClient wrapper ──────────────────────────────────────────────────────
function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────────────────────────────────────
// useOnboarding
// ─────────────────────────────────────────────────────────────────────────────
describe("useOnboarding", () => {

  // TC-9.1
  it("exposes completeMutation", () => {
    const { result } = renderHook(() => useOnboarding(), { wrapper });

    expect(result.current.completeMutation).toBeDefined();
  });

  // TC-9.2
  it("completeMutation.isPending is true while the request is in flight", async () => {
    let resolve!: (v: typeof mockResponse) => void;
    mockCompleteApi.mockReturnValueOnce(new Promise((r) => (resolve = r)));

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.completeMutation.mutate(mockPayload);
    });

    await waitFor(() =>
      expect(result.current.completeMutation.isPending).toBe(true)
    );

    // clean up the pending promise
    act(() => resolve(mockResponse));
  });

  // TC-9.3
  it("completeMutation.isSuccess is true after a successful call", async () => {
    mockCompleteApi.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.completeMutation.mutate(mockPayload);
    });

    await waitFor(() =>
      expect(result.current.completeMutation.isSuccess).toBe(true)
    );

    expect(mockCompleteApi).toHaveBeenCalledWith(mockPayload);
  });

  // TC-9.4
  it("completeMutation.data holds redirect_url and enrollment_status on success", async () => {
    mockCompleteApi.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.completeMutation.mutate(mockPayload);
    });

    await waitFor(() =>
      expect(result.current.completeMutation.isSuccess).toBe(true)
    );

    expect(result.current.completeMutation.data?.redirect_url).toBe(
      mockResponse.redirect_url
    );
    expect(result.current.completeMutation.data?.enrollment_status).toBe("none");
  });

  // TC-9.5
  it("completeMutation.isError is true when the API fails", async () => {
    mockCompleteApi.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.completeMutation.mutate(mockPayload);
    });

    await waitFor(() =>
      expect(result.current.completeMutation.isError).toBe(true)
    );
  });

  // TC-9.6
  it("calls completeOnboardingApi exactly once per mutate call", async () => {
    mockCompleteApi.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    act(() => {
      result.current.completeMutation.mutate(mockPayload);
    });

    await waitFor(() =>
      expect(result.current.completeMutation.isSuccess).toBe(true)
    );

    expect(mockCompleteApi).toHaveBeenCalledOnce();
  });

});
