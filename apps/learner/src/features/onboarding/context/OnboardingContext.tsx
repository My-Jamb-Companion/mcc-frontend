"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboarding, OnboardingPayload } from "@mcc/features";
import { useAuthStore } from "@mcc/store";
import { extractApiError, USER_KEY } from "@mcc/api";
import { formSteps } from "../constants/formSteps";
import { FormValues, SelectedOnboardingItem } from "../types/formTypes";
import { enrollCourse, initializeCoursePayment } from "@/src/features/courses/services/course.service";
import { registerForProgram } from "@/src/features/exams/services/exam.service";

interface OnboardingContextValue {
  step: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  isError: boolean;
  errorMessage: string;
  paidModalOpen: boolean;
  paidItemCount: number;
  confirmPaidEnrollment: () => void;
  closePaidModal: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** Enrols every free item in parallel; returns true once at least one of
 * them actually succeeded (not merely attempted) -- a step4 selection that
 * passed the "has a free item" UI gate must not let onboarding complete
 * with zero real enrollments if every call happened to fail. */
async function enrollFreeItems(items: SelectedOnboardingItem[]): Promise<boolean> {
  if (items.length === 0) return false;
  const results = await Promise.allSettled(
    items.map((item) =>
      item.kind === "course" ? enrollCourse(item.id, "free") : registerForProgram(item.id),
    ),
  );
  return results.some((r) => r.status === "fulfilled");
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [paidItemCount, setPaidItemCount] = useState(0);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { completeMutation } = useOnboarding();
  const { user, setUser } = useAuthStore();

  const pendingDataRef = useRef<FormValues | null>(null);

  const nextStep = useCallback(
    () => setStep((prev) => Math.min(prev + 1, formSteps.length - 1)),
    [],
  );

  const prevStep = useCallback(() => setStep((prev) => Math.max(prev - 1, 0)), []);

  const finishOnboarding = useCallback(
    async (data: FormValues) => {
      const payload: OnboardingPayload = {
        username: data.nickname,
        preferred_language: data.language,
        self_description: data.role,
        referral_source: data.referral.join(","),
        referral_source_other: data.referral.includes("other") ? data.referralOther : undefined,
        purpose: data.purpose,
        purpose_other: data.purpose.includes("other") ? data.purposeOther : undefined,
      };
      const response = await completeMutation.mutateAsync(payload);
      if (user) {
        const updated = { ...user, is_onboarded: true };
        setUser(updated);
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      }
      queryClient.invalidateQueries({ queryKey: ["courses", "enrolled"] });
      queryClient.invalidateQueries({ queryKey: ["exam-programs", "enrolled"] });
      try {
        const { pathname } = new URL(response.redirect_url);
        router.push(pathname);
      } catch {
        router.push(response.redirect_url);
      }
    },
    [completeMutation, user, setUser, queryClient, router],
  );

  const handleSubmit = useCallback(
    (data: FormValues) => {
      setIsError(false);
      const paidItems = data.selectedItems.filter((i) => i.price > 0);

      if (paidItems.length > 0) {
        // Needs a fresh user gesture (the modal's own "Continue" button) to
        // open payment tabs without being blocked -- stash the data and
        // wait for it instead of proceeding here.
        pendingDataRef.current = data;
        setPaidItemCount(paidItems.length);
        setPaidModalOpen(true);
        return;
      }

      (async () => {
        setIsSubmitting(true);
        try {
          const freeItems = data.selectedItems.filter((i) => i.price === 0);
          const anySucceeded = await enrollFreeItems(freeItems);
          if (!anySucceeded) {
            setIsError(true);
            setErrorMessage("Couldn't enrol you in that just now. Please try again.");
            return;
          }
          await finishOnboarding(data);
        } catch (err) {
          setIsError(true);
          setErrorMessage(extractApiError(err, "Failed to complete onboarding. Please try again."));
        } finally {
          setIsSubmitting(false);
        }
      })();
    },
    [finishOnboarding],
  );

  const closePaidModal = useCallback(() => {
    setPaidModalOpen(false);
    pendingDataRef.current = null;
  }, []);

  const confirmPaidEnrollment = useCallback(() => {
    const data = pendingDataRef.current;
    if (!data) return;

    const paidItems = data.selectedItems.filter((i) => i.price > 0);
    const freeItems = data.selectedItems.filter((i) => i.price === 0);

    // One blank tab per paid item, opened SYNCHRONOUSLY right here in this
    // click handler -- once we `await` the payment-init calls below, a
    // later window.open would no longer count as a direct response to
    // user interaction and gets blocked as a popup.
    const tabs = paidItems.map(() => window.open("", "_blank"));

    setPaidModalOpen(false);
    setIsSubmitting(true);
    setIsError(false);

    (async () => {
      try {
        const [anyFreeSucceeded] = await Promise.all([
          enrollFreeItems(freeItems),
          Promise.allSettled(
            paidItems.map(async (item, idx) => {
              const tab = tabs[idx];
              try {
                const result =
                  item.kind === "course"
                    ? await initializeCoursePayment(item.id, "paid", user?.email)
                    : await registerForProgram(item.id, user?.email);
                if (result.checkout_url && tab) {
                  tab.location.href = result.checkout_url;
                } else {
                  // Looked paid in the catalogue list but resolved free
                  // (or something else went wrong) -- nothing to show there.
                  tab?.close();
                }
              } catch {
                tab?.close();
              }
            }),
          ),
        ]);

        if (!anyFreeSucceeded) {
          setIsError(true);
          setErrorMessage("Couldn't enrol you in your free pick just now. Please try again.");
          return;
        }

        await finishOnboarding(data);
      } catch (err) {
        setIsError(true);
        setErrorMessage(extractApiError(err, "Failed to complete onboarding. Please try again."));
      } finally {
        setIsSubmitting(false);
        pendingDataRef.current = null;
      }
    })();
  }, [finishOnboarding, user]);

  return (
    <OnboardingContext.Provider
      value={{
        step,
        totalSteps: formSteps.length,
        nextStep,
        prevStep,
        handleSubmit,
        isSubmitting,
        isError,
        errorMessage,
        paidModalOpen,
        paidItemCount,
        confirmPaidEnrollment,
        closePaidModal,
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
