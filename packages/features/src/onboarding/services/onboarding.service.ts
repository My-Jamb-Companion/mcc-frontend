import { apiClient, ApiSuccessBody } from "@mcc/api";
import { OnboardingPayload, OnboardingResponseData } from "../types";

export const completeOnboardingApi = async (
  payload: OnboardingPayload
): Promise<OnboardingResponseData> => {
  const res = await apiClient.post<ApiSuccessBody<OnboardingResponseData>>(
    "/onboarding/complete",
    payload
  );
  return res.data.data;
};
