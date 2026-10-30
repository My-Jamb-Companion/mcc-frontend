"use client";
import {useEffect, useRef, useState} from "react";
import {Icon, confettiCelebrate, motion, showError} from "@mcc/ui";
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
import SmartZoneTimer from "@/src/features/smart-zone/components/SmartZoneTimer";
import SoundToggle from "@/src/features/smart-zone/components/SoundToggle";
import StreakBadge from "@/src/features/smart-zone/components/StreakBadge";
import KeyCap from "@/src/features/smart-zone/components/KeyCap";
import ShortcutsHelp, {ShortcutsButton} from "@/src/features/smart-zone/components/ShortcutsHelp";
import {useSmartZoneKeys} from "@/src/features/smart-zone/hooks/useSmartZoneKeys";
import {buzz, playSound, unlockAudio} from "@/src/features/smart-zone/sound/engine";
import {setSoundEnabled, soundEnabledNow} from "@/src/features/smart-zone/sound/prefs";
import {nextStreak, streakPitch, streakSparkles} from "@/src/features/smart-zone/streak";

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
 * Practice and the Smart Zone (an Exercise), one question at a time. The Smart Zone adds a countdown, sounds, a streak
 * and keyboard controls. The server checks every answer, so the questions
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
  // Smart Zone extras: the run of answers right first time, the shortcut guide, and whether the clock ended it.
  const [streak, setStreak] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const zone = isExercise;

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
        if (zone) {
          // The alarm has already sounded if time ran out.
          if (!timedOutRef.current) playSound(graded.score_percent >= 50 ? "complete" : "consolation");
          if (graded.score_percent === 100) confettiCelebrate();
        }
      },
      onError: () => setSubmitError("Couldn't finish this session. Please try again."),
    });
  };
  const finishRef = useRef(finish);
  const timedOutRef = useRef(false);
  useEffect(() => {
    finishRef.current = finish;
  });

  // An Exercise with a time limit is finished for the student when the time is up.
  const remaining = useCountdown(
    session.time_limit_minutes,
    isExercise && phase === "play" && !submit.isPending,
    () => {
      timedOutRef.current = true;
      setTimedOut(true);
      finishRef.current();
    },
  );
  const totalSeconds = (session.time_limit_minutes ?? 0) * 60;

  const doCheck = () => {
    const answer = state.answer;
    const at = index;
    if (zone) playSound("enter");
    check.mutate(
      {sessionId: session.session_id, questionId: question.question_id, answer},
      {
        onSuccess: (res) => {
          setLastChecked((prev) => ({...prev, [question.question_id]: answer}));
          update(at, (s) => afterCheck(s, res));
          if (!zone) return;
          const run = nextStreak(streak, res.is_correct && res.first_try);
          setStreak(run);
          if (res.is_correct) {
            playSound("correct", {pitch: streakPitch(run)});
            if (streakSparkles(run)) playSound("streak");
            buzz(30);
          } else {
            playSound("wrong");
            buzz([60, 40, 60]);
          }
        },
        onError: (error) => showError(extractApiError(error, "Couldn't check that answer. Please try again.")),
      },
    );
  };

  const doHint = () => {
    const at = index;
    if (zone) {
      playSound("select");
      setStreak(0);
    }
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
    if (zone) {
      playSound("next");
      setStreak(0);
    }
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
    if (isLast) {
      if (zone) playSound("enter");
      return finish();
    }
    if (zone) playSound("next");
    setIndex((i) => i + 1);
  };

  const choose = (option: string) => {
    if (zone) playSound("select");
    update(index, (s) => pickOption(s, option));
  };

  const progressLabel = `${index + 1} of ${questions.length}`;

  const inputsLocked = isFinished(state) || busy;
  const checkDisabled = isFinished(state) ? busy : !canCheck(state, lastChecked[question?.question_id] ?? null) || busy;

  useSmartZoneKeys(
    (action) => {
      if (!question) return;
      switch (action.type) {
        case "pick":
          if (!inputsLocked) choose(question.options[action.index]);
          break;
        case "primary":
          if (!checkDisabled) onPrimary();
          break;
        case "next":
          if (isFinished(state) && !busy) onPrimary();
          break;
        case "hint":
          if (!busy && canTakeHint(state)) doHint();
          break;
        case "skip":
          if (!isFinished(state) && !busy) doSkip();
          break;
        case "mute": {
          const next = !soundEnabledNow();
          setSoundEnabled(next);
          if (next) playSound("toggle");
          break;
        }
        case "help":
          setHelpOpen((open) => !open);
          break;
        case "close":
          setHelpOpen(false);
          break;
      }
    },
    {optionCount: question?.options.length ?? 0, helpOpen, enabled: zone && phase === "play"},
  );

  if (phase === "intro") {
    return (
      <AssessmentIntro
        session={session}
        onStart={() => {
          unlockAudio();
          setPhase("play");
        }}
      />
    );
  }

  if (phase === "summary" && result) {
    return (
      <div className="w-full rounded-2xl bg-muted/5 p-6">
        <AssessmentSummary result={result} questions={questions} mode={session.mode} timedOut={timedOut} onRetry={onRestart} onDone={onDone} onOpenLecture={onOpenLecture} />
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

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-muted/20">
      <div className="flex items-center justify-between gap-3 bg-primary-gradient px-6 py-4 text-white">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{isExercise ? "Smart Zone" : session.set_name ? `Practice · ${session.set_name}` : "Practice"}</p>
          <h2 className="truncate text-lg font-bold">{session.title}</h2>
        </div>
        {zone && (
          <div className="flex shrink-0 items-center gap-2">
            <StreakBadge streak={streak} />
            {remaining !== null && <SmartZoneTimer remaining={remaining} totalSeconds={totalSeconds} />}
            <SoundToggle onDark />
            <ShortcutsButton onClick={() => setHelpOpen(true)} onDark />
          </div>
        )}
        {!zone && remaining !== null && (
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

        <motion.div
          key={`answers-${question.question_id}-${state.attempts}`}
          animate={zone && state.status === "wrong" ? {x: [0, -8, 8, -6, 6, 0]} : {x: 0}}
          transition={{duration: 0.4}}
          className="mt-5 flex flex-col gap-3"
          role="group"
          aria-label="Answers"
        >
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
                onClick={() => choose(option)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${style}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  isRight ? "border-success bg-success text-white" : selected && !isMiss ? "border-primary bg-primary text-white" : "border-muted/30"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium">{option}</span>
                {zone && <KeyCap className="ml-auto">{String.fromCharCode(65 + i)}</KeyCap>}
              </button>
            );
          })}
        </motion.div>

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
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-subtle hover:bg-muted/10 disabled:opacity-50" title="Show the answer and move on">
                Skip {zone && <KeyCap>S</KeyCap>}
              </button>
              <button type="button" onClick={doHint} disabled={busy || !canTakeHint(state)}
                className="flex items-center gap-1.5 rounded-full border border-muted/20 px-4 py-2 text-sm font-semibold disabled:opacity-40">
                <Icon icon="ph:lightbulb" size={15} />
                {state.hintTotal ? `Hint ${state.hints.length}/${state.hintTotal}` : "Hint"}
                {zone && <KeyCap>H</KeyCap>}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onPrimary}
            disabled={checkDisabled}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submit.isPending ? "Finishing…" : check.isPending ? "Checking…" : primaryLabel(state, isLast)}
            {zone && <KeyCap className="border-white/60 text-white">Enter</KeyCap>}
          </button>
        </div>
      </div>
      {zone && <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />}
    </div>
  );
}
