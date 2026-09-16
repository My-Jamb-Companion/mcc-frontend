import {apiClient} from "@mcc/api";

/**
 * Cost templates and price quotes -- docs/pricing-model.md build step 3.
 * Money and rates arrive as Decimal strings.
 */

export type ProgramType = "course" | "exam";
export type Edition = "standard" | "premium";
export type DirectCostCategory = "ai" | "messaging" | "hosting" | "acquisition" | "marking" | "materials" | "other";

export interface ApiEditionSummary {
  edition: Edition;
  label: string;
  latest_version: number | null;
  updated_at: string | null;
  default_tier_price: string | null;
}

export interface ApiProgramSummary {
  program_type: ProgramType;
  program_id: string;
  title: string;
  status: string | null;
  current_price: string;
  editions: ApiEditionSummary[];
}

export interface ApiDirectCostLine {
  line_id: string;
  category: DirectCostCategory;
  label: string;
  amount: string;
  currency: "NGN" | "USD";
  vatable: boolean;
  amount_ngn: string | null;
}

export interface ApiTemplateVersion {
  version_id: string;
  version_number: number;
  live_sessions: number;
  hours_per_session: string;
  teacher_hourly_rate: string;
  seats_per_session: number;
  direct_costs: ApiDirectCostLine[];
  development_cost: string;
  amortisation_periods: string;
  enrolments_per_period: number;
  margin_override: string | null;
  margin_override_reason: string | null;
  change_reason: string;
  created_by_name: string | null;
  created_at: string;
}

export interface ApiBreakdown {
  vat: string;
  gateway_fee: string;
  referral_payout: string;
  refund_reserve: string;
  live_teaching: string;
  direct_costs: Partial<Record<DirectCostCategory, string>>;
  development_recovery: string;
  overhead_recovery: string;
  profit_before_tax: string;
  income_tax_provision: string;
}

export interface ApiTierPrice {
  tier_id: string;
  code: string | null;
  name: string;
  multiplier: string;
  expected_sales_share: string;
  is_default: boolean;
  price_before_vat: string;
  student_pays: string;
  breakdown: ApiBreakdown;
}

export interface ApiPriceQuote {
  parameter_version: number;
  tier_revision: number;
  teaching_cost_per_enrolment: string;
  other_direct_cost_per_enrolment: string;
  direct_cost_per_enrolment: string;
  development_cost_per_enrolment: string;
  overhead_per_enrolment: string;
  sale_deduction_rate: string;
  pre_tax_margin: string;
  margin_overridden: boolean;
  effective_vat_rate: string;
  price_headroom: string;
  hard_floor: string;
  full_cost_base: string;
  contribution: string;
  weighted_multiplier: string;
  expected_average_student_pays: string | null;
  tiers: ApiTierPrice[];
}

export interface ApiTemplateDetail {
  program: Omit<ApiProgramSummary, "editions">;
  edition: Edition;
  edition_label: string;
  version: ApiTemplateVersion | null;
  quote: ApiPriceQuote | null;
  quote_unavailable_reason: string | null;
}

export interface TemplateInput {
  live_sessions: number;
  hours_per_session: string;
  teacher_hourly_rate: string;
  seats_per_session: number;
  direct_costs: {category: DirectCostCategory; label: string; amount: string; currency: "NGN" | "USD"; vatable: boolean}[];
  development_cost: string;
  amortisation_periods: string;
  enrolments_per_period: number;
  margin_override: string | null;
  margin_override_reason: string | null;
}

const path = (type: ProgramType, id: string, edition: Edition) =>
  `/admin/pricing/programs/${type}/${encodeURIComponent(id)}/editions/${edition}`;

/** Endpoint: GET /admin/pricing/programs */
export const listPricedPrograms = async () =>
  (await apiClient.get<{data: {parameters_configured: boolean; programs: ApiProgramSummary[]}}>(
    "/admin/pricing/programs",
  )).data.data;

/** Endpoint: GET /admin/pricing/programs/{type}/{id}/editions/{edition} */
export const getTemplate = async (type: ProgramType, id: string, edition: Edition) =>
  (await apiClient.get<{data: ApiTemplateDetail}>(path(type, id, edition))).data.data;

/** Endpoint: POST .../quote -- prices unsaved inputs; nothing is stored. */
export const previewQuote = async (type: ProgramType, id: string, edition: Edition, input: TemplateInput) =>
  (await apiClient.post<{data: ApiPriceQuote}>(`${path(type, id, edition)}/quote`, input)).data.data;

/** Endpoint: POST .../versions */
export const saveTemplateVersion = async (
  type: ProgramType,
  id: string,
  edition: Edition,
  input: TemplateInput & {based_on_version: number | null; change_reason: string},
) => (await apiClient.post<{data: ApiTemplateDetail}>(`${path(type, id, edition)}/versions`, input)).data.data;

/** Endpoint: GET .../versions */
export const listTemplateVersions = async (type: ProgramType, id: string, edition: Edition) =>
  (await apiClient.get<{data: {versions: {version_id: string; version_number: number; change_reason: string; created_by_name: string | null; created_at: string}[]}}>(
    `${path(type, id, edition)}/versions`,
  )).data.data.versions;
