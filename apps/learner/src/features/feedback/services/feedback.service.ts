import {apiClient} from "@mcc/api";
import type {SurveyDefinition} from "../helper/survey";

export interface BugReportInput {
  description: string;
  page_url: string;
  urgency: string;
  screenshot?: File | null;
}

/**
 * Endpoint: POST /feedback/bug-reports (multipart). A 422 carries each bad field under
 * error.details; the report is saved even when only the screenshot couldn't be stored.
 */
export const reportBug = async (input: BugReportInput): Promise<{report_id: string; screenshot_saved: boolean}> => {
  const form = new FormData();
  form.append("description", input.description);
  form.append("page_url", input.page_url);
  form.append("urgency", input.urgency);
  if (input.screenshot) form.append("screenshot", input.screenshot);
  const res = await apiClient.post<{data: {report_id: string; screenshot_saved: boolean}}>("/feedback/bug-reports", form, {
    headers: {"Content-Type": "multipart/form-data"},
  });
  return res.data.data;
};

/** Where "Chat with us" goes. Endpoint: GET /feedback/support */
export const getSupportContact = async (): Promise<{whatsapp_number: string | null; whatsapp_url: string | null}> => {
  const res = await apiClient.get<{data: {whatsapp_number: string | null; whatsapp_url: string | null}}>("/feedback/support");
  return res.data.data;
};

/** Endpoint: GET /feedback/progress-survey */
export const getSurvey = async (): Promise<{definition: SurveyDefinition; submitted: boolean; submitted_at: string | null}> => {
  const res = await apiClient.get<{data: {definition: SurveyDefinition; submitted: boolean; submitted_at: string | null}}>("/feedback/progress-survey");
  return res.data.data;
};

/** Endpoint: POST /feedback/progress-survey. 422 returns every problem by question key; 409 if already answered. */
export const submitSurvey = async (answers: Record<string, unknown>): Promise<void> => {
  await apiClient.post("/feedback/progress-survey", {answers});
};
