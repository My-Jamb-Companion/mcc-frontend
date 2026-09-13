"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { showSuccess } from "@mcc/ui";
import { formSteps } from "../constants/formSteps";
import { FormValues } from "../types/formTypes";
import { getDraftFromStorage, clearDraftFromStorage } from "../constants/storage";
import { useOnboardingComplete } from "../hooks/useOnboardingComplete";

interface OnboardingContextValue {
  step: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(() => getDraftFromStorage()?.step ?? 0);

  const router = useRouter();
  const { completeMutation } = useOnboardingComplete();

  const nextStep = useCallback(
    () => setStep((prev) => Math.min(prev + 1, formSteps.length - 1)),
    [],
  );

  const prevStep = useCallback(
    () => setStep((prev) => Math.max(prev - 1, 0)),
    [],
  );

  const handleSubmit = useCallback(
    (data: FormValues) => {
      completeMutation.mutate(data, {
        onSuccess: () => {
          clearDraftFromStorage();
          showSuccess(
            "Your teacher profile is complete! We'll notify you once everything is verified.",
          );
          router.push("/dashboard");
        },
      });
    },
    [completeMutation, router],
  );

  return (
    <OnboardingContext.Provider
      value={{
        step,
        totalSteps: formSteps.length,
        nextStep,
        prevStep,
        handleSubmit,
        isSubmitting: completeMutation.isPending,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboardingContext must be used within OnboardingProvider");
  }
  return ctx;
}
