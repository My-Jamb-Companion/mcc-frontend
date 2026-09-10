import { useQuery } from "@tanstack/react-query";
import { getUpcomingSessions } from "./sessions.service";

export const useUpcomingSessions = () =>
  useQuery({ queryKey: ["teacher", "sessions"], queryFn: getUpcomingSessions });
