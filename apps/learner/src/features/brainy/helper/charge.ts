import type {ApiAllowance, ApiJobCharge} from "../services/brainy.service";

const compact = new Intl.NumberFormat("en", {notation: "compact", maximumFractionDigits: 1});
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * How one answer was paid for, in a few words: "Free", "Allowance", "2 gems",
 * or a mix like "Free + 2 gems". Null when nothing was metered.
 */
export const describeCharge = (charge?: ApiJobCharge | null): string | null => {
  if (!charge) return null;
  const parts: string[] = [];
  if (charge.free_tokens > 0) parts.push("Free");
  if (charge.allowance_tokens > 0) parts.push("Allowance");
  if (charge.gems_charged > 0) parts.push(plural(charge.gems_charged, "gem"));
  if (charge.gems_short > 0 && charge.gems_charged === 0) parts.push("out of gems");
  return parts.length ? parts.join(" + ") : null;
};

/** What's left, for the line under the composer. Null when Brainy isn't metered for this user. */
export const allowanceSummary = (allowance?: ApiAllowance | null): string | null => {
  if (!allowance?.metered) return null;
  const parts = [`${compact.format(allowance.free_left_today ?? 0)} free tokens left today`];
  if ((allowance.monthly_allowance_tokens ?? 0) > 0) {
    parts.push(`${compact.format(allowance.allowance_left_this_month ?? 0)} left this month`);
  }
  parts.push(plural(allowance.gems, "gem"));
  return parts.join(" · ");
};

/** Whether a failed Brainy request was refused because nothing is left to pay for it. */
export const isAllowanceUsed = (error: unknown): boolean => {
  const response = (error as {response?: {status?: number; data?: {error?: {code?: string}}}})?.response;
  return response?.status === 402 || response?.data?.error?.code === "BRAINY_ALLOWANCE_USED";
};
