import {useQuery} from "@tanstack/react-query";
import {getExploreBanners} from "../services/banners.service";

export const useExploreBanners = () =>
  useQuery({queryKey: ["explore-banners"], queryFn: getExploreBanners, staleTime: 60_000});
