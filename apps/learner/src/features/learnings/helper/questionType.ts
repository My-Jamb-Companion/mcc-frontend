/**
 * Whether a question has more than one right answer, so the learner may pick several.
 *
 * The admin screens save a multiple-answer question as `multi_choice`, exams and older rows use `multiple_choice`, so
 * both count. Where the right answers are known (a course Practice quiz), more than one of them settles it whatever
 * the type says.
 */
export function isMultipleChoice(questionType?: string | null, correctAnswers?: readonly string[] | null): boolean {
  if (questionType === "multi_choice" || questionType === "multiple_choice") return true;
  return questionType !== "long_short_answer" && (correctAnswers?.length ?? 0) > 1;
}

/** Whether `option` is one of the right answers, given the answer as the server words it ("A, B" for several). */
export function isRightAnswerOption(correctAnswer: string | null | undefined, option: string): boolean {
  if (!correctAnswer) return false;
  return option === correctAnswer || `, ${correctAnswer}, `.includes(`, ${option}, `);
}

/** An answer as it is stored: a plain option, or a JSON list of options for a multiple-answer question. */
export function parseStoredAnswer(answer: string | null | undefined): string[] {
  if (!answer) return [];
  if (answer.startsWith("[")) {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* a plain answer that happens to start with a bracket */
    }
  }
  return [answer];
}
