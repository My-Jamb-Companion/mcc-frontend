import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {getUpcomingSessions, requestReschedule} from "../services/sessions.service";

const QUERY_KEY = ["student-sessions"];

export const useUpcomingSessions = () => {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getUpcomingSessions,
  });

  return {...query, sessions: query.data ?? []};
};

export const useRequestReschedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestReschedule,
    onSuccess: (result) => {
      // Only auto_accommodated changes the session's real time -- an
      // escalated request leaves it as-is until an admin/CRA resolves it,
      // so refetching then would show nothing different yet.
      if (result.status === "auto_accommodated") {
        queryClient.invalidateQueries({queryKey: QUERY_KEY});
      }
    },
    onError: (error) => showError(extractApiError(error, "Couldn't request that reschedule")),
  });
};
