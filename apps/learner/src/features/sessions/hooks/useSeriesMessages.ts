import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {getSeriesThread, postSeriesMessage} from "../services/seriesMessages.service";

export const useSeriesThread = (seriesId: string) => {
  const query = useQuery({
    queryKey: ["series-thread", seriesId],
    queryFn: () => getSeriesThread(seriesId),
  });
  return {...query, messages: query.data ?? []};
};

export const usePostSeriesMessage = (seriesId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => postSeriesMessage(seriesId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["series-thread", seriesId]});
    },
    onError: (error) => showError(extractApiError(error, "Couldn't send that message")),
  });
};
