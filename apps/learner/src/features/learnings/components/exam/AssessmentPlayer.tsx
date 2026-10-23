"use client";
import {useEffect, useRef, useState} from "react";
import {Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {
  useAssessmentHint,
  useCheckAnswer,
  useRevealAnswer,
  useSubmitAssessment,
} from "@/src/features/exams/hooks/useExams";
import type {ApiAssessmentSession, ApiExamSubmissionResult} from "@/src/features/exams/services/exam.service";
import {useCountdown} from "@/src/features/learnings/hooks/useCountdown";
import {formatCountdown, isCountdownLow} from "@/src/features/learnings/helper/countdown";
import {
  afterCheck,
  afterHint,
  afterReveal,
  canCheck,
  canTakeHint,
  isFinished,
  newQuestionState,
  pickOption,
  primaryLabel,
  QuestionState,
} from "@/src/features/learnings/helper/assessmentFlow";
import AssessmentIntro from "./AssessmentIntro";
import AssessmentSummary from "./AssessmentSummary";

interface AssessmentPlayerProps {
  session: ApiAssessmentSession;
  /** Leaves the player (Done). */
  onDone: () => void;
  /** Starts a fresh session on the same node (Try again). */
  onRestart: () => void;
  /** Opens a lecture, from a recommended lesson. */
  onOpenLecture: (lectureId: string) => void;
}

/**
 * Practice and Exercise, one question at a time. The server checks every answer, so the questions
 * arrive without their answers: a wrong answer says so and the student tries again, takes a hint
 * (up to the last step, which works the answer through) or skips to see it. A question counts as
 * mastered only when it was right first time with no hint.
 */
export default function AssessmentPlayer({session, onDone, onRestart, onOpenLecture}: AssessmentPlayerProps) {
  const questions = session.questions;
  const isExercise = session.mode === "exercise";

  const [phase, setPhase] = useState<"intro" | "play" | "summary">(isExercise ? "intro" : "play");
  const [index, setIndex] = useState(0);
  const [states, setStates] = useState<QuestionState[]>(() => questions.map(newQuestionState));
  const [lastChecked, setLastChecked] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ApiExamSubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const check = useCheckAnswer();
  const hint = useAssessmentHint();
  const reveal = useRevealAnswer();
  const submit = useSubmitAssessment();

  const question = questions[index];
  const state = states[index] ?? newQuestionState();
  const isLast = index === questions.length - 1;
  const busy = check.isPending || hint.isPending || reveal.isPending || submit.isPending;

  const update = (i: number, change: (s: QuestionState) => QuestionState) =>
    setStates((prev) => prev.map((s, n) => (n === i ? change(s) : s)));

  const finish = () => {
    setSubmitError(null);
    submit.mutate(session.session_id, {
      onSuccess: (graded) => {
        setResult(graded);
        setPhase("summary");
      },
      onError: () => setSubmitError("Couldn't finish this session. Please try again."),
    });
  };
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  // An Exercise with a time limit is finished for the student when the time is up.
  const remaining = useCountdown(
    session.time_limit_minutes,
    isExercise && phase === "play" && !submit.isPending,
    () => finishRef.current(),
  );

  const doCheck = () => {
    const answer = state.answer;
    const at = index;
    check.mutate(
      {sessionId: session.session_id, questionId: question.question_id, answer},
      {
        onSuccess: (res) => {
          setLastChecked((prev) => ({...prev, [question.question_id]: answer}));
          update(at, (s) => afterCheck(s, res));
        },
        onError: (error) => showError(extractApiError(error, "Couldn't check that answer. Please try again.")),
      },
    );
  };

  const doHint = () => {
    const at = index;
    hint.mutate(
      {sessionId: session.session_id, questionId: question.question_id},
      {
        onSuccess: (res) => update(at, (s) => afterHint(s, res)),
        onError: (error) => showError(extractApiError(error, "There's no hint for this question.")),
      },
    );
  };

  const doSkip = () => {
    const at = index;
    reveal.mutate(
      {sessionId: session.session_id, questionId: question.question_id},
      {
        onSuccess: (res) => update(at, (s) => afterReveal(s, res)),
        onError: (error) => showError(extractApiError(error, "Couldn't skip this question. Please try again.")),
      },
    );
  };

  const onPrimary = () => {
    if (!isFinished(state)) return doCheck();
    if (isLast) return finish();
    setIndex((i) => i + 1);
  };

  const progressLabel = `${index + 1} of ${questions.length}`;

  if (phase === "intro") return <AssessmentIntro session={session} onStart={() => setPhase("play")} />;

  if (phase === "summary" && result) {
    return (
      <div className="w-full rounded-2xl bg-muted/5 p-6">
        <AssessmentSummary result={result} questions={questions} mode={session.mode} onRetry={onRestart} onDone={onDone} onOpenLecture={onOpenLecture} />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
        There are no questions here yet.
      </div>
    );
  }

  const inputsLocked = isFinished(state) || busy;
  const checkDisabled = isFinished(state) ? busy : !canCheck(state, lastChecked[question.question_id] ?? null) || busy;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-muted/20">
      <div className="flex items-center justify-between gap-3 bg-primary-gradient px-6 py-4 text-white">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{isExercise ? "Exercise" : session.set_name ? `Practice · ${session.set_name}` : "Practice"}</p>
          <h2 className="truncate text-lg font-bold">{session.title}</h2>
        </div>
        {remaining !== null && (
          <span
            role="timer"
            aria-label="Time left"
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
              isCountdownLow(remaining) ? "bg-red-100 text-red-600" : "bg-white/20 text-white"
            }`}
          >
            <Icon icon="ph:timer" size={14} />
            {formatCountdown(remaining)}
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-base font-bold">{question.question_text}</h3>
        {question.description && <p className="mt-1 text-sm text-subtle">{question.description}</p>}

        <div className="mt-5 flex flex-col gap-3" role="group" aria-label="Answers">
          {question.options.map((option, i) => {
            const selected = state.answer === option;
            const isRight = isFinished(state) && option === state.correctAnswer;
            const isMiss = state.status === "wrong" && selected && lastChecked[question.question_id] === option;
            let style = "border-muted/20 text-foreground hover:bg-muted/5";
            if (isRight) style = "border-success bg-success/10 text-success";
            else if (isMiss) style = "border-amber-500 bg-amber-50 text-amber-700";
            else if (selected) style = "border-primary bg-primary/5 text-primary";
            return (
              <button
                key={option}
                type="button"
                aria-pressed={selected}
                disabled={inputsLocked}
                onClick={() => update(index, (s) => pickOption(s, option))}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${style}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isRight ? "border-success bg-success text-white" : selected && !isMiss ? "border-primary bg-primary text-white" : "border-muted/30"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium">{option}</span>
              </button>
            );
          })}
        </div>

        {state.hints.length > 0 && (
          <ol className="mt-5 flex flex-col gap-2 border-l-2 border-primary/30 pl-4" aria-label="Hints">
            {state.hints.map((text, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-9 shrink-0 font-semibold text-primary">{i + 1} / {state.hintTotal}</span>
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ol>
        )}

        {state.status === "wrong" && (
          <div role="status" className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Icon icon="ph:lightbulb-fill" size={18} />
              Not quite. Give it another try!
            </p>
            {state.optionFeedback && <p className="mt-2 text-sm leading-relaxed">{state.optionFeedback}</p>}
          </div>
        )}

        {state.status === "solved" && (
          <div role="status" className="mt-5 rounded-2xl border border-green-300 bg-green-50 p-4 text-green-900">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Icon icon="ph:check-circle-fill" size={18} />
              {state.firstTry ? "That's right!" : "Good one! Great that you stuck with it."}
            </p>
            {state.optionFeedback && <p className="mt-2 text-sm leading-relaxed">{state.optionFeedback}</p>}
            {state.explanation && <p className="mt-2 text-sm leading-relaxed opacity-90">{state.explanation}</p>}
          </div>
        )}

        {state.status === "revealed" && (
          <div role="status" className="mt-5 rounded-2xl border border-muted/30 bg-muted/10 p-4">
            <p className="text-sm font-bold">The answer is {state.correctAnswer}</p>
            {state.explanation && <p className="mt-2 text-sm leading-relaxed text-subtle">{state.explanation}</p>}
          </div>
        )}

        {submitError && <p className="mt-4 text-sm text-danger">{submitError}</p>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-muted/20 bg-muted/5 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums">{progressLabel}</span>
          <div className="flex items-center gap-1" aria-hidden="true">
            {questions.map((q, i) => (
              <span
                key={q.question_id}
                className={`h-2 w-2 rounded-full transition-colors ${
                  isFinished(states[i]) ? "bg-primary" : i === index ? "bg-primary/40 ring-2 ring-primary/30" : "bg-muted/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isFinished(state) && (
            <>
              <button type="button" onClick={doSkip} disabled={busy}
                className="rounded-full px-4 py-2 text-sm font-semibold text-subtle hover:bg-muted/10 disabled:opacity-50" title="Show the answer and move on">
                Skip
              </button>
              <button type="button" onClick={doHint} disabled={busy || !canTakeHint(state)}
                className="flex items-center gap-1.5 rounded-full border border-muted/20 px-4 py-2 text-sm font-semibold disabled:opacity-40">
                <Icon icon="ph:lightbulb" size={15} />
                {state.hintTotal ? `Hint ${state.hints.length}/${state.hintTotal}` : "Hint"}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onPrimary}
            disabled={checkDisabled}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submit.isPending ? "Finishing…" : check.isPending ? "Checking…" : primaryLabel(state, isLast)}
          </button>
        </div>
      </div>
    </div>
  );
}
