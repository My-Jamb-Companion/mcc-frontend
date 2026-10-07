import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getSupportContact, getSurvey, reportBug, submitSurvey} from "../services/feedback.service";

export const useSupportContact = () =>
  useQuery({queryKey: ["feedback", "support"], queryFn: getSupportContact, staleTime: 10 * 60_000, retry: false});

export const useSurvey = () => useQuery({queryKey: ["feedback", "survey"], queryFn: getSurvey, staleTime: 0, refetchOnWindowFocus: false});

export const useReportBug = () => useMutation({mutationFn: reportBug});

export const useSubmitSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: Record<string, unknown>) => submitSurvey(answers),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["feedback", "survey"]}),
  });
};
