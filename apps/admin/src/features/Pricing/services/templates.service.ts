import {apiClient} from "@mcc/api";

/**
 * Cost templates and price quotes -- docs/pricing-model.md build step 3.
 * Money and rates arrive as Decimal strings.
 */

export type ProgramType = "course" | "exam";
/**
 * A pricing "edition" is the live-teaching format a student picks at signup: self-paced (no live teaching),
 * a live group (one teacher to five students) or live one-to-one.
 */
export type Edition = "self_paced" | "group" | "one_to_one";
export type DirectCostCategory = "ai" | "messaging" | "hosting" | "acquisition" | "marking" | "materials" | "other";

export interface ApiEditionSummary {
  edition: Edition;
  label: string;
  latest_version: number | null;
  updated_at: string | null;
  default_tier_price: string | null;
  /** What the default tier pays now; null until published. */
  published_price: string | null;
  published_number: number | null;
  /** A publication waiting for a second admin. */
  pending_publication: number | null;
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
  market_ceiling: string | null;
  ai_allowance_months: number;
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
  above_market_ceiling: boolean;
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
  /** The hard floor with VAT: a published price below it sells at a loss. */
  hard_floor_student_pays: string;
  full_cost_base: string;
  contribution: string;
  weighted_multiplier: string;
  expected_average_student_pays: string | null;
  /** Brainy tokens a month each enrolment includes, from its AI cost. */
  ai_monthly_tokens: number | null;
  market_ceiling: string | null;
  /** Null without a ceiling; false when any tier is above it. */
  within_market_ceiling: boolean | null;
  tiers: ApiTierPrice[];
}

/** One live-teaching format of a program: its latest saved cost version, price quote and published price. */
export interface ApiFormat {
  edition: Edition;
  label: string;
  /** Students taught together in one live session (1 = one-to-one). */
  seats: number;
  live: boolean;
  /** False for a live format of a program with no live sessions. */
  applicable: boolean;
  version_number: number | null;
  quote: ApiPriceQuote | null;
  quote_unavailable_reason: string | null;
  published_price: string | null;
  published_number: number | null;
  pending_publication: number | null;
}

/** The program's shared cost inputs as last saved. */
export interface ApiProgramVersion {
  /** The program's revision: send it back as based_on_version. Null until the first save. */
  version_number: number | null;
  live_sessions: number;
  hours_per_session: string;
  teacher_hourly_rate: string;
  direct_costs: ApiDirectCostLine[];
  development_cost: string;
  amortisation_periods: string;
  enrolments_per_period: number;
  ai_allowance_months: number;
  market_ceilings: Partial<Record<Edition, string | null>>;
  margin_override: string | null;
  margin_override_reason: string | null;
  change_reason: string;
  created_by_name: string | null;
  created_at: string;
}

export interface ApiProgramTemplate {
  program: Omit<ApiProgramSummary, "editions">;
  version: ApiProgramVersion | null;
  formats: ApiFormat[];
  /** Which edition's history lists this program's saves. */
  history_edition: Edition;
}

export interface TemplateInput {
  live_sessions: number;
  hours_per_session: string;
  teacher_hourly_rate: string;
  direct_costs: {category: DirectCostCategory; label: string; amount: string; currency: "NGN" | "USD"; vatable: boolean}[];
  development_cost: string;
  amortisation_periods: string;
  enrolments_per_period: number;
  market_ceilings: Partial<Record<Edition, string | null>>;
  ai_allowance_months: number;
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

const programPath = (type: ProgramType, id: string) => `/admin/pricing/programs/${type}/${encodeURIComponent(id)}/template`;

/** Endpoint: GET /admin/pricing/programs/{type}/{id}/template -- the program's cost template and each format's price. */
export const getProgramTemplate = async (type: ProgramType, id: string) =>
  (await apiClient.get<{data: ApiProgramTemplate}>(programPath(type, id))).data.data;

/** Endpoint: POST .../template/quote -- prices unsaved inputs in every format; nothing is stored. */
export const previewProgramQuotes = async (type: ProgramType, id: string, input: TemplateInput) =>
  (await apiClient.post<{data: {formats: ApiFormat[]}}>(`${programPath(type, id)}/quote`, input)).data.data.formats;

/** Endpoint: POST .../template/versions -- saves a new version of every format that applies. */
export const saveProgramTemplate = async (
  type: ProgramType,
  id: string,
  input: TemplateInput & {based_on_version: number | null; change_reason: string},
) => (await apiClient.post<{data: ApiProgramTemplate}>(`${programPath(type, id)}/versions`, input)).data.data;

/** Endpoint: GET .../versions */
export const listTemplateVersions = async (type: ProgramType, id: string, edition: Edition) =>
  (await apiClient.get<{data: {versions: {version_id: string; version_number: number; change_reason: string; created_by_name: string | null; created_at: string}[]}}>(
    `${path(type, id, edition)}/versions`,
  )).data.data.versions;
