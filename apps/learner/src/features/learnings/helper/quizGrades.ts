/** The shape both a course grade and an exam grade share, which is all the grades card and the tick need. */
export interface GradeSummary {
  attempts: number;
  best_percent: number;
  last_percent: number;
  last_at: string;
  passing_score: number | null;
  passed: boolean | null;
  history: {score_percent: number; taken_at: string; correct?: number; total?: number; passed?: boolean | null}[];
}

/** One entry in a content list: where it hangs, what kind of thing it is, and its set's name. */
export const gradeKey = (parentId: string, kind: string, setName?: string | null): string =>
  `${parentId}|${kind}|${setName ?? ""}`;

/** Grades by `gradeKey`, for a row to look its own up. */
export function indexGrades<T>(items: T[], keyOf: (item: T) => string): Map<string, T> {
  return new Map(items.map((item) => [keyOf(item), item]));
}

/** "80%" -- whole numbers, as a score reads on a badge. */
export const percentLabel = (percent: number): string => `${Math.round(percent)}%`;

/** The verdict line on a grade: pass/fail against a pass mark, or how the best score reads without one. */
export function verdictLabel(grade: Pick<GradeSummary, "passed" | "passing_score" | "best_percent">): string {
  if (grade.passed === true) return "Passed";
  if (grade.passed === false) return `Not passed yet · pass mark ${grade.passing_score ?? 0}%`;
  return grade.best_percent >= 50 ? "Well done" : "Keep practising";
}
