import {apiClient} from "@mcc/api";

export type Currency = "gems" | "points" | "silver";

/** Endpoint: GET /wallet/balance */
export interface ApiWalletBalance {
  gems: number;
  points: number;
  silver: number;
  /** Bought with money: the only gems that can buy courses. */
  purchased_gems: number;
  /** From goals, referrals, prizes and conversions: for Brainy and extras. */
  earned_gems: number;
}

export type TransactionKind =
  | "purchase" | "refund" | "unlock" | "convert" | "reward" | "earned" | "brainy" | "other";

export interface ApiWalletTransaction {
  id: string;
  currency: Currency;
  /** Signed: positive credits, negative spends. */
  amount: number;
  type: string;
  kind: TransactionKind;
  /** The row in plain words, e.g. "Unlocked Intro to Physics". */
  label: string;
  reference_id: string | null;
  created_at: string | null;
}

export interface ApiWalletTransactionPage {
  items: ApiWalletTransaction[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}

export interface ApiGemPacks {
  currency: string;
  naira_per_gem: number;
  packs: {gems: number; amount: number}[];
  custom: {min_gems: number; max_gems: number};
}

export interface ApiConversion {
  from: Currency;
  to: Currency;
  exchange_rate: number;
  amount_received: number;
  /** What is actually taken: only whole units convert. */
  amount_spent: number;
  /** Offered but kept in the wallet. */
  amount_unused: number;
  source_balance?: number;
  target_balance?: number;
}

export interface ApiGemPurchase {
  checkout_url: string;
  tx_ref: string;
  gems_amount: number;
  amount: number | string;
}

export type PaymentPurpose = "course_enrollment" | "exam_access" | "gems";
export type PaymentState = "pending" | "successful" | "failed" | "refunded" | "expired";

export interface ApiPayment {
  tx_ref: string;
  purpose: PaymentPurpose;
  status: PaymentState;
  amount: string | number;
  currency: string;
  gems_amount: number | null;
  receipt_number: string | null;
  granted: boolean;
  created_at: string | null;
  completed_at: string | null;
  item: string | null;
  refunded_at: string | null;
}

export interface ApiReceipt {
  receipt_number: string | null;
  tx_ref: string;
  item: string;
  purpose: PaymentPurpose;
  amount: string;
  currency: string;
  status: PaymentState;
  method: string;
  paid_at: string | null;
}

export interface ApiGemUnlock {
  enrollment_id: string;
  course_id: string;
  gems_spent: number;
  gems_balance: number;
}

/** Endpoint: GET /wallet/balance */
export const getWalletBalance = async (): Promise<ApiWalletBalance> =>
  (await apiClient.get<{data: ApiWalletBalance}>("/wallet/balance")).data.data;

/** Endpoint: GET /wallet/transactions */
export const getWalletTransactions = async (
  page: number,
  currency?: Currency,
): Promise<ApiWalletTransactionPage> =>
  (await apiClient.get<{data: ApiWalletTransactionPage}>("/wallet/transactions", {
    params: {page, limit: 15, ...(currency ? {currency} : {})},
  })).data.data;

/** Endpoint: GET /wallet/packs */
export const getGemPacks = async (): Promise<ApiGemPacks> =>
  (await apiClient.get<{data: ApiGemPacks}>("/wallet/packs")).data.data;

/** Endpoint: POST /wallet/convert */
export const convertCurrency = async (from: Currency, to: Currency, amount: number): Promise<ApiConversion> =>
  (await apiClient.post<{data: ApiConversion}>("/wallet/convert", {
    from_currency: from, to_currency: to, amount,
  })).data.data;

/** Endpoint: POST /payments/gems/purchase -- returns a Flutterwave checkout to send the browser to. */
export const purchaseGems = async (gems: number): Promise<ApiGemPurchase> =>
  (await apiClient.post<{data: ApiGemPurchase}>("/payments/gems/purchase", {gems_amount: gems})).data.data;

/** Endpoint: GET /payments/history */
export const getPaymentHistory = async (): Promise<ApiPayment[]> =>
  (await apiClient.get<{data: {payments: ApiPayment[]}}>("/payments/history")).data.data.payments;

/** Endpoint: GET /payments/<tx_ref>/receipt */
export const getReceipt = async (txRef: string): Promise<ApiReceipt> =>
  (await apiClient.get<{data: ApiReceipt}>(`/payments/${txRef}/receipt`)).data.data;

/** Endpoint: POST /payments/gems/unlock-course -- spends purchased gems on a paid course. */
export const unlockCourseWithGems = async (courseId: string, tierId?: string): Promise<ApiGemUnlock> =>
  (await apiClient.post<{data: ApiGemUnlock}>("/payments/gems/unlock-course", {
    course_id: courseId, tier_id: tierId,
  })).data.data;
