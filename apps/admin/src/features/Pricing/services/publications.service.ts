import {apiClient} from "@mcc/api";
import type {ApiBreakdown, Edition, ProgramType} from "./templates.service";

/**
 * Publishing prices -- docs/pricing-model.md build step 4 (D9, D11, D12).
 * Every amount is what the student pays, VAT included, as a Decimal string.
 */

export interface TierOverride {
  tier_id: string;
  price: string;
  reason: string;
}

export interface ApiProposedTier {
  tier_id: string;
  tier_name: string;
  multiplier: string;
  is_default: boolean;
  formula_price: string;
  previous_price: string | null;
  phase_in_limit: string | null;
  capped: boolean;
  override_price: string | null;
  override_reason: string | null;
  price: string;
  change: string | null;
  below_hard_floor: boolean;
  above_market_ceiling: boolean;
  breakdown: ApiBreakdown;
}

export interface ApiProposal {
  template_version: number;
  parameter_version: number;
  tier_revision: number;
  active_publication: number | null;
  pending_publication: number | null;
  flat_price: string;
  hard_floor_student_pays: string;
  market_ceiling: string | null;
  max_price_increase_rate: string;
  weighted_multiplier: string;
  tiers: ApiProposedTier[];
  blockers: string[];
  phase_in_reason_required: boolean;
  below_cost_reason_required: boolean;
  second_admin_required: boolean;
  changes_prices: boolean;
}

export interface ApiPublishedTier {
  tier_id: string;
  tier_name: string;
  multiplier: string;
  is_default: boolean;
  formula_price: string;
  previous_price: string | null;
  phase_in_limit: string | null;
  capped: boolean;
  override_price: string | null;
  override_reason: string | null;
  price: string;
  below_hard_floor: boolean;
}

export type PublicationStatus = "pending" | "published" | "cancelled";

export interface ApiPublication {
  publication_id: string;
  publication_number: number;
  status: PublicationStatus;
  in_force: boolean;
  program_type: ProgramType;
  program_id: string;
  program_title: string;
  edition: Edition;
  template_version: number;
  parameter_version: number;
  tier_revision: number;
  replaces_publication: number | null;
  hard_floor: string;
  market_ceiling: string;
  max_price_increase_rate: string;
  weighted_multiplier: string;
  change_reason: string;
  phase_in_reason: string | null;
  below_cost_reason: string | null;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  confirmed_by_name: string | null;
  confirmed_at: string | null;
  published_at: string | null;
  cancelled_by_name: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  tiers: ApiPublishedTier[];
}

export interface PublishInput {
  overrides: TierOverride[];
  expected_template_version: number;
  expected_parameter_version: number;
  expected_tier_revision: number;
  expected_active_publication: number | null;
  change_reason: string;
  phase_in_reason: string | null;
  below_cost_reason: string | null;
}

const path = (type: ProgramType, id: string, edition: Edition) =>
  `/admin/pricing/programs/${type}/${encodeURIComponent(id)}/editions/${edition}/publications`;

/** Endpoint: POST .../publications/preview -- nothing is stored. */
export const previewPublication = async (type: ProgramType, id: string, edition: Edition, overrides: TierOverride[]) =>
  (await apiClient.post<{data: ApiProposal}>(`${path(type, id, edition)}/preview`, {overrides})).data.data;

/** Endpoint: POST .../publications */
export const publishPrices = async (type: ProgramType, id: string, edition: Edition, input: PublishInput) =>
  (await apiClient.post<{data: ApiPublication}>(path(type, id, edition), input)).data.data;

/** Endpoint: GET .../publications */
export const listEditionPublications = async (type: ProgramType, id: string, edition: Edition) =>
  (await apiClient.get<{data: {publications: ApiPublication[]}}>(path(type, id, edition))).data.data.publications;

/** Endpoint: GET /admin/pricing/publications?status= */
export const listPublications = async (status?: PublicationStatus) =>
  (await apiClient.get<{data: {publications: ApiPublication[]}}>("/admin/pricing/publications", {
    params: status ? {status} : undefined,
  })).data.data.publications;

/** Endpoint: POST /admin/pricing/publications/{id}/confirm */
export const confirmPublication = async (publicationId: string) =>
  (await apiClient.post<{data: ApiPublication}>(`/admin/pricing/publications/${publicationId}/confirm`)).data.data;

/** Endpoint: POST /admin/pricing/publications/{id}/cancel */
export const cancelPublication = async (publicationId: string, reason: string) =>
  (await apiClient.post<{data: ApiPublication}>(`/admin/pricing/publications/${publicationId}/cancel`, {reason})).data.data;
