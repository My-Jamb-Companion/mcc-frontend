import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {getSurveyComments, getSurveyResults} from "./survey.service";

export const useSurveyResults = () => useQuery({queryKey: ["admin-survey", "results"], queryFn: getSurveyResults});

export const useSurveyComments = (page: number) =>
  useQuery({queryKey: ["admin-survey", "comments", page], queryFn: () => getSurveyComments(page), placeholderData: keepPreviousData});
