import {apiClient} from "@mcc/api";
import {ApiGradedAnswer} from "./exam.service";

export interface ApiExamHistoryItem {
  session_id: string;
  activity_type: string; // 'quiz' | 'practice' | 'exam'
  score: number | null;
  points_earned: number | null;
  timestamp: string;
}

export interface ApiStoredExamResult {
  score: number;
  points_earned: number;
  results: ApiGradedAnswer[];
  timestamp: string;
}

/** Endpoint: GET /exams/history -- every graded practice/exam session for
 * the caller, newest first. */
export const getExamHistory = async (): Promise<ApiExamHistoryItem[]> => {
  const res = await apiClient.get<{data: ApiExamHistoryItem[]}>("/exams/history");
  return res.data.data;
};

/** Endpoint: GET /exams/results/{session_id} -- the stored result for one
 * past session, read back from the progress record. */
export const getExamResult = async (sessionId: string): Promise<ApiStoredExamResult> => {
  const res = await apiClient.get<{data: ApiStoredExamResult}>(
    `/exams/results/${encodeURIComponent(sessionId)}`,
  );
  return res.data.data;
};
