import {apiClient} from "@mcc/api";

/**
 * The student's city for pricing -- docs/pricing-model.md D3 in the backend
 * repo. Chosen from a fixed list; locked after the first paid purchase, after
 * which a change is a request an admin reviews.
 */

export interface ApiCityOption {
  city_id: string;
  name: string;
  state: string;
  is_other: boolean;
}

export interface ApiMyPricingCity {
  city: ApiCityOption | null;
  locked: boolean;
  locked_at: string | null;
  pending_request: {
    request_id: string;
    to_city: ApiCityOption;
    reason: string;
    created_at: string;
  } | null;
}

/** Endpoint: GET /pricing/cities */
export const getCityOptions = async (): Promise<ApiCityOption[]> =>
  (await apiClient.get<{data: {cities: ApiCityOption[]}}>("/pricing/cities")).data.data.cities;

/** Endpoint: GET /pricing/my-city */
export const getMyCity = async (): Promise<ApiMyPricingCity> =>
  (await apiClient.get<{data: ApiMyPricingCity}>("/pricing/my-city")).data.data;

/** Endpoint: PUT /pricing/my-city -- 409 once the city is locked. */
export const setMyCity = async (cityId: string): Promise<ApiMyPricingCity> =>
  (await apiClient.put<{data: ApiMyPricingCity}>("/pricing/my-city", {city_id: cityId})).data.data;

/** Endpoint: POST /pricing/my-city/change-requests */
export const requestCityChange = async (cityId: string, reason: string): Promise<ApiMyPricingCity> =>
  (
    await apiClient.post<{data: ApiMyPricingCity}>("/pricing/my-city/change-requests", {
      city_id: cityId,
      reason,
    })
  ).data.data;
