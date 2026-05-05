import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@mcc/api";
import { completeOnboardingApi } from "./onboarding.service";
import type { OnboardingPayload } from "../types";

// ─── mock the entire @mcc/api module ─────────────────────────────────────────
vi.mock("@mcc/api", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockPost = vi.mocked(apiClient.post);

beforeEach(() => vi.clearAllMocks());

// ─── shared fixtures ──────────────────────────────────────────────────────────
const mockPayload: OnboardingPayload = {
  username: "mac",
  preferred_language: "en-gb",
  self_description: "undergrad",
  referral_source: "tiktok,instagram",
  purpose: ["exam", "skill"],
};

const mockResponseData = {
  redirect_url: "https://mcc-frontend-learner.vercel.app/dashboard",
  enrollment_status: "none",
};

// ─────────────────────────────────────────────────────────────────────────────
// completeOnboardingApi
// ─────────────────────────────────────────────────────────────────────────────
describe("completeOnboardingApi", () => {

  // TC-8.1
  it("calls POST /onboarding/complete with the full payload", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: mockResponseData } });

    await completeOnboardingApi(mockPayload);

    expect(mockPost).toHaveBeenCalledWith("/onboarding/complete", mockPayload);
  });

  // TC-8.2
  it("returns redirect_url from the unwrapped server response", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: mockResponseData } });

    const result = await completeOnboardingApi(mockPayload);

    expect(result.redirect_url).toBe(mockResponseData.redirect_url);
  });

  // TC-8.3
  it("returns enrollment_status from the unwrapped server response", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: mockResponseData } });

    const result = await completeOnboardingApi(mockPayload);

    expect(result.enrollment_status).toBe("none");
  });

  // TC-8.4
  it("throws when the server responds with an error", async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { message: "Validation failed" } },
    });

    await expect(completeOnboardingApi(mockPayload)).rejects.toBeDefined();
  });

  // TC-8.5
  it("only calls apiClient.post once per invocation", async () => {
    mockPost.mockResolvedValueOnce({ data: { data: mockResponseData } });

    await completeOnboardingApi(mockPayload);

    expect(mockPost).toHaveBeenCalledOnce();
  });

});
