import {useQuery} from "@tanstack/react-query";
import {getTopics} from "../services/topics.service";

export const useTopics = () => useQuery({queryKey: ["course-topics"], queryFn: getTopics, staleTime: 5 * 60_000});
