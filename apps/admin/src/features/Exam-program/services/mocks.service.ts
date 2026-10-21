import {apiClient} from "@mcc/api";
import type {ApiQuestionPayload} from "../helper/content.mapper";
import type {ApiExamQuestion} from "./exam.service";

/** The program's Practice and Exercise questions, the paper's own written or uploaded questions, or both. */
export type PoolSource = "program" | "paper" | "both";

export interface ApiMockBlueprintItem {
  module_id: string;
  count: number;
}

export interface ApiMockPaper {
  paper_id: string;
  program_id: string;
  title: string;
  description: string | null;
  mode: "auto" | "fixed";
  /** Drawn papers: where each attempt's questions come from. */
  pool_source: PoolSource;
  duration_minutes: number;
  passing_score: number | null;
  /** How many questions an attempt has: the blueprint's total, the authored list, or the number asked for. */
  question_count: number | null;
  blueprint: ApiMockBlueprintItem[];
  shuffle_questions: boolean;
  shuffle_options: boolean;
  paid_only: boolean;
  is_published: boolean;
  order_index: number;
  attempts: number;
  /** Auto papers: how many questions the program offers to draw from. */
  available_questions: number | null;
}

export interface ApiMockPaperDetail extends ApiMockPaper {
  /** The paper's own questions: a fixed paper's, or the pool a drawn paper takes from. */
  questions: ApiExamQuestion[];
}

export interface ApiMockPoolModule {
  module_id: string;
  title: string;
  sub_topic_title: string;
  topic_title: string;
  questions: number;
}

export interface ApiMockPool {
  modules: ApiMockPoolModule[];
  total: number;
}

/** The body of create and save. */
export interface ApiMockPaperInput {
  title: string;
  description?: string;
  mode: "auto" | "fixed";
  pool_source: PoolSource;
  duration_minutes: number;
  passing_score?: number | null;
  question_count?: number | null;
  blueprint: ApiMockBlueprintItem[];
  shuffle_questions: boolean;
  shuffle_options: boolean;
  paid_only: boolean;
  is_published: boolean;
  questions: ApiQuestionPayload[];
}

/** Endpoint: GET /admin/exams/programs/<id>/mocks */
export const listMockPapers = async (programId: string): Promise<ApiMockPaper[]> => {
  const res = await apiClient.get<{data: {papers: ApiMockPaper[]}}>(`/admin/exams/programs/${programId}/mocks`);
  return res.data.data.papers;
};

/** Endpoint: GET /admin/exams/programs/<id>/mocks/pool -- the modules an auto paper can draw from. */
export const getMockPool = async (programId: string): Promise<ApiMockPool> => {
  const res = await apiClient.get<{data: ApiMockPool}>(`/admin/exams/programs/${programId}/mocks/pool`);
  return res.data.data;
};

/** Endpoint: GET /admin/exams/mocks/<paper_id> */
export const getMockPaper = async (paperId: string): Promise<ApiMockPaperDetail> => {
  const res = await apiClient.get<{data: ApiMockPaperDetail}>(`/admin/exams/mocks/${paperId}`);
  return res.data.data;
};

/** Endpoint: POST /admin/exams/programs/<id>/mocks */
export const createMockPaper = async (programId: string, input: ApiMockPaperInput): Promise<ApiMockPaperDetail> => {
  const res = await apiClient.post<{data: ApiMockPaperDetail}>(`/admin/exams/programs/${programId}/mocks`, input);
  return res.data.data;
};

/** Endpoint: PUT /admin/exams/mocks/<paper_id> */
export const updateMockPaper = async (paperId: string, input: ApiMockPaperInput): Promise<ApiMockPaperDetail> => {
  const res = await apiClient.put<{data: ApiMockPaperDetail}>(`/admin/exams/mocks/${paperId}`, input);
  return res.data.data;
};

/** Endpoint: DELETE /admin/exams/mocks/<paper_id> */
export const deleteMockPaper = async (paperId: string): Promise<void> => {
  await apiClient.delete(`/admin/exams/mocks/${paperId}`);
};
