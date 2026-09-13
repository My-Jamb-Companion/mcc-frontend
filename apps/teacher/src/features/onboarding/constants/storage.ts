const STORAGE_KEY = "mcc_teacher_onboarding_draft";

// Fields that must never be written to localStorage: the three mocked
// File-backed fields (a File object can't survive JSON.stringify) plus the
// entire "bank" step (sensitive, and mocked anyway -- resetting it on
// refresh is an acceptable tradeoff for a step with no real backend behind
// it). "profile_photo" is deliberately NOT excluded: its value is a real
// https URL returned by POST /user/profile/photo, safe to persist.
const EXCLUDED_FIELDS = [
  "id_document",
  "teaching_certificate",
  "selfie_verification",
  "bank_name",
  "account_number",
  "account_name",
] as const;

export interface OnboardingDraft {
  step: number;
  values: Partial<Record<string, string | string[]>>;
  savedAt: string;
}

export const getDraftFromStorage = (): OnboardingDraft | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
};

export const saveDraftToStorage = (
  step: number,
  values: Record<string, unknown>,
) => {
  const sanitized: Record<string, string | string[]> = {};
  Object.entries(values).forEach(([key, value]) => {
    if ((EXCLUDED_FIELDS as readonly string[]).includes(key)) return;
    if (typeof value === "string" || Array.isArray(value)) {
      sanitized[key] = value as string | string[];
    }
  });
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step, values: sanitized, savedAt: new Date().toISOString() }),
    );
  } catch {
    // localStorage unavailable/full -- draft resume is a nicety, not required.
  }
};

export const clearDraftFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
};
