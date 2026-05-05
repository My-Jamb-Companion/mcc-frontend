"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, OnboardingPayload } from "@mcc/features";
import {
  useAuthStore,
  useCourseStore,
  getPendingCourseFromStorage,
  PendingCourse,
} from "@mcc/store";
import { extractApiError } from "@mcc/api";
import { formSteps } from "../constants/formSteps";
import { FormValues } from "../types/formTypes";

interface OnboardingContextValue {
  step: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  isError: boolean;
  errorMessage: string;
  completedCourse: PendingCourse | null;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const [completedCourse, setCompletedCourse] = useState<PendingCourse | null>(
    null
  );

  const router = useRouter();
  const { completeMutation } = useOnboarding();
  const { user, setUser } = useAuthStore();
  const { pendingCourse, clearPendingCourse } = useCourseStore();

  const nextStep = useCallback(
    () => setStep((prev) => Math.min(prev + 1, formSteps.length - 1)),
    []
  );

  const prevStep = useCallback(
    () => setStep((prev) => Math.max(prev - 1, 0)),
    []
  );

  const handleSubmit = useCallback(
    (data: FormValues) => {
      const payload: OnboardingPayload = {
        username: data.nickname,
        preferred_language: data.language,
        self_description: data.role,
        referral_source: data.referral.join(","),
        purpose: data.purpose,
      };
      completeMutation.mutate(payload, {
        onSuccess: (response) => {
          if (user) {
            const updated = { ...user, is_onboarded: true };
            setUser(updated);
            localStorage.setItem("mcc_user", JSON.stringify(updated));
          }

          const course = pendingCourse ?? getPendingCourseFromStorage();
          if (course) {
            clearPendingCourse();
            setCompletedCourse(course);
          } else {
            try {
              const { pathname } = new URL(response.redirect_url);
              router.push(pathname);
            } catch {
              router.push(response.redirect_url);
            }
          }
        },
      });
    },
    [completeMutation, user, setUser, pendingCourse, clearPendingCourse, router]
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
        isError: completeMutation.isError,
        errorMessage: extractApiError(
          completeMutation.error,
          "Failed to complete onboarding. Please try again."
        ),
        completedCourse,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error(
      "useOnboardingContext must be used within OnboardingProvider"
    );
  return ctx;
}
