import {useQuery} from "@tanstack/react-query";
import {getCourseRecommendations, getDiscoverContent, getPromptSuggestions} from "../services/brainy.service";

export const useCourseRecommendations = (query: string) =>
  useQuery({
    queryKey: ["brainy-recommendations", query],
    queryFn: () => getCourseRecommendations(query),
    enabled: !!query,
  });

export const useDiscoverContent = () => {
  const query = useQuery({queryKey: ["brainy-discover"], queryFn: getDiscoverContent});
  return {...query, courses: query.data ?? []};
};

export const usePromptSuggestions = () => {
  const query = useQuery({queryKey: ["brainy-prompt-suggestions"], queryFn: getPromptSuggestions});
  return {...query, suggestions: query.data ?? []};
};
