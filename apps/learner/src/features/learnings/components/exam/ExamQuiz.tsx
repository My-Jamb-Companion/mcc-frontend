"use client";
import {useEffect, useMemo, useRef, useState} from "react";
import {AnimatePresence, motion, Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useSubmitExamSession} from "@/src/features/exams/hooks/useExams";
import {ApiExamQuestion, ApiExamSubmissionResult} from "@/src/features/exams/services/exam.service";
import {useAnalysis, useQuestionHelp} from "@/src/features/brainy/hooks/useAiFeedback";
import {useCountdown} from "@/src/features/learnings/hooks/useCountdown";
import {formatCountdown, isCountdownLow} from "@/src/features/learnings/helper/countdown";
import {isChosenCorrect, responsesForChosen} from "@/src/features/learnings/helper/practiceFeedback";
import PointsEarnedCard from "@/src/features/rewards/components/PointsEarnedCard";
import PracticeFeedbackCard from "@/src/features/learnings/components/PracticeFeedbackCard";

interface ExamQuizProps {
  sessionId: string;
  questions: ApiExamQuestion[];
  type: "quiz" | "practice" | "exam";
  label: string;
  /** Minutes allowed; submitted automatically at zero. Omit for untimed. */
  timeLimitMinutes?: number | null;
  /** Percent needed to pass; adds a pass/fail result. */
  passingScore?: number | null;
  onDone: () => void;
}

/**
 * The exam-prep equivalent of ../course/CoursePractice.tsx -- wired to the
 * real exam_questions schema (single-choice, one correct_option) rather
 * than the course module-quiz system's richer question types.
 */
export default function ExamQuiz({
  sessionId,
  questions,
  type,
  label,
  timeLimitMinutes,
  passingScore,
  onDone,
}: ExamQuizProps) {
  const submit = useSubmitExamSession();
  const questionHelp = useQuestionHelp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ApiExamSubmissionResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [aiHelp, setAiHelp] = useState<Record<string, string>>({});
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Practice: question ids the student has checked (their answer is then locked).
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const isPractice = type === "practice";

  // The timer's expiry handler reads the answers as they are at that moment.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const remaining = useCountdown(
    timeLimitMinutes,
    !result && !timedOut && !submit.isPending,
    () => {
      const current = answersRef.current;
      if (Object.keys(current).length > 0) {
        submit.mutate(
          {sessionId, answers: current, type},
          {
            onSuccess: (graded) => setResult(graded),
            onError: () => setSubmitError("Time's up, but we couldn't submit your answers. Please try again."),
          },
        );
      } else {
        setTimedOut(true);
      }
    },
    attempt,
  );

  const resultByQuestionId = useMemo(() => {
    const map = new Map<string, ApiExamSubmissionResult["results"][number]>();
    result?.results.forEach((r) => map.set(r.question_id, r));
    return map;
  }, [result]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.question_id] ?? "";
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const allAnswered = questions.every((q) => !!answers[q.question_id]);

  const isChecked = isPractice && !reviewMode && !!checked[currentQuestion?.question_id];

  const selectOption = (option: string) => {
    if (reviewMode || isChecked) return;
    setAnswers((prev) => ({...prev, [currentQuestion.question_id]: option}));
  };

  const handleNext = () => {
    setShowExplanation(false);

    if (reviewMode) {
      if (isLastQuestion) setReviewMode(false);
      else setCurrentIndex((i) => i + 1);
      return;
    }

    if (isLastQuestion) {
      setSubmitError(null);
      submit.mutate(
        {sessionId, answers, type},
        {
          onSuccess: (graded) => setResult(graded),
          onError: () => setSubmitError("Couldn't submit your answers. Please try again."),
        },
      );
      return;
    }

    setCurrentIndex((i) => i + 1);
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setReviewMode(false);
    setShowExplanation(false);
    setSubmitError(null);
    setAiHelp({});
    setTimedOut(false);
    setChecked({});
    setAttempt((n) => n + 1);
  };

  const askAiToExplain = (questionId: string) => {
    questionHelp.mutate(questionId, {
      onSuccess: (res) => setAiHelp((prev) => ({...prev, [questionId]: res.explanation})),
      onError: (error) => showError(extractApiError(error, "Couldn't get an explanation right now")),
    });
  };

  if (timedOut && !result) {
    return (
      <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-muted/5 p-10 text-center">
        <div className="text-5xl">⏰</div>
        <h2 className="text-2xl font-bold">Time&apos;s up</h2>
        <p className="max-w-md text-sm text-subtle">You hadn&apos;t answered any questions before the time ran out.</p>
        <div className="flex gap-3">
          <button type="button" onClick={retry} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
            Try again
          </button>
          <button type="button" onClick={onDone} className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold">
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
        No questions available for this {label.toLowerCase()} yet.
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/5 rounded-2xl p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-widest text-subtle uppercase">
          {label} — Question {currentIndex + 1} of {questions.length}
        </p>
        {remaining !== null && !result && (
          <span
            role="timer"
            aria-label="Time left"
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
              isCountdownLow(remaining) ? "bg-red-100 text-red-600" : "bg-muted/15 text-foreground"
            }`}
          >
            <Icon icon="ph:timer" size={14} />
            {formatCountdown(remaining)}
          </span>
        )}
      </div>
      <div className="border-t border-muted/20 mb-5" />

      <AnimatePresence mode="wait">
        {result && !reviewMode ? (
          <motion.div key="results" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <ExamQuizResults
              result={result}
              passingScore={passingScore}
              practice={isPractice}
              onRetry={retry}
              onDone={onDone}
              onReview={() => {
                setCurrentIndex(0);
                setReviewMode(true);
              }}
            />
          </motion.div>
        ) : (
          <motion.div key={`${currentQuestion.question_id}-${reviewMode}`} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -20}}>
            <h3 className="text-base font-bold">{currentQuestion.question_text}</h3>

            <div className="mt-6 flex flex-col gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentAnswer === option;
                const graded = resultByQuestionId.get(currentQuestion.question_id);
                const isCorrectOption = graded ? graded.correct_answer === option : false;
                const isWrongSelected = reviewMode && isSelected && !isCorrectOption;
                const checkedCorrect = isChecked && option === currentQuestion.correct_option;
                const checkedWrong = isChecked && isSelected && !checkedCorrect;

                let optionStyle = "border-muted/20 text-foreground";
                if (reviewMode) {
                  if (isCorrectOption) optionStyle = "border-success bg-success/10 text-success";
                  if (isWrongSelected) optionStyle = "border-danger bg-danger/10 text-danger";
                } else if (checkedCorrect) {
                  optionStyle = "border-success bg-success/10 text-success";
                } else if (checkedWrong) {
                  optionStyle = "border-amber-500 bg-amber-50 text-amber-700";
                } else if (isSelected) {
                  optionStyle = "border-primary bg-primary/5 text-primary";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectOption(option)}
                    disabled={reviewMode || isChecked}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${optionStyle}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      reviewMode && isCorrectOption ? "border-success bg-success text-white"
                        : reviewMode && isWrongSelected ? "border-danger bg-danger text-white"
                        : isSelected ? "border-primary bg-primary text-white" : "border-muted/30"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {isChecked && (
              <PracticeFeedbackCard
                correct={isChosenCorrect([currentAnswer], [currentQuestion.correct_option ?? ""])}
                chosen={responsesForChosen(
                  {options: currentQuestion.options, option_feedback: currentQuestion.option_feedback},
                  [currentAnswer],
                  [currentQuestion.correct_option ?? ""],
                )}
                correctAnswers={[currentQuestion.correct_option ?? ""]}
                explanation={currentQuestion.explanation}
              />
            )}

            <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-6">
              {reviewMode && (
                <button type="button" onClick={() => setCurrentIndex((i) => i - 1)} disabled={isFirstQuestion}
                  className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
                  Prev
                </button>
              )}
              {reviewMode && !aiHelp[currentQuestion.question_id] && (
                <button
                  type="button"
                  onClick={() => askAiToExplain(currentQuestion.question_id)}
                  disabled={questionHelp.isPending}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-50"
                >
                  <Icon icon="mingcute:ai-fill" size={14} />
                  {questionHelp.isPending ? "Asking Brainy…" : "Explain this"}
                </button>
              )}
              {!reviewMode && !isPractice && currentQuestion.explanation && (
                <button type="button" onClick={() => setShowExplanation(true)} disabled={showExplanation}
                  className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
                  Explanation
                </button>
              )}
              <button
                type="button"
                onClick={
                  isPractice && !reviewMode && !isChecked
                    ? () => setChecked((prev) => ({...prev, [currentQuestion.question_id]: true}))
                    : handleNext
                }
                disabled={
                  isPractice && !reviewMode && !isChecked
                    ? !currentAnswer
                    : isLastQuestion && !reviewMode
                      ? !allAnswered || submit.isPending
                      : !currentAnswer
                }
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isPractice && !reviewMode && !isChecked ? "Check answer"
                  : reviewMode && isLastQuestion ? "Done reviewing"
                  : isLastQuestion ? (submit.isPending ? "Submitting…" : "Submit")
                  : "Next question"}
              </button>
            </div>

            {submitError && <p className="pt-4 text-sm text-danger">{submitError}</p>}

            {showExplanation && !reviewMode && currentQuestion.explanation && (
              <div className="mt-4 rounded-2xl bg-muted/10 p-5">
                <p className="text-sm font-semibold mb-1">Explanation</p>
                <p className="text-sm text-subtle leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            {reviewMode && aiHelp[currentQuestion.question_id] && (
              <div className="mt-4 rounded-2xl bg-primary/5 p-5">
                <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <Icon icon="mingcute:ai-fill" size={14} />
                  Brainy explains
                </p>
                <p className="text-sm text-subtle leading-relaxed">
                  {aiHelp[currentQuestion.question_id]}
                </p>
              </div>
            )}

            <div className="pt-6 flex items-center justify-center gap-1.5">
              {questions.map((q, i) => {
                const hasAnswer = !!answers[q.question_id];
                const graded = resultByQuestionId.get(q.question_id);
                return (
                  <span
                    key={q.question_id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${
                      currentIndex === i ? "bg-primary scale-125"
                        : graded?.is_correct === true ? "bg-success"
                        : graded?.is_correct === false ? "bg-danger"
                        : hasAnswer ? "bg-primary/50" : "bg-muted/30"
                    }`}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamQuizResults({
  result, practice, passingScore, onRetry, onDone, onReview,
}: {
  result: ApiExamSubmissionResult; practice?: boolean; passingScore?: number | null;
  onRetry: () => void; onDone: () => void; onReview: () => void;
}) {
  const correctCount = result.results.filter((r) => r.is_correct).length;
  const analysis = useAnalysis();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleGetFeedback = () => {
    analysis.mutate(
      {total_questions: result.results.length, correct_answers: correctCount},
      {
        onSuccess: (res) => setFeedback(res.feedback),
        onError: (error) => showError(extractApiError(error, "Couldn't get feedback right now")),
      },
    );
  };

  const {title, message, emoji} = useMemo(() => {
    const p = result.score_percent;
    if (practice) return {emoji: "🌱", title: "Practice complete", message: "Every answer was a chance to learn. Review any you want another look at, or try again."};
    if (p === 100) return {emoji: "🏆", title: "Perfect Score!", message: "Outstanding! You answered every question correctly."};
    if (p >= 80) return {emoji: "🎉", title: "Excellent Work!", message: "Great job! You have a strong understanding of this."};
    if (p >= 60) return {emoji: "👏", title: "Well Done!", message: "Nice work! A little more practice and you'll master it."};
    if (p >= 40) return {emoji: "💪", title: "Keep Going!", message: "You're making progress. Review your mistakes and try again."};
    return {emoji: "📚", title: "Don't Give Up!", message: "Review your answers and give it another shot."};
  }, [result, practice]);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-4 text-6xl">{emoji}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-subtle">{message}</p>
      {result.passed !== null && result.passed !== undefined && (
        <p
          role="status"
          className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold ${
            result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {result.passed ? "Passed" : "Not passed"} · {Math.round(result.score_percent)}% (pass mark{" "}
          {result.passing_score ?? passingScore}%)
        </p>
      )}

      <div className="mt-4 text-5xl font-extrabold tracking-tight">
        {correctCount}
        <span className="text-2xl font-bold text-subtle"> / {result.results.length}</span>
      </div>

      {result.gamification && <PointsEarnedCard gamification={result.gamification} scorePercent={result.score_percent} />}

      <div className="mt-6 flex justify-center gap-2.5">
        {result.results.map((r) => (
          <div
            key={r.question_id}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              r.is_correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            <Icon icon={r.is_correct ? "material-symbols:check-rounded" : "material-symbols:close-rounded"} size={16} />
          </div>
        ))}
      </div>

      {feedback ? (
        <div className="mt-6 w-full max-w-md rounded-2xl bg-primary/5 p-5 text-left">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Icon icon="mingcute:ai-fill" size={14} />
            Brainy&apos;s feedback
          </p>
          <p className="text-sm text-subtle leading-relaxed">{feedback}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGetFeedback}
          disabled={analysis.isPending}
          className="mt-6 flex items-center gap-1.5 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-50"
        >
          <Icon icon="mingcute:ai-fill" size={14} />
          {analysis.isPending ? "Asking Brainy…" : "Get AI feedback"}
        </button>
      )}

      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <button type="button" onClick={onRetry}
          className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
          Try Again
        </button>
        <button type="button" onClick={onReview}
          className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
          Review
        </button>
        <button type="button" onClick={onDone}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Done
        </button>
      </div>
    </div>
  );
}
