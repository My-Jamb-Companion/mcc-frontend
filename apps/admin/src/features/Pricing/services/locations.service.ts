import {apiClient} from "@mcc/api";

/**
 * City pricing -- docs/pricing-model.md build step 2 (§4, D2, D3).
 * Multipliers and shares arrive as Decimal strings; shares are fractions.
 */

export interface ApiTier {
  tier_id: string;
  code: string;
  name: string;
  multiplier: string;
  expected_sales_share: string;
  is_default: boolean;
  sort_order: number;
  city_count: number;
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

export interface ApiPricingCity {
  city_id: string;
  name: string;
  state: string;
  is_other: boolean;
  is_active: boolean;
  tier_id: string | null;
  effective_tier_id: string;
  effective_tier_name: string;
  student_count: number;
}

export interface ApiCityOption {
  city_id: string;
  name: string;
  state: string;
  is_other: boolean;
}

export interface ApiCityChangeRequest {
  request_id: string;
  user_id: string;
  student_name: string | null;
  student_email: string | null;
  from_city: ApiCityOption | null;
  from_tier_name: string | null;
  to_city: ApiCityOption;
  to_tier_name: string | null;
  reason: string;
  status: "pending" | "approved" | "rejected";
  resolution_note: string | null;
  resolved_by_name: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ApiLocationAuditEntry {
  audit_id: string;
  action: string;
  details: Record<string, unknown>;
  reason: string | null;
  actor_name: string | null;
  created_at: string;
}

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
] as const;

/** Endpoint: GET /admin/pricing/tiers */
export const getTierSet = async (): Promise<ApiTierSet> =>
  (await apiClient.get<{data: ApiTierSet}>("/admin/pricing/tiers")).data.data;

/** Endpoint: PUT /admin/pricing/tiers -- the whole set at once. */
export const saveTierSet = async (input: TierSetInput): Promise<ApiTierSet> =>
  (await apiClient.put<{data: ApiTierSet}>("/admin/pricing/tiers", input)).data.data;

/** Endpoint: GET /admin/pricing/cities */
export const listCities = async (filters: {state?: string; tier_id?: string; q?: string}) =>
  (
    await apiClient.get<{data: {cities: ApiPricingCity[]}}>("/admin/pricing/cities", {
      params: Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
    })
  ).data.data.cities;

/** Endpoint: POST /admin/pricing/cities */
export const createCity = async (input: {name: string; state: string; tier_id?: string | null}) =>
  (await apiClient.post<{data: ApiPricingCity}>("/admin/pricing/cities", input)).data.data;

/**
 * Endpoint: PATCH /admin/pricing/cities/{id}
 * Pass tier_id: null explicitly to return a city to the default tier.
 */
export const updateCity = async (
  cityId: string,
  input: {name?: string; tier_id?: string | null; is_active?: boolean},
) => (await apiClient.patch<{data: ApiPricingCity}>(`/admin/pricing/cities/${cityId}`, input)).data.data;

/** Endpoint: POST /admin/pricing/cities/assign */
export const assignCities = async (input: {city_ids: string[]; tier_id: string | null}) =>
  (await apiClient.post<{data: {updated: number}}>("/admin/pricing/cities/assign", input)).data.data;

/** Endpoint: GET /admin/pricing/city-change-requests */
export const listCityChangeRequests = async (status?: string) =>
  (
    await apiClient.get<{data: {requests: ApiCityChangeRequest[]}}>(
      "/admin/pricing/city-change-requests",
      {params: status ? {status} : undefined},
    )
  ).data.data.requests;

/** Endpoint: PATCH /admin/pricing/city-change-requests/{id}/approve|reject */
export const resolveCityChangeRequest = async (
  requestId: string,
  decision: "approve" | "reject",
  note?: string,
) =>
  (
    await apiClient.patch<{data: ApiCityChangeRequest}>(
      `/admin/pricing/city-change-requests/${requestId}/${decision}`,
      {note: note || null},
    )
  ).data.data;

/** Endpoint: GET /admin/pricing/location-audit */
export const listLocationAudit = async () =>
  (await apiClient.get<{data: {entries: ApiLocationAuditEntry[]}}>("/admin/pricing/location-audit"))
    .data.data.entries;
