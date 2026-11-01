import {apiClient} from "@mcc/api";

/** One slide of the Explore slider, as the admin set it up. */
export interface ApiExploreBanner {
  banner_id: string;
  caption: string;
  image_url: string | null;
  bg_color: string;
  text_color: string;
  button_label: string;
  link_url: string;
}

/** Endpoint: GET /banners/explore -- switched-on slides in the admin's order; empty until one is created. */
export const getExploreBanners = async (): Promise<ApiExploreBanner[]> =>
  (await apiClient.get<{data: {banners: ApiExploreBanner[]}}>("/banners/explore")).data.data.banners;
