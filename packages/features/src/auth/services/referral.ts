const KEY = "mcc_referral_code";

/**
 * The referral code from a friend's invite link (?ref=...), kept for the rest of the visit so
 * it survives moving between pages before signing up. Returns undefined when there is none.
 */
export function captureReferralCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const fromLink = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (fromLink) window.sessionStorage.setItem(KEY, fromLink);
    return window.sessionStorage.getItem(KEY) ?? fromLink ?? undefined;
  } catch {
    // Storage can be blocked: the link itself still works for this page.
    return new URLSearchParams(window.location.search).get("ref")?.trim() || undefined;
  }
}
