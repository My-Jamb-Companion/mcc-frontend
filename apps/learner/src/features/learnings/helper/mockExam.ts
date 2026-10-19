import type {ApiMockQuestion, ApiMockState, ApiMockStateUpdate} from "@/src/features/exams/services/exam.service";

export type PaletteStatus = "current" | "flagged" | "answered" | "unanswered";

/** How a question's button in the palette is drawn: the one on screen, flagged for review, answered, or not yet. */
export function paletteStatus(questionId: string, index: number, current: number, state: ApiMockState): PaletteStatus {
  if (index === current) return "current";
  if (state.flagged.includes(questionId)) return "flagged";
  return isAnswered(state, questionId) ? "answered" : "unanswered";
}

export function isAnswered(state: ApiMockState, questionId: string): boolean {
  const value = state.answers[questionId];
  return Array.isArray(value) ? value.length > 0 : !!value;
}

export interface MockCounts {
  total: number;
  answered: number;
  unanswered: number;
  flagged: number;
}

export function mockCounts(questions: ApiMockQuestion[], state: ApiMockState): MockCounts {
  const answered = questions.filter((q) => isAnswered(state, q.question_id)).length;
  return {
    total: questions.length,
    answered,
    unanswered: questions.length - answered,
    flagged: questions.filter((q) => state.flagged.includes(q.question_id)).length,
  };
}

/** Picks an option for a question; picking the one already chosen clears it. Multiple choice toggles. */
export function pickAnswer(state: ApiMockState, question: ApiMockQuestion, option: string): ApiMockState {
  const current = state.answers[question.question_id];
  let next: string | string[] | undefined;
  if (question.question_type === "multiple_choice") {
    const picked = Array.isArray(current) ? current : current ? [current] : [];
    const list = picked.includes(option) ? picked.filter((o) => o !== option) : [...picked, option];
    next = list.length ? list : undefined;
  } else {
    next = current === option ? undefined : option;
  }
  const answers = {...state.answers};
  if (next === undefined) delete answers[question.question_id];
  else answers[question.question_id] = next;
  return {...state, answers};
}

export function toggleFlag(state: ApiMockState, questionId: string): ApiMockState {
  const flagged = state.flagged.includes(questionId) ? state.flagged.filter((q) => q !== questionId) : [...state.flagged, questionId];
  return {...state, flagged};
}

/** Time on screen is added to the question being left: whole seconds, never negative. */
export function addSpent(state: ApiMockState, questionId: string, seconds: number): ApiMockState {
  const add = Math.max(0, Math.floor(seconds));
  if (!add) return state;
  return {...state, spent: {...state.spent, [questionId]: (state.spent[questionId] ?? 0) + add}};
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** What changed since `saved`, shaped for the autosave endpoint; null when nothing did. A cleared answer is sent as null. */
export function stateDiff(saved: ApiMockState, now: ApiMockState): ApiMockStateUpdate | null {
  const update: ApiMockStateUpdate = {};

  const answers: Record<string, string | string[] | null> = {};
  for (const [id, value] of Object.entries(now.answers)) if (!same(saved.answers[id], value)) answers[id] = value;
  for (const id of Object.keys(saved.answers)) if (!(id in now.answers)) answers[id] = null;
  if (Object.keys(answers).length) update.answers = answers;

  if (!same([...saved.flagged].sort(), [...now.flagged].sort())) update.flagged = now.flagged;

  const spent: Record<string, number> = {};
  for (const [id, seconds] of Object.entries(now.spent)) if (saved.spent[id] !== seconds) spent[id] = seconds;
  if (Object.keys(spent).length) update.spent = spent;

  if (saved.current !== now.current) update.current = now.current;
  return Object.keys(update).length ? update : null;
}

/** The server's answer to the last save is what the next diff is measured against. */
export function applyUpdate(saved: ApiMockState, update: ApiMockStateUpdate): ApiMockState {
  const answers = {...saved.answers};
  for (const [id, value] of Object.entries(update.answers ?? {})) {
    if (value === null) delete answers[id];
    else answers[id] = value;
  }
  return {
    answers,
    flagged: update.flagged ?? saved.flagged,
    spent: {...saved.spent, ...(update.spent ?? {})},
    current: update.current ?? saved.current,
  };
}

/** "45 min", "1 hr 30 min" for the paper list. */
export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

/** "9 min 5 s" -- how long an attempt took. */
export function timeUsedLabel(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h} hr ${m} min`;
  if (m) return `${m} min${s ? ` ${s} s` : ""}`;
  return `${s} s`;
}

/** The submit confirmation: says what is left undone. */
export function submitWarning(counts: MockCounts): string {
  const parts: string[] = [];
  if (counts.unanswered) parts.push(`${counts.unanswered} question${counts.unanswered === 1 ? " is" : "s are"} unanswered and will be marked wrong`);
  if (counts.flagged) parts.push(`${counts.flagged} ${counts.flagged === 1 ? "is" : "are"} flagged for review`);
  return parts.length ? `${parts.join(", and ")}.` : "You have answered every question.";
}

/** Whether an option is (one of) the right answer(s). A multiple-choice answer arrives as "A, B". */
export function isRightOption(correctAnswer: string, option: string): boolean {
  return option === correctAnswer || correctAnswer.split(", ").includes(option);
}

/** Whether the student picked this option. */
export function isYourOption(yourAnswer: string | string[] | null, option: string): boolean {
  if (yourAnswer === null || yourAnswer === undefined) return false;
  return Array.isArray(yourAnswer) ? yourAnswer.includes(option) : yourAnswer === option;
}

export type ReviewFilter = "all" | "wrong" | "flagged";

export function filterReview<T extends {is_correct: boolean; flagged: boolean}>(rows: T[], filter: ReviewFilter): T[] {
  if (filter === "wrong") return rows.filter((r) => !r.is_correct);
  if (filter === "flagged") return rows.filter((r) => r.flagged);
  return rows;
}
