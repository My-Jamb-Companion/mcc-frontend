"use client";

import {Icon} from "@mcc/ui";
import {GradeSummary, percentLabel, verdictLabel} from "@/src/features/learnings/helper/quizGrades";

interface QuizGradesCardProps {
  /** What was taken: "Practice quiz", "Smart Zone", a Test's name. */
  title: string;
  grade: GradeSummary;
  /** Starts it again. */
  onRetake: () => void;
  /** Opens the full result of one attempt, where one is kept. */
  onOpenAttempt?: (index: number) => void;
}

const when = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, {day: "numeric", month: "short", year: "numeric"});
};

/** A learner's grades on something they have taken: best and latest score, how many times, and each attempt. */
export default function QuizGradesCard({title, grade, onRetake, onOpenAttempt}: QuizGradesCardProps) {
  const good = grade.passed === true || (grade.passed === null && grade.best_percent >= 50);
  return (
    <div className="w-full rounded-2xl border border-muted/20 p-6">
      <div className="flex items-start gap-3">
        <Icon
          icon={good ? "material-symbols:check-circle-rounded" : "material-symbols:pending-outline-rounded"}
          size={28}
          className={good ? "shrink-0 text-success" : "shrink-0 text-amber-500"}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-subtle">Your grades</p>
          <h2 className="truncate text-lg font-bold">{title}</h2>
          <p className="text-sm text-subtle">{verdictLabel(grade)}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-muted/10 p-3">
          <dt className="text-xs text-subtle">Best</dt>
          <dd className="text-xl font-bold tabular-nums">{percentLabel(grade.best_percent)}</dd>
        </div>
        <div className="rounded-xl bg-muted/10 p-3">
          <dt className="text-xs text-subtle">Latest</dt>
          <dd className="text-xl font-bold tabular-nums">{percentLabel(grade.last_percent)}</dd>
        </div>
        <div className="rounded-xl bg-muted/10 p-3">
          <dt className="text-xs text-subtle">Attempts</dt>
          <dd className="text-xl font-bold tabular-nums">{grade.attempts}</dd>
        </div>
      </dl>

      {grade.history.length > 0 && (
        <ul className="mt-5 divide-y divide-muted/10 text-sm" aria-label="Attempts">
          {grade.history.map((attempt, i) => (
            <li key={`${attempt.taken_at}-${i}`} className="flex items-center justify-between gap-3 py-2">
              <span className="text-subtle">{when(attempt.taken_at)}</span>
              <span className="flex items-center gap-3">
                {attempt.total ? <span className="text-xs text-subtle">{attempt.correct ?? 0} of {attempt.total}</span> : null}
                <span className="font-semibold tabular-nums">{percentLabel(attempt.score_percent)}</span>
                {onOpenAttempt && (
                  <button type="button" onClick={() => onOpenAttempt(i)} className="text-xs font-semibold text-primary hover:underline">
                    Review
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onRetake}
        className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Take it again
      </button>
    </div>
  );
}
