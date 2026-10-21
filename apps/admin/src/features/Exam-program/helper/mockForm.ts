import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";
import {isMultiple} from "@/src/features/question-editor/types";
import type {ApiMockPaperDetail, ApiMockPaperInput, ApiMockPool, PoolSource} from "../services/mocks.service";
import {toApiQuestion} from "./content.mapper";
import {toUiQuestion} from "./detail.mapper";

/** The mock exam form as typed: numbers stay strings until they are sent. */
export interface MockForm {
  title: string;
  description: string;
  mode: "auto" | "fixed";
  /** Drawn papers: the program's questions, the paper's own (written or uploaded), or both. */
  poolSource: PoolSource;
  duration: string;
  passingScore: string;
  questionCount: string;
  /** Auto papers: spread the questions by module instead of one total. */
  useBlueprint: boolean;
  /** module_id -> count typed. */
  blueprint: Record<string, string>;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  paidOnly: boolean;
  published: boolean;
  questions: CreatPracticeQuestionType[];
}

export const emptyMockForm = (): MockForm => ({
  title: "",
  description: "",
  mode: "auto",
  poolSource: "program",
  duration: "60",
  passingScore: "",
  questionCount: "40",
  useBlueprint: false,
  blueprint: {},
  shuffleQuestions: true,
  shuffleOptions: false,
  paidOnly: true,
  published: false,
  questions: [],
});

export function formFromDetail(paper: ApiMockPaperDetail): MockForm {
  const blueprint: Record<string, string> = {};
  for (const item of paper.blueprint ?? []) blueprint[item.module_id] = String(item.count);
  return {
    title: paper.title,
    description: paper.description ?? "",
    mode: paper.mode,
    poolSource: paper.pool_source ?? "program",
    duration: String(paper.duration_minutes),
    passingScore: paper.passing_score === null ? "" : String(paper.passing_score),
    questionCount: paper.mode === "auto" && !paper.blueprint?.length && paper.question_count ? String(paper.question_count) : "",
    useBlueprint: paper.mode === "auto" && !!paper.blueprint?.length,
    blueprint,
    shuffleQuestions: paper.shuffle_questions,
    shuffleOptions: paper.shuffle_options,
    paidOnly: paper.paid_only,
    published: paper.is_published,
    questions: (paper.questions ?? []).map(toUiQuestion),
  };
}

const whole = (raw: string): number | null => {
  const t = raw.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
};

/** The blueprint typed so far, as the API takes it: only modules given a count above zero, in the pool's order. */
export function blueprintItems(form: MockForm, pool: ApiMockPool | undefined) {
  const order = (pool?.modules ?? []).map((m) => m.module_id);
  return Object.entries(form.blueprint)
    .map(([module_id, raw]) => ({module_id, count: whole(raw) ?? 0}))
    .filter((b) => b.count > 0)
    .sort((a, b) => (order.indexOf(a.module_id) + 1 || 1e9) - (order.indexOf(b.module_id) + 1 || 1e9));
}

export const blueprintTotal = (form: MockForm, pool: ApiMockPool | undefined): number =>
  blueprintItems(form, pool).reduce((n, b) => n + b.count, 0);

/** Whether the paper's own questions are in play: a fixed paper's, or a drawn paper whose pool includes them. */
export const usesOwnQuestions = (form: MockForm): boolean => form.mode === "fixed" || form.poolSource !== "program";

/** Questions per module only makes sense when the program's questions are the pool. */
export const canUseBlueprint = (form: MockForm): boolean => form.mode === "auto" && form.poolSource === "program";

/** What a student's attempt will have in it, as far as the form says. */
export function plannedQuestionCount(form: MockForm, pool: ApiMockPool | undefined): number {
  if (form.mode === "fixed") return form.questions.length;
  return form.useBlueprint && canUseBlueprint(form) ? blueprintTotal(form, pool) : whole(form.questionCount) ?? 0;
}

export function mockPayload(form: MockForm, pool: ApiMockPool | undefined): ApiMockPaperInput {
  const auto = form.mode === "auto";
  const blueprint = canUseBlueprint(form) && form.useBlueprint ? blueprintItems(form, pool) : [];
  const pass = whole(form.passingScore);
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    mode: form.mode,
    pool_source: auto ? form.poolSource : "program",
    duration_minutes: whole(form.duration) ?? 0,
    passing_score: pass,
    question_count: auto && !(form.useBlueprint && canUseBlueprint(form)) ? whole(form.questionCount) : null,
    blueprint,
    shuffle_questions: form.shuffleQuestions,
    shuffle_options: form.shuffleOptions,
    paid_only: form.paidOnly,
    is_published: form.published,
    questions: usesOwnQuestions(form) ? form.questions.map((q) => toApiQuestion(q, true)) : [],
  };
}

/** Each of the paper's own questions needs text, two options and a correct one. */
function questionProblems(form: MockForm): string[] {
  const errors: string[] = [];
  form.questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.question.trim()) errors.push(`Question ${n} has no text.`);
    const options = q.options.filter((o) => o.text.trim());
    if (options.length < 2) errors.push(`Question ${n} needs at least two options.`);
    const right = q.options.filter((o) => o.isCorrect && o.text.trim()).length;
    if (right === 0) errors.push(`Question ${n} needs a correct option.`);
    else if (right > 1 && !isMultiple(q.type)) errors.push(`Question ${n} is single choice but has several correct options.`);
  });
  return errors;
}

/** What stops this from being saved (or published), in plain words. Empty when it is fine. */
export function validateMockForm(form: MockForm, pool: ApiMockPool | undefined): string[] {
  const errors: string[] = [];
  if (!form.title.trim()) errors.push("Give the mock exam a title.");

  const duration = whole(form.duration);
  if (duration === null || duration < 1 || duration > 360) errors.push("Time allowed must be between 1 and 360 minutes.");

  if (form.passingScore.trim()) {
    const pass = whole(form.passingScore);
    if (pass === null || pass > 100) errors.push("The pass mark must be a whole number from 0 to 100.");
  }

  if (form.mode === "auto") {
    const blueprint = form.useBlueprint && canUseBlueprint(form);
    if (blueprint) {
      const items = blueprintItems(form, pool);
      if (!items.length) errors.push("Choose how many questions to draw from at least one module.");
      if (form.published) {
        const have = new Map((pool?.modules ?? []).map((m) => [m.module_id, m.questions]));
        const short = items.filter((b) => (have.get(b.module_id) ?? 0) < b.count);
        if (short.length) errors.push("A module has fewer questions than the paper asks for. Lower the count, or add questions to it, before publishing.");
      }
    } else {
      const count = whole(form.questionCount);
      if (!count || count < 1 || count > 300) errors.push("Questions per attempt must be between 1 and 300.");
      else if (form.published) {
        const own = form.poolSource === "program" ? 0 : form.questions.length;
        const programs = form.poolSource === "paper" ? 0 : pool?.total ?? 0;
        const available = own + programs;
        if (count > available) {
          errors.push(
            form.poolSource === "program"
              ? `The program only has ${available} questions to draw from. Lower the count, or add questions, before publishing.`
              : `There are only ${available} questions to draw from. Lower the count, or add more questions to this paper, before publishing.`,
          );
        }
      }
    }
    if (form.poolSource !== "program") errors.push(...questionProblems(form));
  } else {
    if (form.published && form.questions.length === 0) errors.push("Add at least one question before publishing.");
    errors.push(...questionProblems(form));
  }
  return errors;
}
