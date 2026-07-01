"use client";

import {useMemo, useState} from "react";
import {Icon} from "@mcc/ui";
import {shuffleArray} from "../../helper/helper";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
}

export interface SubmittedAnswer {
  id: string;
  question: string;
  answer: string;
  correctAnswer: string;
  explanation?: string;
}

interface CourseTestProps {
  questions?: Question[];
  onComplete?: (answers: SubmittedAnswer[]) => void;
  reviewMode?: boolean;
  submittedAnswers?: SubmittedAnswer[];
  endReview?: () => void;
}

export default function CourseExam({
  questions = [],
  onComplete,
  reviewMode = false,
  submittedAnswers = [],
  endReview,
}: CourseTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);

  const randomizedQuestions = useMemo(() => {
    return questions.map((question) => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));
  }, []);

  const currentQuestion = randomizedQuestions[currentIndex];

  const currentSubmittedAnswer =
    answers.find((item) => item.id === currentQuestion?.id) ??
    submittedAnswers.find((item) => item.id === currentQuestion?.id);

  const selectedAnswer = currentSubmittedAnswer?.answer;

  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const allAnswered = answers.length === questions.length;

  const handleSelectOption = (answer: string) => {
    if (reviewMode) return;

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
        },
      ];
    });
  };

  const handlePrev = () => {
    if (!isFirstQuestion) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (!reviewMode && isLastQuestion) {
      onComplete?.(answers);
      return;
    } else if (reviewMode && isLastQuestion) {
      endReview?.();
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentQuestion) return null;

  return (
    <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#222225]">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-gray-100 px-8 py-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Compulsory
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white text-nowrap">
            {reviewMode ? "Review your answers" : "Course test"}
          </h2>
        </div>

        <div className="flex items-center justify-center gap-3 max-w-[60%]">
          <span className="text-sm font-medium text-gray-500 text-nowrap">
            Complete your {questions.length} Exercises
          </span>

          <div className="flex gap-1 w-full">
            {questions.map((_, i) => {
              const hasAnswer = answers.some(
                (a) => a.id === randomizedQuestions[i]?.id,
              );

              return (
                <span
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  style={{flex: `1 1 ${100 / questions.length}%`}}
                  className={`h-1.5 min-w-1 rounded-full cursor-pointer transition-colors ${
                    currentIndex === i
                      ? "bg-primary"
                      : reviewMode &&
                          submittedAnswers[i].answer ===
                            submittedAnswers[i].correctAnswer
                        ? "bg-success"
                        : reviewMode &&
                            submittedAnswers[i].answer !=
                              submittedAnswers[i].correctAnswer
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

      <div className="px-8 py-8">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          {currentQuestion.question}
        </h3>

        <div className="mt-6 flex flex-col gap-3">
          {currentQuestion.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;

            const isCorrect = answer === currentQuestion.correctAnswer;

            const isWrongSelected = reviewMode && isSelected && !isCorrect;

            let optionStyle =
              "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200";

            if (reviewMode) {
              if (isCorrect) {
                optionStyle =
                  "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
              }

              if (isWrongSelected) {
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
                className={`
                  flex w-fit items-center gap-4
                  border-y px-2 py-4
                  text-left transition-colors
                  ${optionStyle}
                `}
              >
                <span
                  className={`
                    flex h-8 w-8 items-center justify-center
                    rounded-full border text-sm font-semibold

                    ${
                      reviewMode && isCorrect
                        ? "border-success bg-success text-white"
                        : reviewMode && isWrongSelected
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
      </div>

      {/* FOOTER */}

      <div className="flex justify-end gap-3 rounded-b-2xl bg-gray-100 dark:bg-gray-900 px-8 py-5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirstQuestion}
          className={`text-sm font-semibold text-gray-700 disabled:text-gray-300 dark:text-gray-300 dark:disabled:text-gray-600 px-5 py-2.5 cursor-pointer
            ${isFirstQuestion && "cursor-not-allowed"}
            `}
        >
          Prev
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={
            isLastQuestion && !reviewMode ? !allAnswered : !selectedAnswer
          }
          className={`flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all ${isLastQuestion && !reviewMode && !allAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {reviewMode && isLastQuestion ? (
            "View Feedback"
          ) : (
            <>
              {isLastQuestion ? "Submit" : "Next question"}
              {isLastQuestion && (
                <Icon icon="mdi:arrow-right" className="h-4 w-4" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
