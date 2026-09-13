import { FormValues } from "../types/formTypes";
import { getDraftFromStorage } from "./storage";

const COMPLETION_STORAGE_KEY = "mcc_teacher_onboarding_completed";

export interface OnboardingCompletion {
  completedAt: string;
  values: FormValues;
}

export type OnboardingStatus = "not_started" | "incomplete" | "completed";

export const getCompletionFromStorage = (): OnboardingCompletion | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COMPLETION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingCompletion) : null;
  } catch {
    return null;
  }
};

export const saveCompletionToStorage = (values: FormValues) => {
  try {
    localStorage.setItem(
      COMPLETION_STORAGE_KEY,
      JSON.stringify({ completedAt: new Date().toISOString(), values }),
    );
  } catch {
    // localStorage unavailable/full -- the "view what you submitted" screen
    // is a nicety, not required; the real submit already succeeded.
  }
};

// preview=false is deliberate, not a default left unconsidered: preview mode
// never writes a completion record or touches the real draft key (see
// OnboardingContext.handleSubmit and constants/storage.ts), so checking the
// real draft here stays correct regardless of whether this happens to run
// while someone is also previewing in another tab.
export const getOnboardingStatus = (): OnboardingStatus => {
  if (getCompletionFromStorage()) return "completed";
  if (getDraftFromStorage(false)) return "incomplete";
  return "not_started";
};
