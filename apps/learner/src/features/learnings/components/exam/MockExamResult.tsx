"use client";
import {useMemo, useState} from "react";
import {Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useQuestionHelp} from "@/src/features/brainy/hooks/useAiFeedback";
import PointsEarnedCard from "@/src/features/rewards/components/PointsEarnedCard";
import type {ApiMockResult} from "@/src/features/exams/services/exam.service";
import {leveledUpText} from "@/src/features/learnings/helper/readiness";
import {filterReview, isRightOption, isYourOption, ReviewFilter, timeUsedLabel} from "@/src/features/learnings/helper/mockExam";
import MarkedText from "./MarkedText";
import StarRating from "./StarRating";

interface MockExamResultProps {
  result: ApiMockResult;
  /** Another attempt at the same paper. Absent when the paper is gone. */
  onAgain?: () => void;
  onDone: () => void;
}

/** After a mock exam: the score against the pass mark, how each topic went, and every question to review. */
export default function MockExamResult({result, onAgain, onDone}: MockExamResultProps) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const rows = useMemo(() => filterReview(result.results, filter), [result.results, filter]);
  const percent = Math.round(result.score_percent);
  const moved = result.readiness ? result.readiness.readiness_percent - result.readiness.readiness_before : 0;
  const up = result.readiness ? leveledUpText(result.readiness.leveled_up.length) : null;

  return (
    <div className="flex flex-col items-center rounded-2xl bg-muted/5 px-4 py-8 text-center sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-subtle">Mock exam result</p>
      <h2 className="mt-1 text-xl font-bold">{result.paper.title}</h2>

      <div className="mt-5 text-6xl font-extrabold tracking-tight">{percent}%</div>
      <p className="mt-1 text-sm text-subtle">
        {result.correct} of {result.total} right · {timeUsedLabel(result.seconds_used)} of {result.paper.duration_minutes} min
      </p>

      {result.passed !== null && (
        <p
          role="status"
          className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold ${
            result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {result.passed ? "Passed" : "Not passed"} · pass mark {result.paper.passing_score}%
        </p>
      )}

      {result.readiness && (
        <div className="mt-6 w-full max-w-md rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left" aria-label="Exam readiness">
          {up && (
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Icon icon="solar:cup-star-bold" size={18} />
              {up}
            </p>
          )}
          <p className={`text-sm ${up ? "mt-2" : ""}`}>
            Exam readiness <span className="font-bold">{result.readiness.readiness_percent}%</span>
            {moved > 0 && <span className="text-success"> (up {moved} point{moved === 1 ? "" : "s"})</span>}
          </p>
          <p className="mt-1 text-xs text-subtle">Mock exams count for more than practice in your predicted score.</p>
        </div>
      )}

      {result.gamification && <PointsEarnedCard gamification={result.gamification} scorePercent={result.score_percent} />}

      {result.topic_breakdown.length > 0 && (
        <section className="mt-6 w-full max-w-md text-left" aria-label="How each topic went">
          <h3 className="mb-1 text-sm font-semibold">How each topic went</h3>
          <p className="mb-2 text-xs text-subtle">Weakest first: that is where to practise next.</p>
          <ul className="divide-y divide-muted/15 rounded-2xl border border-muted/20 bg-background">
            {result.topic_breakdown.map((t) => (
              <li key={`${t.node_type}-${t.node_id}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0 truncate text-sm">{t.title}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-subtle">{t.correct}/{t.total}</span>
                  <StarRating stars={t.stars} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {onAgain && (
          <button type="button" onClick={onAgain} className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
            Take another attempt
          </button>
        )}
        <button type="button" onClick={onDone} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Done
        </button>
      </div>

      <section className="mt-10 w-full max-w-2xl text-left" aria-label="Review">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold">Review your answers</h3>
          <div className="flex gap-1" role="tablist" aria-label="Which questions to show">
            {(["all", "wrong", "flagged"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  filter === f ? "bg-primary text-white" : "border border-muted/20 text-subtle hover:bg-muted/5"
                }`}
              >
                {f === "all" ? "All" : f === "wrong" ? "Missed" : "Flagged"}
              </button>
            ))}
          </div>
        </div>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-muted/20 p-5 text-sm text-subtle">
            {filter === "wrong" ? "You got every question right." : "Nothing here."}
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {rows.map((r, i) => (
              <ReviewItem key={r.question_id} row={r} number={result.results.indexOf(r) + 1} samePassageAsAbove={!!r.passage && rows[i - 1]?.passage === r.passage} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function ReviewItem({row, number, samePassageAsAbove}: {row: ApiMockResult["results"][number]; number: number; samePassageAsAbove: boolean}) {
  const help = useQuestionHelp();
  const [explained, setExplained] = useState<string | null>(null);
  const blank = row.your_answer === null || (Array.isArray(row.your_answer) && row.your_answer.length === 0);

  const explain = () =>
    help.mutate(row.question_id, {
      onSuccess: (res) => setExplained(res.explanation),
      onError: (error) => showError(extractApiError(error, "Couldn't get an explanation right now")),
    });

  return (
    <li className="rounded-2xl border border-muted/20 bg-background p-5">
      {row.instruction?.trim() && (
        <p className="mb-2 text-xs font-medium leading-relaxed text-primary"><MarkedText text={row.instruction} /></p>
      )}
      {row.passage?.trim() &&
        (samePassageAsAbove ? (
          <p className="mb-2 text-xs italic text-subtle">Same passage as the question above.</p>
        ) : (
          <details className="mb-3 rounded-xl border border-muted/20 bg-muted/5">
            <summary className="cursor-pointer px-4 py-2 text-xs font-semibold text-primary">Show the passage</summary>
            <div className="max-h-60 overflow-y-auto px-4 pb-3 text-sm leading-relaxed"><MarkedText text={row.passage} /></div>
          </details>
        ))}
      <p className="flex items-start gap-2 text-sm font-semibold">
        <Icon
          icon={row.is_correct ? "material-symbols:check-circle-rounded" : "material-symbols:cancel-rounded"}
          size={18}
          className={row.is_correct ? "text-success" : "text-danger"}
        />
        <span>{number}. <MarkedText text={row.question_text} /></span>
        {row.flagged && <Icon icon="ph:flag-fill" size={14} className="mt-0.5 shrink-0 text-amber-500" />}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {row.options.map((option, i) => {
          const right = isRightOption(row.correct_answer, option);
          const yours = isYourOption(row.your_answer, option);
          const response = row.option_feedback?.[i];
          return (
            <li key={option} className={`rounded-xl border px-3 py-2 text-sm ${
              right ? "border-success bg-success/10" : yours ? "border-danger bg-danger/10" : "border-muted/20"
            }`}>
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-medium"><MarkedText text={option} /></span>
                {right && <span className="text-xs font-semibold text-success">Right answer</span>}
                {yours && !right && <span className="text-xs font-semibold text-danger">Your answer</span>}
                {yours && right && <span className="text-xs font-semibold text-success">You picked this</span>}
              </p>
              {response && <p className="mt-1 text-xs leading-relaxed text-subtle">{response}</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-subtle">
        {blank ? "You left this one blank. " : ""}
        {row.seconds > 0 ? `${timeUsedLabel(row.seconds)} on this question.` : ""}
      </p>
      {row.explanation && <p className="mt-2 text-sm leading-relaxed text-subtle">{row.explanation}</p>}
      {explained ? (
        <p className="mt-3 rounded-xl bg-primary/5 p-3 text-sm leading-relaxed text-subtle">
          <span className="mb-1 flex items-center gap-1.5 font-semibold text-primary">
            <Icon icon="mingcute:ai-fill" size={14} />
            Brainy explains
          </span>
          {explained}
        </p>
      ) : (
        <button type="button" onClick={explain} disabled={help.isPending}
          className="mt-3 flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-1.5 text-xs font-semibold text-primary disabled:opacity-50">
          <Icon icon="mingcute:ai-fill" size={13} />
          {help.isPending ? "Asking Brainy…" : "Explain this"}
        </button>
      )}
    </li>
  );
}
