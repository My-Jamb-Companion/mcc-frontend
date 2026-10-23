import type {ApiExamModule, ApiPracticeSet} from "@/src/features/exams/services/exam.service";

/** What a module's Practice rows are: one per set when there are several, else the single row as before. */
export interface PracticeRow {
  /** The row's label ("Practice", or the set's name). */
  label: string;
  count: number;
  /** The set to play. Absent for the module's whole Practice. */
  setName?: string;
}

export function practiceRows(mod: Pick<ApiExamModule, "practice_count" | "practice_sets">): PracticeRow[] {
  if (mod.practice_count <= 0) return [];
  const sets: ApiPracticeSet[] = (mod.practice_sets ?? []).filter((s) => s.count > 0);
  if (sets.length <= 1) {
    // One set, or an older server that does not list sets: a single row, played as a whole. A single named set keeps its name.
    const only = sets[0];
    return [{label: only && only.name.trim().toLowerCase() !== "practice" ? only.name : "Practice", count: mod.practice_count}];
  }
  return sets.map((s) => ({label: s.name, count: s.count, setName: s.name}));
}
