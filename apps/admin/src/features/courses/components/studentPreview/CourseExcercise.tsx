"use client";

import {useMemo, useState} from "react";
import {AnimatePresence, Icon, motion} from "@mcc/ui";
import {shuffleArray} from "../../helper/helper";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
  hint?: string;
}

export interface SubmittedAnswer {
  id: string;
  question: string;
  answer: string;
  correctAnswer: string;
  tries: number;
}

interface CourseExerciseProps {
  questions?: Question[];
  onComplete?: (answers: SubmittedAnswer[]) => void;
  title?: string;
}

interface QuestionAttemptState {
  tries: number;
  isChecked: boolean;
  isCorrect: boolean;
  locked: boolean;
  hintShown: boolean;
  hintUsed: boolean;
}

const MAX_TRIES = 2;

function createInitialAttemptState(): QuestionAttemptState {
  return {
    tries: 0,
    isChecked: false,
    isCorrect: false,
    locked: false,
    hintShown: false,
    hintUsed: false,
  };
}

export default function CourseExercise({
  questions = [],
  onComplete,
  title,
}: CourseExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);

  const [attemptState, setAttemptState] = useState<QuestionAttemptState>(
    createInitialAttemptState(),
  );

  const [isReviewMode, setIsReviewMode] = useState(false);

  const randomizedQuestions = useMemo(() => {
    return questions.map((question) => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));
  }, [questions]);

  const currentQuestion = randomizedQuestions[currentIndex];

  const currentSubmittedAnswer = answers.find(
    (item) => item.id === currentQuestion?.id,
  );

  const selectedAnswer = currentSubmittedAnswer?.answer;

  const isLastQuestion = currentIndex === questions.length - 1;

  const isFinalTryUsed = attemptState.tries >= MAX_TRIES;
  const showRetryPopover = attemptState.isChecked && !attemptState.isCorrect;

  const handleSelectOption = (answer: string) => {
    if (attemptState.locked) return;
    if (attemptState.isChecked) return;

    setAnswers((prev) => {
      const exists = prev.find((item) => item.id === currentQuestion.id);

      if (exists) {
        return prev.map((item) =>
          item.id === currentQuestion.id
            ? {
                ...item,
                answer,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: currentQuestion.id,
          question: currentQuestion.question,
          answer,
          correctAnswer: currentQuestion.correctAnswer,
          tries: attemptState.tries,
        },
      ];
    });
  };

  const handleCheck = () => {
    if (!selectedAnswer || attemptState.isChecked) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const nextTries = attemptState.tries + 1;

    setAttemptState((prev) => ({
      ...prev,
      tries: nextTries,
      isChecked: true,
      isCorrect,
      locked: isCorrect || nextTries >= MAX_TRIES,
    }));

    setAnswers((prev) =>
      prev.map((item) =>
        item.id === currentQuestion.id ? {...item, tries: nextTries} : item,
      ),
    );
  };

  const handleTryAgain = () => {
    setAnswers((prev) => prev.filter((item) => item.id !== currentQuestion.id));

    setAttemptState((prev) => ({
      ...prev,
      isChecked: false,
      isCorrect: false,
    }));
  };

  const handleHint = () => {
    if (attemptState.hintUsed) return;

    setAttemptState((prev) => ({
      ...prev,
      hintShown: true,
      hintUsed: true,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete?.(answers);
      setIsReviewMode(true);
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setAttemptState(createInitialAttemptState());
  };

  const isFirstQuestion = currentIndex === 0;

  const handleReviewPrev = () => {
    if (!isFirstQuestion) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReviewNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleReviewJump = (index: number) => {
    setCurrentIndex(index);
  };

  if (!currentQuestion) return null;

  const nextButtonState: "check" | "try-again" | "next" =
    !attemptState.isChecked
      ? "check"
      : attemptState.isCorrect || isFinalTryUsed
        ? "next"
        : "try-again";

  const nextButtonDisabled =
    nextButtonState === "check" ? !selectedAnswer : false;

  const handlePrimaryAction = () => {
    if (nextButtonState === "check") {
      handleCheck();
    } else if (nextButtonState === "try-again") {
      handleTryAgain();
    } else {
      handleNext();
    }
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#222225]">
      {/* HEADER */}
      <div className="flex items-start justify-between max-sm:flex-col-reverse max-sm:gap-4 border-b border-gray-100 px-8 py-6 max-sm:px-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Exercise {questions.length}
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h2>
        </div>

        <div className="flex items-center justify-center max-sm:flex-col gap-3 sm:max-w-[60%] max-sm:w-full max-sm:max-w-full ">
          <span className="text-sm font-medium text-gray-500 text-nowrap">
            Complete your {questions.length} Exercises
          </span>

          <div className="flex gap-1 w-full">
            {questions.map((_, i) => {
              const questionId = randomizedQuestions[i]?.id;
              const hasAnswer = answers.some((a) => a.id === questionId);
              const reviewAnswer = answers.find((a) => a.id === questionId);
              const isReviewCorrect =
                isReviewMode &&
                reviewAnswer &&
                reviewAnswer.answer === reviewAnswer.correctAnswer;
              const isReviewWrong =
                isReviewMode &&
                reviewAnswer &&
                reviewAnswer.answer !== reviewAnswer.correctAnswer;

              return (
                <span
                  key={i}
                  onClick={isReviewMode ? () => handleReviewJump(i) : undefined}
                  style={{flex: `1 1 ${100 / questions.length}%`}}
                  className={`h-1.5 min-w-1 rounded-full transition-colors ${
                    isReviewMode ? "cursor-pointer" : ""
                  } ${
                    currentIndex === i
                      ? "bg-primary"
                      : isReviewCorrect
                        ? "bg-success"
                        : isReviewWrong
                          ? "bg-danger"
                          : hasAnswer
                            ? "bg-primary/50"
                            : "bg-gray-200 dark:bg-gray-600"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* BODY */}

      <div className="px-8 py-8 max-sm:px-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {currentQuestion.question}
        </h3>

        <div className="mt-6 flex flex-col gap-3">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrectAnswer = answer === currentQuestion.correctAnswer;
            const isRevealed = isReviewMode || attemptState.locked;
            const isWrongSelected =
              isRevealed && isSelected && !isCorrectAnswer;

            let optionStyle =
              "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200";

            if (isRevealed) {
              if (isCorrectAnswer) {
                optionStyle =
                  "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
              } else if (isWrongSelected) {
                optionStyle =
                  "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
              }
            } else if (isSelected) {
              optionStyle =
                "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
            }

            return (
              <button
                key={answer}
                type="button"
                onClick={() => handleSelectOption(answer)}
                disabled={
                  isReviewMode || attemptState.isChecked || attemptState.locked
                }
                className={`
                  flex w-fit items-center gap-4
                  border-y px-2 py-4
                  text-left transition-colors
                  disabled:cursor-not-allowed
                  ${optionStyle}
                `}
              >
                <span
                  className={`
                    flex h-8 w-8 items-center justify-center
                    rounded-full border text-sm font-semibold

                    ${
                      isRevealed && isCorrectAnswer
                        ? "border-success bg-success text-white"
                        : isRevealed && isWrongSelected
                          ? "border-danger bg-danger text-white"
                          : isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 dark:border-gray-500 dark:text-gray-300"
                    }
                  `}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="text-sm font-semibold">{answer}</span>
              </button>
            );
          })}
        </div>

        {isReviewMode && currentSubmittedAnswer && (
          <p className="mt-4 text-xs font-semibold text-gray-400">
            Tries: {currentSubmittedAnswer.tries}/{MAX_TRIES}
          </p>
        )}
      </div>

      {/* FOOTER */}

      {isReviewMode ? (
        <div className="flex justify-end gap-3 rounded-b-2xl max-sm:rounded-none bg-gray-100 dark:bg-gray-900 px-8 py-5">
          <button
            type="button"
            onClick={handleReviewPrev}
            disabled={isFirstQuestion}
            className={`text-sm font-semibold text-gray-700 disabled:text-gray-300 dark:text-gray-300 dark:disabled:text-gray-600 px-5 py-2.5 cursor-pointer
            ${isFirstQuestion && "cursor-not-allowed"}
            `}
          >
            Prev
          </button>

          <button
            type="button"
            onClick={handleReviewNext}
            disabled={isLastQuestion}
            className={`flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all ${isLastQuestion ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            Next
          </button>
        </div>
      ) : (
        <div className="relative flex justify-end gap-3 rounded-b-2xl bg-gray-100 dark:bg-gray-900 px-8 py-5">
          <AnimatePresence>
            {showRetryPopover && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="absolute top-0 right-5 translate-y-[-140%] flex items-center justify-center gap-2 p-2 rounded-2xl border-2 bg-[#222225]"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">Not quite yet..</p>
                  <p className="text-xs">
                    {isFinalTryUsed
                      ? "Here's the correct answer."
                      : "Give it another try."}
                  </p>
                </div>

                {!isFinalTryUsed && (
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="rounded-full bg-muted/60 p-1"
                  >
                    <Icon icon="mdi:refresh" className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            )}

            {attemptState.hintShown && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="absolute top-0 left-5 translate-y-[-140%] rounded-2xl border-2 bg-[#222225] p-3 shadow-xl"
              >
                <button
                  type="button"
                  onClick={() =>
                    setAttemptState((prev) => ({
                      ...prev,
                      hintShown: false,
                    }))
                  }
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  <Icon
                    icon="material-symbols:close-rounded"
                    className="h-4 w-4"
                  />
                </button>

                <div className="pr-5">
                  <p className="text-sm font-semibold">Hint</p>

                  <p className="text-xs mt-1">
                    {currentQuestion.hint ??
                      "No hint available for this question."}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleHint}
            disabled={attemptState.hintUsed}
            className={`text-sm font-semibold text-gray-700 disabled:text-gray-300 dark:text-gray-300 dark:disabled:text-gray-600 px-5 py-2.5 cursor-pointer
            ${attemptState.hintUsed && "cursor-not-allowed"}
            `}
          >
            Hint
          </button>

          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={nextButtonDisabled}
            className={`flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all ${nextButtonDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            {nextButtonState === "check" && "Check"}
            {nextButtonState === "try-again" && "Try again"}
            {nextButtonState === "next" && (
              <>
                {isLastQuestion ? "Submit" : "Next question"}
                {isLastQuestion && (
                  <Icon icon="mdi:arrow-right" className="h-4 w-4" />
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
