import type {CreatPracticeQuestionType} from "@/src/features/question-editor/types";

/**
 * A module's Practice is one or more named sets of questions, as a course's is. Questions with the same name are one set;
 * a set with no name is the default one, which students see as "Practice".
 */
export type PracticeSet = {
  id: string;
  name: string;
  questions: CreatPracticeQuestionType[];
};

export const DEFAULT_PRACTICE_NAME = "Practice";

/** What a set is called on screen (and to students). */
export const displayName = (name: string): string => name.trim() || DEFAULT_PRACTICE_NAME;

/** What is sent to the server: the default set has no name. */
export const apiName = (name: string): string | undefined => {
  const trimmed = name.trim();
  return !trimmed || trimmed.toLowerCase() === DEFAULT_PRACTICE_NAME.toLowerCase() ? undefined : trimmed;
};

type PracticeLeaf = {id: string; questions?: CreatPracticeQuestionType[]; sets?: PracticeSet[]};

/** The leaf's sets. A leaf that has only questions (a new module, or one saved before sets) is one default set. */
export function setsOf(leaf: PracticeLeaf): PracticeSet[] {
  if (leaf.sets) return leaf.sets;
  return [{id: `${leaf.id}-default`, name: "", questions: leaf.questions ?? []}];
}

/** Every practice question of the module, set after set. */
export const flatten = (sets: PracticeSet[]): CreatPracticeQuestionType[] => sets.flatMap((s) => s.questions);

/**
 * The sets as the server returns them: practice questions in order, each with the name of its set (or none). Questions with
 * the same name are one set, in the order the names first appear.
 */
export function groupByName<T extends {set_name?: string | null}>(
  rows: T[],
  toQuestion: (row: T) => CreatPracticeQuestionType,
  newId: () => string,
): PracticeSet[] {
  const sets = new Map<string, PracticeSet>();
  for (const row of rows) {
    const name = (row.set_name ?? "").trim();
    const key = name.toLowerCase() === DEFAULT_PRACTICE_NAME.toLowerCase() ? "" : name.toLowerCase();
    const existing = sets.get(key);
    if (existing) existing.questions.push(toQuestion(row));
    else sets.set(key, {id: newId(), name: key === "" ? "" : name, questions: [toQuestion(row)]});
  }
  return [...sets.values()];
}

/** Whether another set already has this name (the default set counts as "Practice"). */
export function nameTaken(sets: PracticeSet[], id: string, name: string): boolean {
  const wanted = displayName(name).toLowerCase();
  return sets.some((s) => s.id !== id && displayName(s.name).toLowerCase() === wanted);
}

/** A name for a new set that no other set has: Practice 2, Practice 3... */
export function nextName(sets: PracticeSet[]): string {
  for (let n = 2; ; n += 1) {
    const candidate = `${DEFAULT_PRACTICE_NAME} ${n}`;
    if (!nameTaken(sets, "", candidate)) return candidate;
  }
}
