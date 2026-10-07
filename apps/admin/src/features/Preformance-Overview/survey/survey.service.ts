import {apiClient} from "@mcc/api";
import type {Band} from "./surveyView";

export interface Option {
  value: string | number;
  label: string;
  count: number;
  percent: number;
}

export interface GroupSummary {
  n: number;
  mean_before: number | null;
  mean_after: number | null;
  mean_change_bands: number | null;
  improved_percent: number;
  same_percent: number;
  declined_percent: number;
}

export interface PairItem {
  key: string;
  title: string;
  n: number;
  mean_before: number | null;
  mean_after: number | null;
  mean_change: number | null;
  improved_percent: number;
}

export interface RankOption {
  value: string;
  label: string;
  points: number;
  mentions: number;
  first_choice: number;
}

export type QuestionSummary = {key: string; title: string; help: string | null; answered: number} & (
  | {kind: "results"; data: {bands: Band[]; overall: GroupSummary | null; by_subject: (GroupSummary & {subject: string})[]; by_exam: (GroupSummary & {exam: string; label: string})[]}}
  | {kind: "pairs"; data: {items: PairItem[]}}
  | {kind: "single" | "multi"; data: {options: Option[]}}
  | {kind: "scale"; data: {options: Option[]; mean: number | null}}
  | {kind: "rank"; data: {options: RankOption[]}}
  | {kind: "text"; data: {count: number}}
);

export interface SurveyResults {
  survey_key: string;
  title: string;
  responses: number;
  first_response_at: string | null;
  last_response_at: string | null;
  questions: QuestionSummary[];
}

export interface SurveyComment {
  response_id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  comment: string;
  created_at: string;
}

export interface SurveyCommentPage {
  comments: SurveyComment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** Endpoint: GET /admin/analytics/progress-survey */
export const getSurveyResults = async (): Promise<SurveyResults> => {
  const res = await apiClient.get<{data: SurveyResults}>("/admin/analytics/progress-survey");
  return res.data.data;
};

/** Endpoint: GET /admin/analytics/progress-survey/comments */
export const getSurveyComments = async (page: number): Promise<SurveyCommentPage> => {
  const res = await apiClient.get<{data: SurveyCommentPage}>("/admin/analytics/progress-survey/comments", {params: {page, limit: 10}});
  return res.data.data;
};
