/** How a question is answered. The editor writes "single" / "multiple"; questions
 * loaded from the API carry the API's spelling, so both are accepted. */
export type QuestionKind =
  | "single"
  | "multiple"
  | "single_choice"
  | "multi_choice"
  | "long_short_answer";

export type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
  /** Practice only: what the student reads after choosing this option, whether it is right or wrong. */
  response?: string;
};

export type CreatPracticeQuestionType = {
  id: string;
  type: QuestionKind;
  question: string;
  description?: string;
  options: Option[];
  explanation?: string;
};

export const isMultiple = (type: QuestionKind): boolean => type === "multiple" || type === "multi_choice";

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/** A blank question with two empty options, as "Add question" creates. */
export function blankQuestion(): CreatPracticeQuestionType {
  return {
    id: uid(),
    type: "single",
    question: "",
    options: [
      {id: uid(), text: "", isCorrect: false},
      {id: uid(), text: "", isCorrect: false},
    ],
  };
}

/** The responses of a question's options, in option order (null where none was written). */
export function optionResponses(question: CreatPracticeQuestionType): (string | null)[] {
  return question.options.map((o) => o.response?.trim() || null);
}

/** True when at least one option has a response written. */
export const hasResponses = (question: CreatPracticeQuestionType): boolean =>
  question.options.some((o) => !!o.response?.trim());
