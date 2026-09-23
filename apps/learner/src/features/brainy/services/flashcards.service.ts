import {apiClient} from "@mcc/api";

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardGenerateResult {
  flashcards: Flashcard[];
  generated: boolean;
}

/**
 * Endpoint: POST /brainy/flashcards -- paste-only. `generated: false` means
 * the AI provider was unconfigured, the call failed, or the response
 * couldn't be parsed as flashcards; `flashcards` is then empty, not a
 * fallback string like every other Brainy endpoint.
 */
export const generateFlashcards = async (content: string): Promise<FlashcardGenerateResult> => {
  const res = await apiClient.post<{data: FlashcardGenerateResult}>("/brainy/flashcards", {
    content,
  });
  return res.data.data;
};

/**
 * Endpoint: POST /exams/study-sets -- not Brainy-specific (multi-portal
 * plan's existing exam-prep study-set feature), reused here so a generated
 * flashcard set a student likes can be saved without this feature
 * reimplementing storage.
 */
export const saveStudySet = async (
  title: string,
  subject: string,
  content: Flashcard[],
): Promise<{set_id: string}> => {
  const res = await apiClient.post<{data: {set_id: string}}>("/exams/study-sets", {
    title,
    subject,
    content,
  });
  return res.data.data;
};
