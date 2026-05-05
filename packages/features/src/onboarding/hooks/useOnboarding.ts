"use client";

import { useMutation } from "@tanstack/react-query";
import { completeOnboardingApi } from "../services/onboarding.service";
import { OnboardingPayload } from "../types";

export const useOnboarding = () => {
  const completeMutation = useMutation({
    mutationFn: (payload: OnboardingPayload) => completeOnboardingApi(payload),
  });

  return { completeMutation };
};
