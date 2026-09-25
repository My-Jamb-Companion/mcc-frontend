import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { getSeriesThread, postSeriesMessage } from "./seriesMessages.service";

export const useSeriesThread = (seriesId: string) =>
  useQuery({
    queryKey: ["teacher", "series-thread", seriesId],
    queryFn: () => getSeriesThread(seriesId),
  });

export const usePostSeriesMessage = (seriesId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => postSeriesMessage(seriesId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "series-thread", seriesId] });
    },
    onError: (error) => showError(extractApiError(error, "Couldn't send that message")),
  });
};
