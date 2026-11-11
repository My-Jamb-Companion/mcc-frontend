"use client";

import {Icon} from "@mcc/ui";
import {percentLabel} from "@/src/features/learnings/helper/quizGrades";

/** The green tick and best score on a Practice quiz, Smart Zone or Test the learner has already taken. */
export default function GradeBadge({grade}: {grade: {best_percent: number} | undefined}) {
  if (!grade) return null;
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1 self-center text-xs font-semibold text-success" title={`Best ${percentLabel(grade.best_percent)}`}>
      {percentLabel(grade.best_percent)}
      <Icon icon="material-symbols:check-circle-rounded" size={16} />
      <span className="sr-only">Completed</span>
    </span>
  );
}
