import {CreatPracticeQuestionType, hasResponses, isMultiple, optionResponses, uid} from "./types";

/** A question as the Question Bank API sends and takes it. */
export interface BankQuestionPayload {
  question_text: string;
  description?: string;
  question_type: "single_choice" | "multi_choice";
  options: string[];
  correct_answers: string[];
  explanation?: string;
  option_feedback?: (string | null)[];
}

export interface ApiBankQuestion
  extends Omit<BankQuestionPayload, "description" | "explanation" | "option_feedback"> {
  bank_id: string;
  description?: string | null;
  explanation?: string | null;
  option_feedback?: (string | null)[] | null;
  subject_id: string | null;
  subject_name: string | null;
  topic: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  tags: string[];
  source: "manual" | "upload" | "saved";
  created_at: string | null;
  updated_at: string | null;
}

/** A question read from an uploaded file (POST /admin/question-bank/parse). */
export interface ParsedQuestion extends Omit<BankQuestionPayload, "description" | "explanation" | "option_feedback"> {
  /** The spreadsheet row it came from (the headings are row 1). */
  row: number;
  explanation: string | null;
  option_feedback: (string | null)[] | null;
  subject_id: string | null;
  subject_name: string | null;
  topic: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
}

export interface ParseError {
  row: number;
  message: string;
}

export interface ParseResult {
  filename: string;
  total_rows: number;
  questions: ParsedQuestion[];
  errors: ParseError[];
}

/** What a copy into a set needs from a bank or uploaded question. */
export type CopyableQuestion = Pick<BankQuestionPayload, "question_text" | "question_type" | "options" | "correct_answers"> & {
  description?: string | null;
  explanation?: string | null;
  option_feedback?: (string | null)[] | null;
};

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Why a question can't go to the bank yet (null when it can). The bank only
 * keeps complete single- and multiple-choice questions.
 */
export function questionProblem(q: CreatPracticeQuestionType): string | null {
  if (!q.question.trim()) return "has no question text";
  const options = q.options.map((o) => o.text.trim());
  if (options.length < 2) return "needs at least two options";
  if (options.some((o) => !o)) return "has an empty option";
  if (new Set(options.map(norm)).size !== options.length) return "has two identical options";
  const correct = q.options.filter((o) => o.isCorrect).length;
  if (correct === 0) return "has no correct answer marked";
  if (!isMultiple(q.type) && correct !== 1) return "needs exactly one correct answer";
  return null;
}

/** An editor question as a bank payload. Responses are included whenever any are written. */
export function toBankQuestion(q: CreatPracticeQuestionType): BankQuestionPayload {
  return {
    question_text: q.question.trim(),
    ...(q.description?.trim() ? {description: q.description.trim()} : {}),
    question_type: isMultiple(q.type) ? "multi_choice" : "single_choice",
    options: q.options.map((o) => o.text.trim()),
    correct_answers: q.options.filter((o) => o.isCorrect).map((o) => o.text.trim()),
    ...(q.explanation?.trim() ? {explanation: q.explanation.trim()} : {}),
    ...(hasResponses(q) ? {option_feedback: optionResponses(q)} : {}),
  };
}

/**
 * A bank question as a copy for a set: fresh ids, so editing the copy never
 * touches the bank. Responses only come across into a Practice set.
 */
export function fromBankQuestion(b: CopyableQuestion, withResponses: boolean): CreatPracticeQuestionType {
  const correct = new Set(b.correct_answers.map(norm));
  return {
    id: uid(),
    type: b.question_type === "multi_choice" ? "multiple" : "single",
    question: b.question_text,
    description: b.description ?? undefined,
    options: b.options.map((text, i) => {
      const response = withResponses ? b.option_feedback?.[i]?.trim() : undefined;
      return {id: uid(), text, isCorrect: correct.has(norm(text)), ...(response ? {response} : {})};
    }),
    explanation: b.explanation ?? undefined,
  };
}

/** Same identity the bank uses: text, options (any order) and correct answers, ignoring case and spacing. */
export function questionKey(text: string, options: string[], correct: string[]): string {
  return [norm(text), options.map(norm).sort().join("|"), correct.map(norm).sort().join("|")].join("\n");
}

export const editorQuestionKey = (q: CreatPracticeQuestionType): string =>
  questionKey(
    q.question,
    q.options.map((o) => o.text),
    q.options.filter((o) => o.isCorrect).map((o) => o.text),
  );

export const bankQuestionKey = (b: ApiBankQuestion): string =>
  questionKey(b.question_text, b.options, b.correct_answers);

/** A question the author hasn't started: no text, no option text. */
export const isBlankQuestion = (q: CreatPracticeQuestionType): boolean =>
  !q.question.trim() && q.options.every((o) => !o.text.trim());

/**
 * `picked` added to `current`. Untouched blank questions (the empty one a new
 * set starts with) make way for them.
 */
export function appendQuestions(
  current: CreatPracticeQuestionType[],
  picked: CreatPracticeQuestionType[],
): CreatPracticeQuestionType[] {
  return [...current.filter((q) => !isBlankQuestion(q)), ...picked];
}

export interface BankSaveSummary {
  ready: CreatPracticeQuestionType[];
  problems: {index: number; problem: string}[];
}

/** Which of a set's questions can go to the bank, and why the others can't. */
export function splitForBank(questions: CreatPracticeQuestionType[]): BankSaveSummary {
  const ready: CreatPracticeQuestionType[] = [];
  const problems: BankSaveSummary["problems"] = [];
  questions.forEach((q, index) => {
    if (isBlankQuestion(q)) return;
    const problem = questionProblem(q);
    if (problem) problems.push({index, problem});
    else ready.push(q);
  });
  return {ready, problems};
}

/**
 * An uploaded question as a bank payload, keeping its own subject / topic /
 * difficulty. Responses go to the bank whatever set it was uploaded into: the
 * bank keeps them for whoever later picks the question into a Practice set.
 */
export function parsedToBankPayload(p: ParsedQuestion): BankQuestionPayload & {
  subject_id?: string;
  topic?: string;
  difficulty?: "easy" | "medium" | "hard";
} {
  return {
    question_text: p.question_text,
    question_type: p.question_type,
    options: p.options,
    correct_answers: p.correct_answers,
    ...(p.explanation ? {explanation: p.explanation} : {}),
    ...(p.option_feedback ? {option_feedback: p.option_feedback} : {}),
    ...(p.subject_id ? {subject_id: p.subject_id} : {}),
    ...(p.topic ? {topic: p.topic} : {}),
    ...(p.difficulty ? {difficulty: p.difficulty} : {}),
  };
}

/** How many uploaded questions carry Practice responses (they only come into a Practice set). */
export const countWithResponses = (questions: ParsedQuestion[]): number =>
  questions.filter((q) => q.option_feedback?.some(Boolean)).length;
