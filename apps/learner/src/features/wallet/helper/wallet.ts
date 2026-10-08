import type {ApiGemPacks, Currency, PaymentPurpose, PaymentState} from "../services/wallet.service";

/** Whole units per exchange: [units given, units received]. Mirrors the server (wallet/service.py). */
export const CONVERSIONS = [
  {from: "points", to: "gems", give: 15, get: 1},
  {from: "silver", to: "gems", give: 500, get: 1},
  {from: "gems", to: "points", give: 1, get: 15},
  {from: "gems", to: "silver", give: 1, get: 500},
] as const;

export type Conversion = (typeof CONVERSIONS)[number];

export const CURRENCY_LABEL: Record<Currency, string> = {gems: "gems", points: "points", silver: "silver"};

export const formatSigned = (n: number): string => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString()}`;

export const formatNaira = (n: number | string): string => `₦${Number(n).toLocaleString()}`;

export interface ConversionPlan {
  /** What arrives. */
  received: number;
  /** What is taken (only whole units convert). */
  spent: number;
  /** Offered but kept. */
  unused: number;
  /** Why it cannot go ahead, if it cannot. */
  problem: string | null;
}

/** What converting `amount` would do, for the live preview. The server makes the final call. */
export function planConversion(conversion: Conversion, amount: number, balance: number): ConversionPlan {
  if (!Number.isFinite(amount) || amount <= 0) {
    return {received: 0, spent: 0, unused: 0, problem: null};
  }
  const received = Math.floor(amount / conversion.give) * conversion.get;
  const spent = (received / conversion.get) * conversion.give;
  const unused = amount - spent;
  if (received <= 0) {
    return {
      received, spent, unused,
      problem: `You need at least ${conversion.give.toLocaleString()} ${CURRENCY_LABEL[conversion.from]} to get ${conversion.get} ${conversion.get === 1 ? "gem" : CURRENCY_LABEL[conversion.to]}.`,
    };
  }
  if (spent > balance) {
    return {received, spent, unused, problem: `You only have ${balance.toLocaleString()} ${CURRENCY_LABEL[conversion.from]}.`};
  }
  return {received, spent, unused, problem: null};
}

export type GemAmount = {ok: true; gems: number} | {ok: false; error: string};

/** A typed custom gem amount, checked against the server's bounds. Empty input is not an error, just not ready. */
export function parseGemAmount(input: string, custom: ApiGemPacks["custom"]): GemAmount {
  const trimmed = input.trim();
  if (!trimmed) return {ok: false, error: ""};
  if (!/^\d+$/.test(trimmed)) return {ok: false, error: "Enter a whole number of gems."};
  const gems = Number(trimmed);
  if (gems < custom.min_gems) return {ok: false, error: `Buy at least ${custom.min_gems} gem${custom.min_gems === 1 ? "" : "s"}.`};
  if (gems > custom.max_gems) return {ok: false, error: `You can buy at most ${custom.max_gems.toLocaleString()} gems at a time.`};
  return {ok: true, gems};
}

/** Gems a Naira price costs, rounded up -- the same rule as the server's unlock-with-gems. */
export const courseGemCost = (price: number, nairaPerGem: number): number =>
  nairaPerGem > 0 ? Math.ceil(price / nairaPerGem) : 0;

export const PURPOSE_LABEL: Record<PaymentPurpose, string> = {
  course_enrollment: "Course",
  exam_access: "Exam prep",
  gems: "Gems",
};

export const STATUS_LABEL: Record<PaymentState, string> = {
  pending: "Pending",
  successful: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  expired: "Expired",
};

/** Whether a payment has a receipt to show. */
export const hasReceipt = (status: PaymentState): boolean => status === "successful" || status === "refunded";

export const formatDate = (iso: string | null | undefined): string =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {day: "2-digit", month: "short", year: "numeric"})
    : "";
