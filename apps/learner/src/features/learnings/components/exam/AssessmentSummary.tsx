"use client";
import {useMemo, useState} from "react";
import {Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useAnalysis, useQuestionHelp} from "@/src/features/brainy/hooks/useAiFeedback";
import PointsEarnedCard from "@/src/features/rewards/components/PointsEarnedCard";
import type {ApiAssessmentQuestion, ApiExamSubmissionResult} from "@/src/features/exams/services/exam.service";
import {leveledUpText} from "@/src/features/learnings/helper/readiness";
import StarRating from "./StarRating";

interface AssessmentSummaryProps {
  result: ApiExamSubmissionResult;
  questions: ApiAssessmentQuestion[];
  mode: "practice" | "exercise";
  /** The Smart Zone's clock ran out and ended it. */
  timedOut?: boolean;
  onRetry: () => void;
  onDone: () => void;
  onOpenLecture: (lectureId: string) => void;
}

/** After the last question: how many were right first time, how each topic did, what to revisit, and a review. */
export default function AssessmentSummary({result, questions, mode, timedOut = false, onRetry, onDone, onOpenLecture}: AssessmentSummaryProps) {
  const total = result.results.length;
  const right = result.results.filter((r) => r.is_correct).length;
  const [reviewing, setReviewing] = useState(false);

  const headline = useMemo(() => {
    const p = result.score_percent;
    if (p === 100) return {emoji: "🏆", title: "Perfect score!", message: "Every question right first time."};
    if (p >= 80) return {emoji: "🎉", title: "Excellent work!", message: "You have a strong grip on this."};
    if (p >= 50) return {emoji: "👏", title: "Well done!", message: "A little more practice and you'll master it."};
    return {emoji: "🌱", title: "Keep on practising!", message: mode === "practice"
      ? "Every miss was a chance to learn. Have another go whenever you like."
      : "Revisit the lessons below, then try again."};
  }, [result.score_percent, mode]);

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-3 text-6xl">{headline.emoji}</div>
      <h2 className="text-2xl font-bold">{headline.title}</h2>
      <p className="mt-2 max-w-md text-sm text-subtle">{headline.message}</p>
      {timedOut && (
        <p role="status" className="mt-3 flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-600">
          <Icon icon="ph:alarm-bold" size={16} /> Time&apos;s up: your answers so far were submitted.
        </p>
      )}

      {result.passed !== null && result.passed !== undefined && (
        <p
          role="status"
          className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold ${
            result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {result.passed ? "Passed" : "Not passed"} · {Math.round(result.score_percent)}% (pass mark {result.passing_score}%)
        </p>
      )}

      <div className="mt-4 text-5xl font-extrabold tracking-tight">
        {right}
        <span className="text-2xl font-bold text-subtle"> / {total}</span>
      </div>
      <p className="text-xs text-subtle">right first time</p>

      {result.readiness && <ReadinessChange readiness={result.readiness} />}

      {result.gamification && <PointsEarnedCard gamification={result.gamification} scorePercent={result.score_percent} />}

      {!!result.topic_breakdown?.length && (
        <section className="mt-6 w-full max-w-md text-left" aria-label="How each topic went">
          <h3 className="mb-2 text-sm font-semibold">How each topic went</h3>
          <ul className="divide-y divide-muted/15 rounded-2xl border border-muted/20">
            {result.topic_breakdown.map((t) => (
              <li key={t.node_id} className="flex items-center justify-between gap-3 px-4 py-3">
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

      {!!result.recommended_lessons?.length && (
        <section className="mt-6 w-full max-w-md text-left" aria-label="Recommended lessons">
          <h3 className="text-sm font-semibold">Recommended lessons</h3>
          <p className="mb-2 text-xs text-subtle">Based on how this went, these are worth another look.</p>
          <ul className="flex flex-col gap-2">
            {result.recommended_lessons.map((l) => (
              <li key={l.lecture_id}>
                <button
                  type="button"
                  onClick={() => onOpenLecture(l.lecture_id)}
                  className="flex w-full items-center gap-2 rounded-xl border border-muted/20 px-4 py-3 text-left text-sm text-primary hover:bg-primary/5"
                >
                  <Icon icon="solar:play-circle-bold" size={18} />
                  <span className="min-w-0 truncate">{l.lecture_title}</span>
                  <span className="ml-auto shrink-0 text-xs text-subtle">{l.module_title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <button type="button" onClick={onRetry} className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
          Try again
        </button>
        <button type="button" onClick={() => setReviewing((v) => !v)} aria-expanded={reviewing}
          className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
          {reviewing ? "Hide review" : "Review answers"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Done
        </button>
      </div>

      {reviewing && <ReviewList result={result} questions={questions} />}
      <FeedbackButton result={result} right={right} />
    </div>
  );
}

/** "Leveled up on 2 topics" and how Exam Readiness moved. */
function ReadinessChange({readiness}: {readiness: NonNullable<ApiExamSubmissionResult["readiness"]>}) {
  const up = leveledUpText(readiness.leveled_up.length);
  const moved = readiness.readiness_percent - readiness.readiness_before;
  return (
    <div className="mt-6 w-full max-w-md rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left" aria-label="Exam readiness">
      {up && (
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Icon icon="solar:cup-star-bold" size={18} />
          {up}
        </p>
      )}
      {up && (
        <ul className="mt-1 ml-7 list-disc text-xs text-subtle">
          {readiness.leveled_up.map((l) => <li key={l.node_id}>{l.title}</li>)}
        </ul>
      )}
      <p className={`text-sm ${up ? "mt-2" : ""}`}>
        Exam readiness <span className="font-bold">{readiness.readiness_percent}%</span>
        {moved > 0 && <span className="text-success"> (up {moved} point{moved === 1 ? "" : "s"})</span>}
      </p>
    </div>
  );
}

function FeedbackButton({result, right}: {result: ApiExamSubmissionResult; right: number}) {
  const analysis = useAnalysis();
  const [feedback, setFeedback] = useState<string | null>(null);
  const ask = () =>
    analysis.mutate(
      {total_questions: result.results.length, correct_answers: right},
      {
        onSuccess: (res) => setFeedback(res.feedback),
        onError: (error) => showError(extractApiError(error, "Couldn't get feedback right now")),
      },
    );

  return feedback ? (
    <div className="mt-6 w-full max-w-md rounded-2xl bg-primary/5 p-5 text-left">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
        <Icon icon="mingcute:ai-fill" size={14} />
        Brainy&apos;s feedback
      </p>
      <p className="text-sm leading-relaxed text-subtle">{feedback}</p>
    </div>
  ) : (
    <button type="button" onClick={ask} disabled={analysis.isPending}
      className="mt-6 flex items-center gap-1.5 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-50">
      <Icon icon="mingcute:ai-fill" size={14} />
      {analysis.isPending ? "Asking Brainy…" : "Get AI feedback"}
    </button>
  );
}

/** Every question with the answer given, the right answer, the explanation and the author's response to each option. */
function ReviewList({result, questions}: {result: ApiExamSubmissionResult; questions: ApiAssessmentQuestion[]}) {
  const byId = useMemo(() => new Map(questions.map((q) => [q.question_id, q])), [questions]);
  const help = useQuestionHelp();
  const [explained, setExplained] = useState<Record<string, string>>({});

  const explain = (questionId: string) =>
    help.mutate(questionId, {
      onSuccess: (res) => setExplained((prev) => ({...prev, [questionId]: res.explanation})),
      onError: (error) => showError(extractApiError(error, "Couldn't get an explanation right now")),
    });

  return (
    <ol className="mt-8 flex w-full max-w-2xl flex-col gap-4 text-left" aria-label="Review">
      {result.results.map((r, i) => {
        const q = byId.get(r.question_id);
        return (
          <li key={r.question_id} className="rounded-2xl border border-muted/20 p-5">
            <p className="flex items-start gap-2 text-sm font-semibold">
              <Icon icon={r.is_correct ? "material-symbols:check-circle-rounded" : "material-symbols:cancel-rounded"} size={18}
                className={r.is_correct ? "text-success" : "text-danger"} />
              <span>{i + 1}. {q?.question_text ?? "Question"}</span>
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {(q?.options ?? []).map((option, index) => {
                const isRight = option === r.correct_answer;
                const isYours = option === r.your_answer;
                const response = r.option_feedback?.[index];
                return (
                  <li key={option} className={`rounded-xl border px-3 py-2 text-sm ${
                    isRight ? "border-success bg-success/10" : isYours ? "border-danger bg-danger/10" : "border-muted/20"
                  }`}>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">{option}</span>
                      {isRight && <span className="text-xs font-semibold text-success">Right answer</span>}
                      {isYours && !isRight && <span className="text-xs font-semibold text-danger">Your answer</span>}
                    </p>
                    {response && <p className="mt-1 text-xs leading-relaxed text-subtle">{response}</p>}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-subtle">
              {r.revealed ? "You skipped this one. " : r.solved_eventually && !r.is_correct ? "Right after a retry or a hint. " : ""}
              {!!r.hints_used && `${r.hints_used} hint${r.hints_used === 1 ? "" : "s"} used.`}
            </p>
            {r.explanation && <p className="mt-2 text-sm leading-relaxed text-subtle">{r.explanation}</p>}
            {explained[r.question_id] ? (
              <p className="mt-3 rounded-xl bg-primary/5 p-3 text-sm leading-relaxed text-subtle">
                <span className="mb-1 flex items-center gap-1.5 font-semibold text-primary"><Icon icon="mingcute:ai-fill" size={14} />Brainy explains</span>
                {explained[r.question_id]}
              </p>
            ) : (
              <button type="button" onClick={() => explain(r.question_id)} disabled={help.isPending}
                className="mt-3 flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-1.5 text-xs font-semibold text-primary disabled:opacity-50">
                <Icon icon="mingcute:ai-fill" size={13} />
                {help.isPending ? "Asking Brainy…" : "Explain this"}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
