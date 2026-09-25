"use client";
import {useMemo, useState} from "react";
import {AnimatePresence, motion, Icon} from "@mcc/ui";
import {useSubmitExamSession} from "@/src/features/exams/hooks/useExams";
import {ApiExamQuestion, ApiExamSubmissionResult} from "@/src/features/exams/services/exam.service";

interface ExamQuizProps {
  sessionId: string;
  questions: ApiExamQuestion[];
  type: "quiz" | "practice" | "exam";
  label: string;
  onDone: () => void;
}

/**
 * The exam-prep equivalent of ../course/CoursePractice.tsx -- wired to the
 * real exam_questions schema (single-choice, one correct_option) rather
 * than the course module-quiz system's richer question types.
 */
export default function ExamQuiz({sessionId, questions, type, label, onDone}: ExamQuizProps) {
  const submit = useSubmitExamSession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ApiExamSubmissionResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const selectOption = (option: string) => {
    if (reviewMode) return;
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
  };

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
        No questions available for this {label.toLowerCase()} yet.
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/5 rounded-2xl p-6">
      <p className="text-[11px] font-semibold tracking-widest text-subtle uppercase mb-4">
        {label} — Question {currentIndex + 1} of {questions.length}
      </p>
      <div className="border-t border-muted/20 mb-5" />

      <AnimatePresence mode="wait">
        {result && !reviewMode ? (
          <motion.div key="results" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <ExamQuizResults
              result={result}
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

                let optionStyle = "border-muted/20 text-foreground";
                if (reviewMode) {
                  if (isCorrectOption) optionStyle = "border-success bg-success/10 text-success";
                  if (isWrongSelected) optionStyle = "border-danger bg-danger/10 text-danger";
                } else if (isSelected) {
                  optionStyle = "border-primary bg-primary/5 text-primary";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectOption(option)}
                    disabled={reviewMode}
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

            <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-6">
              {reviewMode && (
                <button type="button" onClick={() => setCurrentIndex((i) => i - 1)} disabled={isFirstQuestion}
                  className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
                  Prev
                </button>
              )}
              {!reviewMode && currentQuestion.explanation && (
                <button type="button" onClick={() => setShowExplanation(true)} disabled={showExplanation}
                  className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40">
                  Explanation
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isLastQuestion && !reviewMode ? !allAnswered || submit.isPending : !currentAnswer}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {reviewMode && isLastQuestion ? "Done reviewing"
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
  result, onRetry, onDone, onReview,
}: {
  result: ApiExamSubmissionResult; onRetry: () => void; onDone: () => void; onReview: () => void;
}) {
  const correctCount = result.results.filter((r) => r.is_correct).length;

  const {title, message, emoji} = useMemo(() => {
    const p = result.score_percent;
    if (p === 100) return {emoji: "🏆", title: "Perfect Score!", message: "Outstanding! You answered every question correctly."};
    if (p >= 80) return {emoji: "🎉", title: "Excellent Work!", message: "Great job! You have a strong understanding of this."};
    if (p >= 60) return {emoji: "👏", title: "Well Done!", message: "Nice work! A little more practice and you'll master it."};
    if (p >= 40) return {emoji: "💪", title: "Keep Going!", message: "You're making progress. Review your mistakes and try again."};
    return {emoji: "📚", title: "Don't Give Up!", message: "Review your answers and give it another shot."};
  }, [result]);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-4 text-6xl">{emoji}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-subtle">{message}</p>

      <div className="mt-4 text-5xl font-extrabold tracking-tight">
        {correctCount}
        <span className="text-2xl font-bold text-subtle"> / {result.results.length}</span>
      </div>

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
