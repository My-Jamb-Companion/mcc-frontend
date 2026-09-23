import {useQuery} from "@tanstack/react-query";
import {getUpcomingSessions} from "../services/sessions.service";

export const useUpcomingSessions = () => {
  const query = useQuery({
    queryKey: ["student-sessions"],
    queryFn: getUpcomingSessions,
  });

  return {...query, sessions: query.data ?? []};
};
