export const formatMoney = (amount: string | number, currency = "NGN"): string => {
  const n = Number(amount);
  const value = Number.isFinite(n) ? n.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : String(amount);
  return `${currency === "NGN" ? "₦" : `${currency} `}${value}`;
};

export const STATUS_LABEL: Record<string, string> = {
  successful: "Paid",
  refunded: "Refunded",
  pending: "Waiting for payment",
  failed: "Failed",
  expired: "Expired",
};

/** Only a payment that went through has a receipt. */
export const hasReceipt = (status: string): boolean => status === "successful" || status === "refunded";

export const formatDate = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** What a payment bought, for a list row: the item, or a plain word for the kind when there is none. */
export const paymentTitle = (p: { item: string | null; purpose: string }): string =>
  p.item ?? (p.purpose === "gems" ? "Gems" : p.purpose === "exam_access" ? "Exam prep program" : "Course");
