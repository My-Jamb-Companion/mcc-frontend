/**
 * Practice is for learning, not scoring: after a student checks an answer they
 * read the response the teacher wrote for the option(s) they chose, right or
 * wrong. These helpers are pure so the same rules serve the course and exam
 * practice screens.
 */
export interface PracticeQuestionLike {
  /** The options in their authored order (the screen may show them shuffled). */
  options: string[];
  /** One response per option, aligned to `options`; null/absent where none was written. */
  option_feedback?: (string | null)[] | null;
}

const norm = (s: string) => s.trim().toLowerCase();

/** True when the chosen options are exactly the correct ones (order and case ignored). */
export function isChosenCorrect(chosen: string[], correct: string[]): boolean {
  const a = new Set(chosen.filter((c) => c.trim()).map(norm));
  const b = new Set(correct.filter((c) => c.trim()).map(norm));
  return a.size === b.size && [...a].every((x) => b.has(x));
}

export interface ChosenResponse {
  option: string;
  /** What the teacher wrote for this option; null when nothing was written. */
  response: string | null;
  correct: boolean;
}

/** The response for each option the student chose, in the order they were chosen. */
export function responsesForChosen(
  question: PracticeQuestionLike,
  chosen: string[],
  correct: string[],
): ChosenResponse[] {
  const correctSet = new Set(correct.map(norm));
  return chosen
    .filter((c) => c.trim())
    .map((option) => {
      const index = question.options.findIndex((o) => norm(o) === norm(option));
      const response = index >= 0 ? (question.option_feedback?.[index]?.trim() || null) : null;
      return {option, response, correct: correctSet.has(norm(option))};
    });
}

/** Whether any option of the question has a response written. */
export const hasAnyResponse = (question: PracticeQuestionLike): boolean =>
  !!question.option_feedback?.some((f) => !!f?.trim());
