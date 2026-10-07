/** The progress survey as the server defines it (GET /feedback/progress-survey), and the rules the form enforces before sending. */
export interface Option {
  value: string | number;
  label: string;
  emoji?: string;
}

export interface PairItem {
  key: string;
  title: string;
  help?: string;
  style: "emoji" | "number";
  options: Option[];
  low_label?: string;
  high_label?: string;
}

export type Question = {key: string; title: string; help?: string; required: boolean} & (
  | {kind: "results"; min_rows: number; max_rows: number; bands: Option[]; exams: Option[]; subjects: string[]; before_label: string; after_label: string}
  | {kind: "scale" | "single" | "multi"; options: Option[]}
  | {kind: "pairs"; items: PairItem[]}
  | {kind: "rank"; max: number; options: Option[]}
  | {kind: "text"; max_length: number}
);

export interface Step {
  id: string;
  title: string;
  questions: Question[];
}

export interface SurveyDefinition {
  key: string;
  title: string;
  intro: string;
  steps: Step[];
}

export interface ResultRow {
  subject: string;
  exam: string;
  before: string;
  after: string;
}

export type Answers = Record<string, unknown>;

export const blankRow = (): ResultRow => ({subject: "", exam: "", before: "", after: ""});

const rowComplete = (r: ResultRow) => !!r.subject.trim() && !!r.exam && !!r.before && !!r.after;
const rowBlank = (r: ResultRow) => !r.subject.trim() && !r.exam && !r.before && !r.after;

/** The rows the student actually filled in: the empty spare row is not part of the answer. */
const filledRows = (value: unknown): ResultRow[] => ((value as ResultRow[] | undefined) ?? []).filter((r) => !rowBlank(r));

/** Whether a question has an answer good enough to send. */
export function isAnswered(q: Question, value: unknown): boolean {
  switch (q.kind) {
    case "results": {
      const rows = filledRows(value);
      return rows.length >= q.min_rows && rows.every(rowComplete);
    }
    case "scale":
    case "single":
      return value !== undefined && value !== null && value !== "";
    case "multi":
    case "rank":
      return Array.isArray(value) && value.length > 0;
    case "pairs": {
      const pairs = (value as Record<string, {before?: number; after?: number}> | undefined) ?? {};
      return q.items.every((i) => !!pairs[i.key]?.before && !!pairs[i.key]?.after);
    }
    case "text":
      return typeof value === "string" && value.trim().length > 0;
  }
}

/** A row with some but not all of its fields filled in: it must be finished or removed, even if the question is optional. */
const hasHalfRow = (value: unknown): boolean => filledRows(value).some((r) => !rowComplete(r));

/** What stops a step from being finished: a message per question that is required but not answered, or half-filled. */
export function stepProblems(step: Step, answers: Answers): Record<string, string> {
  const problems: Record<string, string> = {};
  for (const q of step.questions) {
    const value = answers[q.key];
    if (q.kind === "results" && hasHalfRow(value)) problems[q.key] = "Finish or remove the subject you started";
    else if (q.required && !isAnswered(q, value)) {
      problems[q.key] = q.kind === "results" ? "Add at least one subject, with its exam and both scores" : "Please answer this question";
    }
  }
  return problems;
}

/** The answers to send: only questions that were actually answered, text trimmed, results as complete rows. */
export function buildPayload(definition: SurveyDefinition, answers: Answers): Answers {
  const out: Answers = {};
  for (const step of definition.steps) {
    for (const q of step.questions) {
      const value = answers[q.key];
      if (!isAnswered(q, value)) continue;
      out[q.key] = q.kind === "text" ? (value as string).trim() : q.kind === "results" ? filledRows(value) : value;
    }
  }
  return out;
}

/** The step a server-reported problem belongs to (to take the student back to it). */
export function stepOfQuestion(definition: SurveyDefinition, key: string): number {
  return Math.max(0, definition.steps.findIndex((s) => s.questions.some((q) => q.key === key)));
}

export const addRank = (list: string[], value: string, max: number): string[] =>
  list.includes(value) || list.length >= max ? list : [...list, value];

export const removeRank = (list: string[], value: string): string[] => list.filter((v) => v !== value);

export function moveRank(list: string[], index: number, direction: -1 | 1): string[] {
  const target = index + direction;
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const toggleMulti = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
