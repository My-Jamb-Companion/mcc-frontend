import type {ApiCheckResult, ApiHint, ApiReveal} from "@/src/features/exams/services/exam.service";

/**
 * Where one question stands in the assessment player.
 *   idle      nothing picked, or picked and not yet checked
 *   wrong     checked and wrong: try again, take a hint, or skip
 *   solved    checked and right
 *   revealed  skipped: the answer was shown
 */
export type QuestionStatus = "idle" | "wrong" | "solved" | "revealed";

export interface QuestionState {
  status: QuestionStatus;
  /** The option currently picked. */
  answer: string;
  /** Answers checked so far. */
  attempts: number;
  /** Hint steps shown so far, oldest first. */
  hints: string[];
  /** How many steps there are in all, once a hint has been asked for. */
  hintTotal: number | null;
  /** Set once the question is answered correctly or revealed. */
  correctAnswer: string | null;
  explanation: string | null;
  /** Practice: the author's response to the option last checked. */
  optionFeedback: string | null;
  /** Right first time, with no hint before it. */
  firstTry: boolean;
}

export const newQuestionState = (): QuestionState => ({
  status: "idle", answer: "", attempts: 0, hints: [], hintTotal: null,
  correctAnswer: null, explanation: null, optionFeedback: null, firstTry: false,
});

export const pickOption = (state: QuestionState, option: string): QuestionState =>
  state.status === "solved" || state.status === "revealed" ? state : {...state, answer: option};

/** After checking an answer: wrong leaves the question open, right closes it. */
export const afterCheck = (state: QuestionState, result: ApiCheckResult): QuestionState => ({
  ...state,
  status: result.is_correct ? "solved" : "wrong",
  attempts: result.attempt_no,
  firstTry: result.is_correct && result.first_try,
  correctAnswer: result.correct_answer ?? state.correctAnswer,
  explanation: result.explanation ?? state.explanation,
  optionFeedback: result.option_feedback,
});

export const afterHint = (state: QuestionState, hint: ApiHint): QuestionState => ({
  ...state, hints: hint.steps, hintTotal: hint.total,
});

export const afterReveal = (state: QuestionState, reveal: ApiReveal): QuestionState => ({
  ...state, status: "revealed", correctAnswer: reveal.correct_answer, explanation: reveal.explanation,
});

export const isFinished = (state: QuestionState): boolean => state.status === "solved" || state.status === "revealed";

/** Whether another hint step can be asked for (none left once the last one is shown). */
export const canTakeHint = (state: QuestionState): boolean =>
  !isFinished(state) && (state.hintTotal === null || state.hints.length < state.hintTotal);

/** Check needs an option picked, and one that is new after a miss. */
export const canCheck = (state: QuestionState, lastChecked: string | null): boolean =>
  (state.status === "idle" || state.status === "wrong") && !!state.answer && state.answer !== lastChecked;

/** How many questions are done (right or skipped). */
export const finishedCount = (states: QuestionState[]): number => states.filter(isFinished).length;

/** "Questions right first time" for the live tally. */
export const firstTryCount = (states: QuestionState[]): number => states.filter((s) => s.status === "solved" && s.firstTry).length;

/** The bar's label for the primary action. */
export function primaryLabel(state: QuestionState, isLast: boolean): string {
  if (isFinished(state)) return isLast ? "Show summary" : "Next question";
  return state.status === "wrong" ? "Check again" : "Check";
}

/** The "5–10 minutes" part of an Exercise intro. */
export const minutesLabel = (estimate: {min: number; max: number}): string =>
  estimate.min === estimate.max ? `${estimate.min} minute${estimate.min === 1 ? "" : "s"}` : `${estimate.min} - ${estimate.max} minutes`;

/** Whole and half stars as three buckets for drawing a 5-star row. */
export function starParts(stars: number): {full: number; half: boolean; empty: number} {
  const clamped = Math.max(0, Math.min(5, stars));
  const full = Math.floor(clamped);
  const half = clamped - full >= 0.5;
  return {full, half, empty: 5 - full - (half ? 1 : 0)};
}
