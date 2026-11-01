import {apiClient} from "@mcc/api";

/** One slide of the learner Explore page's slider. */
export interface ApiBanner {
  banner_id: string;
  caption: string;
  image_url: string | null;
  bg_color: string;
  text_color: string;
  button_label: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface BannerPayload {
  caption: string;
  /** Empty removes the image. */
  image_url: string;
  bg_color: string;
  text_color: string;
  button_label: string;
  link_url: string;
  is_active: boolean;
}

/** Endpoint: GET /admin/banners -- every slide, on or off, in the order they show. */
export const listBanners = async (): Promise<ApiBanner[]> =>
  (await apiClient.get<{data: {banners: ApiBanner[]}}>("/admin/banners")).data.data.banners;

/** Endpoint: POST /admin/banners */
export const createBanner = async (payload: BannerPayload): Promise<ApiBanner> =>
  (await apiClient.post<{data: ApiBanner}>("/admin/banners", payload)).data.data;

/** Endpoint: PATCH /admin/banners/<id> */
export const updateBanner = async (id: string, payload: Partial<BannerPayload>): Promise<ApiBanner> =>
  (await apiClient.patch<{data: ApiBanner}>(`/admin/banners/${id}`, payload)).data.data;

/** Endpoint: DELETE /admin/banners/<id> */
export const deleteBanner = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/banners/${id}`);
};

/** Endpoint: PUT /admin/banners/reorder -- every id, once, in the order to show. */
export const reorderBanners = async (ids: string[]): Promise<ApiBanner[]> =>
  (await apiClient.put<{data: {banners: ApiBanner[]}}>("/admin/banners/reorder", {banner_ids: ids})).data.data.banners;
