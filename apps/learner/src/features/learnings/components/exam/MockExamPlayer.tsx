"use client";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {ConfirmModal, Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useSubmitMockExam} from "@/src/features/exams/hooks/useExams";
import {
  ApiMockResult,
  ApiMockSession,
  ApiMockState,
  saveMockState,
} from "@/src/features/exams/services/exam.service";
import {formatCountdown, secondsLeft} from "@/src/features/learnings/helper/countdown";
import {
  addSpent,
  applyUpdate,
  mockCounts,
  paletteStatus,
  pickAnswer,
  stateDiff,
  submitWarning,
  toggleFlag,
} from "@/src/features/learnings/helper/mockExam";

const AUTOSAVE_MS = 1200;
const LOW_SECONDS = 5 * 60;

interface MockExamPlayerProps {
  session: ApiMockSession;
  /** The attempt was graded, by the student or because time ran out. */
  onFinished: (result: ApiMockResult) => void;
}

const PALETTE_STYLE = {
  current: "border-primary bg-primary text-white",
  flagged: "border-amber-500 bg-amber-50 text-amber-700",
  answered: "border-primary/40 bg-primary/10 text-primary",
  unanswered: "border-muted/30 text-subtle hover:bg-muted/5",
} as const;

/**
 * A mock exam under exam conditions: one clock (the server's), a palette to move about, answers that are
 * saved as they go and are not marked until the end. Nothing here knows which options are right.
 */
export default function MockExamPlayer({session, onFinished}: MockExamPlayerProps) {
  const {questions} = session;
  const submit = useSubmitMockExam();

  const [state, setState] = useState<ApiMockState>(() => ({
    ...session.state,
    current: Math.min(session.state.current, Math.max(0, questions.length - 1)),
  }));
  const [confirming, setConfirming] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [saveProblem, setSaveProblem] = useState(false);
  const [remaining, setRemaining] = useState(session.remaining_seconds);

  const stateRef = useRef(state);
  const savedRef = useRef<ApiMockState>(session.state);
  const savingRef = useRef(false);
  const finishingRef = useRef(false);
  // When the question on screen came up, so time spent on it can be counted when the student leaves it.
  const enteredAt = useRef(Date.now());
  // The deadline, by the server's clock as of when the page loaded: the device's clock never decides it.
  const deadline = useRef(Date.now() + session.remaining_seconds * 1000);

  const index = state.current;
  const question = questions[index];
  const counts = useMemo(() => mockCounts(questions, state), [questions, state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /** Counts the time on the current question into the state (without changing which question it is). */
  const settleTime = useCallback((s: ApiMockState): ApiMockState => {
    const here = questions[s.current];
    if (!here) return s;
    const seconds = (Date.now() - enteredAt.current) / 1000;
    if (seconds < 1) return s;
    enteredAt.current = Date.now();
    return addSpent(s, here.question_id, seconds);
  }, [questions]);

  const go = (to: number) => {
    if (to < 0 || to >= questions.length || to === index) return;
    setState((s) => ({...settleTime(s), current: to}));
    setPaletteOpen(false);
  };

  // --- Saving as they go ---

  const flush = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) return false;
    const update = stateDiff(savedRef.current, stateRef.current);
    if (!update) {
      setSaveProblem(false);
      return true;
    }
    savingRef.current = true;
    try {
      await saveMockState(session.session_id, update);
      savedRef.current = applyUpdate(savedRef.current, update);
      setSaveProblem(false);
      return true;
    } catch (error) {
      const status = (error as {response?: {status?: number}})?.response?.status;
      if (status === 409) {
        // Time is up (or it is already finished): the server will not take more.
        setSaveProblem(false);
        return true;
      }
      setSaveProblem(true);
      return false;
    } finally {
      savingRef.current = false;
    }
  }, [session.session_id]);

  useEffect(() => {
    const id = setTimeout(() => void flush(), AUTOSAVE_MS);
    return () => clearTimeout(id);
  }, [state, flush]);

  // Not marked until the end, and not lost on a refresh: save when the tab goes away, and warn before leaving.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [flush]);

  // --- Finishing ---

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setConfirming(false);
    const settled = settleTime(stateRef.current);
    const update = stateDiff(savedRef.current, settled) ?? undefined;
    submit.mutate(
      {sessionId: session.session_id, update},
      {
        onSuccess: onFinished,
        onError: (error) => {
          finishingRef.current = false;
          showError(extractApiError(error, "Couldn't submit your exam. Check your connection and try again."));
        },
      },
    );
  }, [onFinished, session.session_id, settleTime, submit]);

  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  useEffect(() => {
    const tick = () => {
      const left = secondsLeft(deadline.current, Date.now());
      setRemaining(left);
      if (left === 0) finishRef.current();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  if (!question) {
    return <p className="rounded-2xl bg-muted/10 p-6 text-sm text-subtle">This mock exam has no questions.</p>;
  }

  const multiple = question.question_type === "multiple_choice";
  const picked = state.answers[question.question_id];
  const isPicked = (option: string) => (Array.isArray(picked) ? picked.includes(option) : picked === option);
  const flagged = state.flagged.includes(question.question_id);
  const low = remaining <= LOW_SECONDS;

  const paletteGrid = (
    <ol className="grid grid-cols-5 gap-2" aria-label="Question palette">
      {questions.map((q, i) => {
        const status = paletteStatus(q.question_id, i, index, state);
        return (
          <li key={q.question_id}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-label={`Question ${i + 1}, ${status === "current" ? "on screen" : status}`}
              aria-current={i === index ? "true" : undefined}
              className={`flex h-9 w-full items-center justify-center rounded-lg border text-xs font-semibold ${PALETTE_STYLE[status]}`}
            >
              {i + 1}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-muted/20">
      <div className="flex items-center justify-between gap-3 bg-primary-gradient px-4 py-4 text-white sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Mock exam</p>
          <h2 className="truncate text-lg font-bold">{session.paper.title}</h2>
        </div>
        <span
          role="timer"
          aria-label="Time left"
          className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums ${
            low ? "bg-red-100 text-red-600" : "bg-white/20 text-white"
          }`}
        >
          <Icon icon="ph:timer" size={16} />
          {formatCountdown(remaining)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold tabular-nums">Question {index + 1} of {questions.length}</span>
            <button
              type="button"
              onClick={() => setPaletteOpen((v) => !v)}
              aria-expanded={paletteOpen}
              className="flex items-center gap-1 rounded-full border border-muted/20 px-3 py-1 text-xs font-semibold lg:hidden"
            >
              <Icon icon="ph:squares-four" size={14} />
              {counts.answered}/{counts.total} answered
            </button>
          </div>

          {paletteOpen && <div className="mb-4 rounded-2xl border border-muted/20 p-3 lg:hidden">{paletteGrid}</div>}

          <h3 className="text-base font-bold">{question.question_text}</h3>
          {question.description && <p className="mt-1 text-sm text-subtle">{question.description}</p>}
          {multiple && <p className="mt-2 text-xs font-semibold text-subtle">Choose all that apply.</p>}

          <div className="mt-5 flex flex-col gap-3" role="group" aria-label="Answers">
            {question.options.map((option, i) => {
              const selected = isPicked(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setState((s) => pickAnswer(s, question, option))}
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                    selected ? "border-primary bg-primary/5 text-primary" : "border-muted/20 text-foreground hover:bg-muted/5"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-semibold ${
                    multiple ? "rounded-md" : "rounded-full"
                  } ${selected ? "border-primary bg-primary text-white" : "border-muted/30"}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm font-medium">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="hidden flex-col gap-4 lg:flex" aria-label="Your progress">
          <div>
            <p className="mb-2 text-sm font-semibold">Questions</p>
            {paletteGrid}
          </div>
          <ul className="flex flex-col gap-1.5 text-xs text-subtle">
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-primary/40 bg-primary/10" />Answered ({counts.answered})</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-muted/30" />Not answered ({counts.unanswered})</li>
            <li className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-amber-500 bg-amber-50" />Flagged ({counts.flagged})</li>
          </ul>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-muted/20 bg-muted/5 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0}
            className="rounded-full border border-muted/20 px-4 py-2 text-sm font-semibold disabled:opacity-40">
            Previous
          </button>
          <button type="button" onClick={() => go(index + 1)} disabled={index === questions.length - 1}
            className="rounded-full border border-muted/20 px-4 py-2 text-sm font-semibold disabled:opacity-40">
            Next
          </button>
          <button
            type="button"
            onClick={() => setState((s) => toggleFlag(s, question.question_id))}
            aria-pressed={flagged}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold ${
              flagged ? "border-amber-500 bg-amber-50 text-amber-700" : "border-muted/20"
            }`}
          >
            <Icon icon={flagged ? "ph:flag-fill" : "ph:flag"} size={15} />
            {flagged ? "Flagged" : "Flag for review"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {saveProblem && (
            <span role="status" className="text-xs font-semibold text-amber-700">
              Couldn&apos;t save just now. Keep going; we&apos;ll retry.
            </span>
          )}
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={submit.isPending}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submit.isPending ? "Submitting…" : "Submit exam"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirming}
        title="Submit your exam?"
        message={
          <div className="flex flex-col gap-2">
            <p>{submitWarning(counts)}</p>
            <p>Once you submit you cannot change your answers. You&apos;ll see your score straight away.</p>
          </div>
        }
        confirmText="Submit"
        cancelText="Keep going"
        onConfirm={finish}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
