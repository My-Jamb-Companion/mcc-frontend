import {apiClient} from "@mcc/api";
import type {ApiBankQuestion, BankQuestionPayload, ParseResult} from "@/src/features/question-editor/bank";

export {getApiErrorMessage} from "@/src/features/categories/services/category.service";

export type Difficulty = "easy" | "medium" | "hard";

export interface BankFilters {
  search?: string;
  subject_id?: string;
  topic?: string;
  difficulty?: Difficulty | "";
  question_type?: "single_choice" | "multi_choice" | "";
  page?: number;
  limit?: number;
}

export interface BankPage {
  questions: ApiBankQuestion[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BankClassification {
  subject_id?: string | null;
  topic?: string | null;
  difficulty?: Difficulty | null;
  tags?: string[];
}

export interface BankSaveResult {
  added_count: number;
  skipped_count: number;
  added: ApiBankQuestion[];
  skipped: ApiBankQuestion[];
}

const clean = (filters: BankFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));

/** Endpoint: GET /admin/question-bank */
export const listBankQuestions = async (filters: BankFilters = {}): Promise<BankPage> => {
  const res = await apiClient.get<{data: BankPage}>("/admin/question-bank", {params: clean(filters)});
  return res.data.data;
};

/** Endpoint: GET /admin/question-bank/topics */
export const listBankTopics = async (): Promise<string[]> => {
  const res = await apiClient.get<{data: {topics: string[]}}>("/admin/question-bank/topics");
  return res.data.data.topics;
};

/** Endpoint: POST /admin/question-bank. 409 when an identical question is already there. */
export const createBankQuestion = async (
  payload: BankQuestionPayload & BankClassification,
): Promise<ApiBankQuestion> => {
  const res = await apiClient.post<{data: ApiBankQuestion}>("/admin/question-bank", payload);
  return res.data.data;
};

/** Endpoint: PATCH /admin/question-bank/<id> */
export const updateBankQuestion = async (
  bankId: string,
  payload: Partial<BankQuestionPayload> & BankClassification,
): Promise<ApiBankQuestion> => {
  const res = await apiClient.patch<{data: ApiBankQuestion}>(`/admin/question-bank/${bankId}`, payload);
  return res.data.data;
};

/** Endpoint: DELETE /admin/question-bank/<id>. Never touches a set a question was copied into. */
export const deleteBankQuestion = async (bankId: string): Promise<void> => {
  await apiClient.delete(`/admin/question-bank/${bankId}`);
};

/**
 * Save a set's questions to the bank; ones already there are skipped, not duplicated.
 * Endpoint: POST /admin/question-bank/from-set
 */
export const saveSetToBank = async (
  questions: (BankQuestionPayload & BankClassification)[],
  classification: BankClassification = {},
  source: "saved" | "upload" = "saved",
): Promise<BankSaveResult> => {
  const res = await apiClient.post<{data: BankSaveResult}>("/admin/question-bank/from-set", {
    questions,
    source,
    ...classification,
  });
  return res.data.data;
};

/**
 * Read a .xlsx / .csv question file. Nothing is saved: the result is reviewed
 * first. Endpoint: POST /admin/question-bank/parse (multipart)
 */
export const parseQuestionFile = async (file: File): Promise<ParseResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{data: ParseResult}>("/admin/question-bank/parse", formData, {
    headers: {"Content-Type": "multipart/form-data"},
  });
  return res.data.data;
};

/** The upload template. Endpoint: GET /admin/question-bank/template?format=xlsx|csv */
export const downloadQuestionTemplate = async (format: "xlsx" | "csv"): Promise<Blob> => {
  const res = await apiClient.get<Blob>("/admin/question-bank/template", {
    params: {format},
    responseType: "blob",
  });
  return res.data;
};
