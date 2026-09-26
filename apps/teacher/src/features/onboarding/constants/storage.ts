const STORAGE_KEY_PREFIX = "mcc_teacher_onboarding_draft";
// Kept separate from the real draft: a previewer's inputs should never
// pre-fill a real teacher's actual onboarding session, and vice versa.
// Not user-scoped like the real draft below -- preview has no real account
// behind it, so there's nothing to scope it to; two people previewing on
// the same browser sharing that draft is an accepted, low-stakes tradeoff.
const PREVIEW_STORAGE_KEY = "mcc_teacher_onboarding_preview_draft";

// Fields that must never be written to localStorage: the three mocked
// File-backed fields (a File object can't survive JSON.stringify) plus the
// entire "bank" step (sensitive, and mocked anyway -- resetting it on
// refresh is an acceptable tradeoff for a step with no real backend behind
// it). "profile_photo" is deliberately NOT excluded outside preview mode:
// its value is a real https URL returned by POST /user/profile/photo, safe
// to persist. In preview mode profile_photo is mocked too (see
// ProfilePhotoField), but excluding it unconditionally would just mean a
// previewer's local-only thumbnail doesn't survive a refresh -- harmless
// either way, so the same exclusion list is reused for both keys.
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

// Scoped by user_id (real draft only -- preview has none, see above): two
// different teachers signed into the same browser must never see each
// other's draft. A missing userId on a non-preview call means the caller
// couldn't identify whose draft this is (auth not hydrated yet) -- null,
// not a fallback to an unscoped key, so it fails closed rather than
// risking a repeat of exactly this bug.
const keyFor = (preview: boolean, userId: string | null | undefined): string | null => {
  if (preview) return PREVIEW_STORAGE_KEY;
  return userId ? `${STORAGE_KEY_PREFIX}:${userId}` : null;
};

export const getDraftFromStorage = (
  preview = false,
  userId?: string | null,
): OnboardingDraft | null => {
  if (typeof window === "undefined") return null;
  const key = keyFor(preview, userId);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
};

export const saveDraftToStorage = (
  step: number,
  values: Record<string, unknown>,
  preview = false,
  userId?: string | null,
) => {
  const storageKey = keyFor(preview, userId);
  if (!storageKey) return;
  const sanitized: Record<string, string | string[]> = {};
  Object.entries(values).forEach(([key, value]) => {
    if ((EXCLUDED_FIELDS as readonly string[]).includes(key)) return;
    if (typeof value === "string" || Array.isArray(value)) {
      sanitized[key] = value as string | string[];
    }
  });
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ step, values: sanitized, savedAt: new Date().toISOString() }),
    );
  } catch {
    // localStorage unavailable/full -- draft resume is a nicety, not required.
  }
};

export const clearDraftFromStorage = (preview = false, userId?: string | null) => {
  const key = keyFor(preview, userId);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
};
