import {apiClient} from "@mcc/api";

/**
 * Company pricing parameters -- docs/pricing-model.md build step 1.
 *
 * Rates travel as fractions (0.075 is 7.5%). The API returns Decimals as
 * strings to keep their precision; convert with Number() only for display.
 */

export type OverheadCategory =
  | "legal"
  | "accounting"
  | "statutory"
  | "payroll"
  | "equipment"
  | "hosting"
  | "software"
  | "advertising"
  | "other";

export type VatTreatment = "standard" | "exempt" | "zero_rated";
export type CompanyTaxStatus = "small" | "standard";
export type OverheadCurrency = "NGN" | "USD";

export interface ApiOverheadLine {
  line_id: string;
  category: OverheadCategory;
  label: string;
  annual_amount: string;
  currency: OverheadCurrency;
  vatable: boolean;
  annual_amount_ngn: string;
}

export interface ApiDerivedFigures {
  effective_vat_rate: string;
  tax_rate: string;
  pre_tax_margin: string;
  blended_referral_rate: string;
  sale_deduction_rate: string;
  price_headroom: string;
  effective_usd_rate: string;
  annual_overhead: string;
  overhead_per_enrolment: string;
}

export interface ApiPricingParameters {
  version_id: string;
  version_number: number;
  change_reason: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  expected_catalogue_enrolments: number;
  vat_treatment: VatTreatment;
  vat_rate: string;
  gateway_rate: string;
  referral_share: string;
  referral_payout_rate: string;
  refund_reserve_rate: string;
  target_after_tax_margin: string;
  company_tax_status: CompanyTaxStatus;
  income_tax_rate: string;
  development_levy_rate: string;
  usd_ngn_rate: string;
  fx_buffer_rate: string;
  fx_reprice_threshold: string;
  price_rounding_step: number;
  max_price_increase_rate: string;
  overhead_lines: ApiOverheadLine[];
  derived: ApiDerivedFigures;
}

export interface ApiPricingVersionSummary {
  version_id: string;
  version_number: number;
  change_reason: string;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
}

export interface PricingParametersInput {
  based_on_version: number | null;
  change_reason: string;
  expected_catalogue_enrolments: number;
  overhead_lines: {
    category: OverheadCategory;
    label: string;
    annual_amount: string;
    currency: OverheadCurrency;
    vatable: boolean;
  }[];
  vat_treatment: VatTreatment;
  vat_rate: string;
  gateway_rate: string;
  referral_share: string;
  referral_payout_rate: string;
  refund_reserve_rate: string;
  target_after_tax_margin: string;
  company_tax_status: CompanyTaxStatus;
  income_tax_rate: string;
  development_levy_rate: string;
  usd_ngn_rate: string;
  fx_buffer_rate: string;
  fx_reprice_threshold: string;
  price_rounding_step: number;
  max_price_increase_rate: string;
}

/**
 * Endpoint: GET /admin/pricing/parameters
 *
 * Resolves to null -- not an error -- when no version exists yet (404): a
 * brand-new install legitimately has no parameters, and the screen should
 * offer to create the first version rather than show a failure.
 */
export const getActivePricingParameters = async (): Promise<ApiPricingParameters | null> => {
  try {
    const res = await apiClient.get<{data: ApiPricingParameters}>("/admin/pricing/parameters");
    return res.data.data;
  } catch (error) {
    const status = (error as {response?: {status?: number}})?.response?.status;
    if (status === 404) return null;
    throw error;
  }
};

/** Endpoint: POST /admin/pricing/parameters -- saves a new version, active immediately. */
export const createPricingParameters = async (
  input: PricingParametersInput,
): Promise<ApiPricingParameters> => {
  const res = await apiClient.post<{data: ApiPricingParameters}>(
    "/admin/pricing/parameters",
    input,
  );
  return res.data.data;
};

/** Endpoint: GET /admin/pricing/parameters/versions -- newest first. */
export const listPricingVersions = async (): Promise<ApiPricingVersionSummary[]> => {
  const res = await apiClient.get<{data: {versions: ApiPricingVersionSummary[]}}>(
    "/admin/pricing/parameters/versions",
  );
  return res.data.data.versions;
};

/** Endpoint: GET /admin/pricing/parameters/versions/{n} */
export const getPricingVersion = async (versionNumber: number): Promise<ApiPricingParameters> => {
  const res = await apiClient.get<{data: ApiPricingParameters}>(
    `/admin/pricing/parameters/versions/${versionNumber}`,
  );
  return res.data.data;
};

/**
 * The backend's 422 carries a generic top-level message ("Input validation
 * failed"); the useful sentence -- e.g. that fees and margin leave nothing to
 * cover costs -- is in `error.details`. Prefer it.
 */
export const pricingErrorMessage = (error: unknown, fallback: string): string => {
  const data = (error as {response?: {data?: {message?: string; error?: {details?: Record<string, string[]>}}}})
    ?.response?.data;
  const details = data?.error?.details;
  if (details) {
    const first = Object.values(details).flat()[0];
    if (first) return first.replace(/^Value error,\s*/, "");
  }
  return data?.message || fallback;
};
