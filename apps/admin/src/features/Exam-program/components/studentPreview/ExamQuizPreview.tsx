"use client";

import {useMemo, useState} from "react";
import {AnimatePresence, Icon, motion} from "@mcc/ui";
import type {StudentExamQuestion} from "@/src/features/Exam-program/helper/studentView";

interface Props {
  questions: StudentExamQuestion[];
  label: string;
  onDone: () => void;
}

/**
 * A quiz / practice / test session as a student takes it (a port of the
 * learner app's ExamQuiz): one question at a time, single choice, optional
 * explanation, a results screen and a review pass. Graded here instead of by
 * the server, and the AI buttons are shown but inert.
 */
export default function ExamQuizPreview({questions, label, onDone}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const correctIds = useMemo(
    () => new Set(questions.filter((q) => q.correctAnswers.includes(answers[q.id])).map((q) => q.id)),
    [questions, answers],
  );

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id] ?? "";
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = questions.every((q) => !!answers[q.id]);

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center rounded-2xl bg-muted/10 px-8 text-center text-sm text-muted">
        No questions available for this {label.toLowerCase()} yet.
      </div>
    );
  }

  const handleNext = () => {
    setShowExplanation(false);
    if (reviewMode) {
      if (isLast) setReviewMode(false);
      else setCurrentIndex((i) => i + 1);
      return;
    }
    if (isLast) {
      setSubmitted(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
    setReviewMode(false);
    setShowExplanation(false);
  };

  return (
    <div className="w-full bg-muted/5 rounded-2xl p-6">
      <p className="text-[11px] font-semibold tracking-widest text-subtle uppercase mb-4">
        {label} — Question {currentIndex + 1} of {questions.length}
      </p>
      <div className="border-t border-muted/20 mb-5" />

      <AnimatePresence mode="wait">
        {submitted && !reviewMode ? (
          <motion.div key="results" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <Results
              questions={questions}
              correctIds={correctIds}
              onRetry={retry}
              onDone={onDone}
              onReview={() => {
                setCurrentIndex(0);
                setReviewMode(true);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`${currentQuestion.id}-${reviewMode}`}
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: -20}}
          >
            <h3 className="text-base font-bold">{currentQuestion.text}</h3>

            <div className="mt-6 flex flex-col gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentAnswer === option;
                const isCorrectOption = currentQuestion.correctAnswers.includes(option);
                const isWrongSelected = reviewMode && isSelected && !isCorrectOption;

                let style = "border-muted/20 text-foreground";
                if (reviewMode) {
                  if (isCorrectOption) style = "border-success bg-success/10 text-success";
                  if (isWrongSelected) style = "border-danger bg-danger/10 text-danger";
                } else if (isSelected) {
                  style = "border-primary bg-primary/5 text-primary";
                }

                return (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    disabled={reviewMode}
                    onClick={() => setAnswers((prev) => ({...prev, [currentQuestion.id]: option}))}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors ${style}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        reviewMode && isCorrectOption
                          ? "border-success bg-success text-white"
                          : reviewMode && isWrongSelected
                            ? "border-danger bg-danger text-white"
                            : isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted/30"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3 pt-6">
              {reviewMode && (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  disabled={currentIndex === 0}
                  className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  Prev
                </button>
              )}
              {reviewMode && (
                <button
                  type="button"
                  disabled
                  title="Students can ask Brainy to explain"
                  className="flex items-center justify-center gap-1.5 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary opacity-60"
                >
                  <Icon icon="mingcute:ai-fill" size={14} />
                  Explain this
                </button>
              )}
              {!reviewMode && currentQuestion.explanation && (
                <button
                  type="button"
                  onClick={() => setShowExplanation(true)}
                  disabled={showExplanation}
                  className="rounded-full border border-muted/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
                >
                  Explanation
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isLast && !reviewMode ? !allAnswered : !currentAnswer}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {reviewMode && isLast ? "Done reviewing" : isLast ? "Submit" : "Next question"}
              </button>
            </div>

            {showExplanation && !reviewMode && currentQuestion.explanation && (
              <div className="mt-4 rounded-2xl bg-muted/10 p-5">
                <p className="text-sm font-semibold mb-1">Explanation</p>
                <p className="text-sm text-subtle leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="pt-6 flex items-center justify-center gap-1.5">
              {questions.map((q, i) => (
                <span
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${
                    currentIndex === i
                      ? "bg-primary scale-125"
                      : submitted && correctIds.has(q.id)
                        ? "bg-success"
                        : submitted
                          ? "bg-danger"
                          : answers[q.id]
                            ? "bg-primary/50"
                            : "bg-muted/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Results({
  questions,
  correctIds,
  onRetry,
  onDone,
  onReview,
}: {
  questions: StudentExamQuestion[];
  correctIds: Set<string>;
  onRetry: () => void;
  onDone: () => void;
  onReview: () => void;
}) {
  const correct = questions.filter((q) => correctIds.has(q.id)).length;
  const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  const {title, message, emoji} = useMemo(() => {
    if (percent === 100) return {emoji: "🏆", title: "Perfect Score!", message: "Outstanding! You answered every question correctly."};
    if (percent >= 80) return {emoji: "🎉", title: "Excellent Work!", message: "Great job! You have a strong understanding of this."};
    if (percent >= 60) return {emoji: "👏", title: "Well Done!", message: "Nice work! A little more practice and you'll master it."};
    if (percent >= 40) return {emoji: "💪", title: "Keep Going!", message: "You're making progress. Review your mistakes and try again."};
    return {emoji: "📚", title: "Don't Give Up!", message: "Review your answers and give it another shot."};
  }, [percent]);

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-4 text-6xl">{emoji}</div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-subtle">{message}</p>

      <div className="mt-4 text-5xl font-extrabold tracking-tight">
        {correct}
        <span className="text-2xl font-bold text-subtle"> / {questions.length}</span>
      </div>

      <div className="mt-6 flex justify-center gap-2.5">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              correctIds.has(q.id) ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            <Icon
              icon={correctIds.has(q.id) ? "material-symbols:check-rounded" : "material-symbols:close-rounded"}
              size={16}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled
        title="Students can get AI feedback"
        className="mt-6 flex items-center gap-1.5 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary opacity-60"
      >
        <Icon icon="mingcute:ai-fill" size={14} />
        Get AI feedback
      </button>

      <div className="mt-8 flex flex-col md:flex-row gap-3">
        <button type="button" onClick={onRetry} className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
          Try Again
        </button>
        <button type="button" onClick={onReview} className="rounded-full border border-muted/20 px-6 py-2.5 text-sm font-semibold hover:bg-muted/5">
          Review
        </button>
        <button type="button" onClick={onDone} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Done
        </button>
      </div>
    </div>
  );
}
