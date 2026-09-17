import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getCityOptions, getMyCity, requestCityChange, setMyCity} from "../services/pricingCity.service";

const MY_CITY = ["pricing", "my-city"];

export const useCityOptions = () =>
  useQuery({
    queryKey: ["pricing", "city-options"],
    queryFn: getCityOptions,
    // The list changes rarely; no need to refetch it on every focus.
    staleTime: 60 * 60 * 1000,
  });

export const useMyCity = () => useQuery({queryKey: MY_CITY, queryFn: getMyCity});

export const useSetMyCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cityId: string) => setMyCity(cityId),
    onSuccess: (data) => {
      queryClient.setQueryData(MY_CITY, data);
      // Choosing a city also updates the profile's displayed city and state,
      // and the catalogue prices, which follow the city's tier.
      queryClient.invalidateQueries({queryKey: ["profile"]});
      queryClient.invalidateQueries({queryKey: ["courses"]});
      queryClient.invalidateQueries({queryKey: ["exam-programs"]});
    },
  });
};

export const useRequestCityChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({cityId, reason}: {cityId: string; reason: string}) => requestCityChange(cityId, reason),
    onSuccess: (data) => queryClient.setQueryData(MY_CITY, data),
  });
};
