import {apiClient} from "@mcc/api";

/**
 * Purchasing-power tiers -- docs/pricing-model.md build step 2 (§4, D2).
 * Multipliers and shares arrive as Decimal strings; shares are fractions.
 *
 * Tiers used to be derived from a city a student chose and locked into; that
 * layer was removed (D3, revised) once the admin console's own tier pricing
 * made it redundant -- a tier is now picked directly at checkout instead.
 */

export interface ApiTier {
  tier_id: string;
  code: string;
  name: string;
  multiplier: string;
  expected_sales_share: string;
  is_default: boolean;
  sort_order: number;
  updated_at: string;
}

export interface ApiTierSet {
  revision: number;
  weighted_multiplier: string;
  tiers: ApiTier[];
}

export interface TierSetInput {
  revision: number;
  change_reason: string;
  below_cost_reason?: string | null;
  tiers: {
    tier_id: string;
    name: string;
    multiplier: string;
    expected_sales_share: string;
    is_default: boolean;
  }[];
}

export interface ApiLocationAuditEntry {
  audit_id: string;
  action: string;
  details: Record<string, unknown>;
  reason: string | null;
  actor_name: string | null;
  created_at: string;
}

/** Endpoint: GET /admin/pricing/tiers */
export const getTierSet = async (): Promise<ApiTierSet> =>
  (await apiClient.get<{data: ApiTierSet}>("/admin/pricing/tiers")).data.data;

/** Endpoint: PUT /admin/pricing/tiers -- the whole set at once. */
export const saveTierSet = async (input: TierSetInput): Promise<ApiTierSet> =>
  (await apiClient.put<{data: ApiTierSet}>("/admin/pricing/tiers", input)).data.data;

/**
 * Endpoint: GET /admin/pricing/location-audit -- despite the name (kept for
 * the sake of not renaming a live table), this now only ever logs tier-set
 * edits going forward; older entries from the removed city-pricing layer
 * still appear here for their own history.
 */
export const listLocationAudit = async () =>
  (await apiClient.get<{data: {entries: ApiLocationAuditEntry[]}}>("/admin/pricing/location-audit"))
    .data.data.entries;
