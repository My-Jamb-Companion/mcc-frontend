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
import { showSuccess, showError } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { formSteps } from "../constants/formSteps";
import { FormValues } from "../types/formTypes";
import { getDraftFromStorage, clearDraftFromStorage } from "../constants/storage";
import { saveCompletionToStorage } from "../constants/completion";
import { useOnboardingComplete } from "../hooks/useOnboardingComplete";

interface OnboardingContextValue {
  step: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  previewComplete: boolean;
  /** File objects for "file" fields (id_document, teaching_certificate,
   * selfie_verification) aren't part of FormValues -- see FileUploadField's
   * comment on why. Stored here, outside RHF/localStorage, keyed by field id,
   * and read back only at final submit. */
  setFileValue: (fieldId: string, file: File | null) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
  preview = false,
}: {
  children: ReactNode;
  preview?: boolean;
}) {
  const [step, setStep] = useState(() => getDraftFromStorage(preview)?.step ?? 0);
  const [previewComplete, setPreviewComplete] = useState(false);
  const filesRef = useRef<Record<string, File | null>>({});

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

  const setFileValue = useCallback((fieldId: string, file: File | null) => {
    filesRef.current[fieldId] = file;
  }, []);

  const handleSubmit = useCallback(
    (data: FormValues) => {
      // Preview has no real teacher account behind it -- nothing is ever
      // sent to the backend here, matching PreviewComplete's own copy
      // ("Nothing here was saved").
      if (preview) {
        clearDraftFromStorage(preview);
        setPreviewComplete(true);
        return;
      }

      completeMutation.mutate({ data, files: filesRef.current }, {
        onSuccess: () => {
          clearDraftFromStorage(preview);
          saveCompletionToStorage(data);
          showSuccess(
            "Your teacher profile is complete! We'll notify you once everything is verified.",
          );
          router.push("/dashboard");
        },
        onError: (error) => showError(extractApiError(error, "Couldn't complete onboarding")),
      });
    },
    [completeMutation, router, preview],
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
        previewComplete,
        setFileValue,
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
