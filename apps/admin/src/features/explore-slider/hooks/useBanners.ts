import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createBanner,
  deleteBanner,
  listBanners,
  reorderBanners,
  updateBanner,
  type BannerPayload,
} from "../services/banner.service";

const KEY = ["admin-banners"];

export const useBanners = () => {
  const query = useQuery({queryKey: KEY, queryFn: listBanners});
  return {...query, banners: query.data ?? []};
};

function useRefreshing<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({queryKey: KEY})});
}

export const useCreateBanner = () => useRefreshing((payload: BannerPayload) => createBanner(payload));
export const useUpdateBanner = () =>
  useRefreshing(({id, payload}: {id: string; payload: Partial<BannerPayload>}) => updateBanner(id, payload));
export const useDeleteBanner = () => useRefreshing((id: string) => deleteBanner(id));
export const useReorderBanners = () => useRefreshing((ids: string[]) => reorderBanners(ids));
