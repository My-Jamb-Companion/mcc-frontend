import { FormValues } from "../types/formTypes";
import { getDraftFromStorage } from "./storage";

const COMPLETION_STORAGE_KEY_PREFIX = "mcc_teacher_onboarding_completed";

export interface OnboardingCompletion {
  completedAt: string;
  values: FormValues;
}

export type OnboardingStatus = "not_started" | "incomplete" | "completed";

// Scoped by user_id -- an unscoped key here was the actual bug: a second
// teacher logging into the same browser as a previously-onboarded one saw
// that first teacher's "completed" record and submitted data presented as
// their own. A missing userId means auth hasn't hydrated yet; return/write
// nothing rather than fall back to a shared key.
const keyFor = (userId: string | null | undefined): string | null =>
  userId ? `${COMPLETION_STORAGE_KEY_PREFIX}:${userId}` : null;

export const getCompletionFromStorage = (userId?: string | null): OnboardingCompletion | null => {
  if (typeof window === "undefined") return null;
  const key = keyFor(userId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as OnboardingCompletion) : null;
  } catch {
    return null;
  }
};

export const saveCompletionToStorage = (values: FormValues, userId?: string | null) => {
  const key = keyFor(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify({ completedAt: new Date().toISOString(), values }));
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
export const getOnboardingStatus = (userId?: string | null): OnboardingStatus => {
  if (getCompletionFromStorage(userId)) return "completed";
  if (getDraftFromStorage(false, userId)) return "incomplete";
  return "not_started";
};
