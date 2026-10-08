import type {ApiGamificationUpdate} from "@/src/features/rewards/services/rewards.service";
import {apiClient} from "@mcc/api";
import type {ApiJobCharge} from "./brainy.service";

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardGenerateResult {
  flashcards: Flashcard[];
  generated: boolean;
  charge?: ApiJobCharge | null;
}

export type FlashcardDifficulty = "easy" | "medium" | "hard";

export interface FlashcardOptions {
  /** 3-20. Omitted: the model picks 5-10. */
  count?: number;
  /** Omitted: a balanced mix. */
  difficulty?: FlashcardDifficulty;
}

export interface StudyMaterialResult {
  filename: string;
  text: string;
  /** True when the material was longer than 60,000 characters and was cut. */
  truncated: boolean;
  /** "image" means a photo read by the vision model (uses Brainy allowance). */
  kind: "document" | "image";
  charge?: ApiJobCharge | null;
}

/**
 * Endpoint: POST /brainy/study-material (multipart) -- turns a PDF, Word,
 * PowerPoint, text file or photo into text for the generator. Photos are read
 * by a vision model, which takes a while, hence the long timeout.
 */
export const uploadStudyMaterial = async (file: File): Promise<StudyMaterialResult> => {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient.post<{data: StudyMaterialResult}>("/brainy/study-material", form, {
    headers: {"Content-Type": "multipart/form-data"},
    timeout: 90000,
  });
  return res.data.data;
};

/**
 * Endpoint: POST /brainy/flashcards. `content` is at most 8000 characters per
 * call (split longer material first -- see splitIntoParts). `generated:
 * false` means the AI provider was unconfigured, the call failed, or the
 * response couldn't be parsed as flashcards; `flashcards` is then empty, not
 * a fallback string like every other Brainy endpoint.
 */
export const generateFlashcards = async (
  content: string,
  options: FlashcardOptions = {},
): Promise<FlashcardGenerateResult> => {
  const res = await apiClient.post<{data: FlashcardGenerateResult}>(
    "/brainy/flashcards",
    {content, ...options},
    // apiClient's default 10s timeout is sized for ordinary CRUD calls, not
    // a real LLM completion -- gpt-5.6-luna alone can take ~9s, before any
    // retry. 30s gives real headroom without hanging a failed request forever.
    {timeout: 30000},
  );
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

export interface StudySetSummary {
  set_id: string;
  title: string;
  subject: string;
  description: string | null;
  created_at: string;
  updated_at?: string | null;
  last_studied_at?: string | null;
  card_count: number;
  mastered_count: number;
  /** Reviews that are due plus cards never studied -- what is worth studying now. */
  due_count: number;
}

/** A saved card: it carries the id progress is tracked against. */
export interface StudyCard extends Flashcard {
  id: string;
}

export interface CardProgress {
  card_id: string;
  /** Leitner box 1 (new / missed) to 5 (mastered). */
  box: number;
  due_at: string;
  times_seen: number;
  times_correct: number;
  last_reviewed_at: string | null;
}

export interface ProgressCounts {
  total: number;
  new: number;
  learning: number;
  mastered: number;
  due: number;
}

export interface StudySetDetail
  extends Omit<StudySetSummary, "card_count" | "mastered_count" | "due_count"> {
  content: StudyCard[];
  /** Only cards studied at least once appear here. */
  progress: CardProgress[];
  summary: ProgressCounts;
}

/** Endpoint: GET /exams/study-sets -- the caller's saved sets, newest first. */
export const listStudySets = async (): Promise<StudySetSummary[]> => {
  const res = await apiClient.get<{data: StudySetSummary[]}>("/exams/study-sets");
  return res.data.data;
};

/** Endpoint: GET /exams/study-sets/{set_id} */
export const getStudySet = async (setId: string): Promise<StudySetDetail> => {
  const res = await apiClient.get<{data: StudySetDetail}>(
    `/exams/study-sets/${encodeURIComponent(setId)}`,
  );
  return res.data.data;
};

/**
 * Endpoint: PATCH /exams/study-sets/{set_id} -- only the fields sent change;
 * `description: ""` clears it. Send each card's `id` back unchanged so its
 * progress is kept; a set can't be emptied (422).
 */
export const updateStudySet = async (
  setId: string,
  input: Partial<{title: string; description: string; content: Array<Flashcard & {id?: string}>}>,
): Promise<void> => {
  await apiClient.patch(`/exams/study-sets/${encodeURIComponent(setId)}`, input);
};

export interface ReviewOutcome {
  reviewed: number;
  summary: ProgressCounts;
  /** Study-day points this review paid (once a day, after enough different cards). */
  points_earned?: number;
  gamification?: ApiGamificationUpdate | null;
}

export interface ReviewResult {
  card_id: string;
  correct: boolean;
}

/**
 * Endpoint: POST /exams/study-sets/{set_id}/review -- records a whole study or
 * quiz session on the Leitner schedule (correct = up a box, miss = back to box
 * 1). Answers are applied in order; unknown card ids are ignored.
 */
export const reviewStudySet = async (
  setId: string,
  results: ReviewResult[],
): Promise<ReviewOutcome> => {
  const res = await apiClient.post<{data: ReviewOutcome}>(
    `/exams/study-sets/${encodeURIComponent(setId)}/review`,
    {results},
  );
  return res.data.data;
};

/** Endpoint: DELETE /exams/study-sets/{set_id} */
export const deleteStudySet = async (setId: string): Promise<void> => {
  await apiClient.delete(`/exams/study-sets/${encodeURIComponent(setId)}`);
};
