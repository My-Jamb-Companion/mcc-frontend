"use client";

import {useMemo, useState} from "react";
import {AnimatePresence, motion, Variants, Icon} from "@mcc/ui";
import {shuffleArray} from "../../helper/helper";
import {
  PracticeCardProps,
  QuizResultsProps,
  SubmittedAnswer,
} from "../../types/types";

function areAnswersEqual(
  a: string | string[] | undefined,
  b: string | string[] | undefined,
): boolean {
  if (!a || !b) return false;
  const normA = Array.isArray(a) ? [...a].sort() : [a];
  const normB = Array.isArray(b) ? [...b].sort() : [b];
  if (normA.length !== normB.length) return false;
  return normA.every((val, index) => val === normB[index]);
}

function isOptionInAnswer(
  option: string,
  answer: string | string[] | undefined,
): boolean {
  if (!answer) return false;
  if (Array.isArray(answer)) return answer.includes(option);
  return answer === option;
}

export function CoursePractice({questions, onDone}: PracticeCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswer[]>(
    [],
  );
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const randomizedQuestions = useMemo(() => {
    return questions.map((question) => ({
      ...question,
      answers: shuffleArray(question.answers),
    }));
  }, [questions]);

  const currentQuestion = randomizedQuestions[currentIndex];

  const isMulti =
    currentQuestion?.multiSelect ||
    Array.isArray(currentQuestion?.correctAnswer);

  const currentSubmittedAnswer =
    answers.find((item) => item.id === currentQuestion?.id) ??
    submittedAnswers.find((item) => item.id === currentQuestion?.id);

  const selectedAnswer = currentSubmittedAnswer?.answer;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const allAnswered = answers.length === questions.length;

  const handleSelectOption = (answerOption: string) => {
    if (reviewMode) return;

    setAnswers((prev) => {
      const exists = prev.find((item) => item.id === currentQuestion.id);
      let newAnswer: string | string[];

      if (isMulti) {
        const currentArr = Array.isArray(exists?.answer)
          ? (exists?.answer as string[])
          : exists?.answer
            ? [exists.answer as string]
            : [];

        newAnswer = currentArr.includes(answerOption)
          ? currentArr.filter((a) => a !== answerOption)
          : [...currentArr, answerOption];
      } else {
        newAnswer = answerOption;
      }

      if (exists) {
        return prev.map((item) =>
          item.id === currentQuestion.id ? {...item, answer: newAnswer} : item,
        );
      }

      return [
        ...prev,
        {
          id: currentQuestion.id,
          question: currentQuestion.question,
          answer: newAnswer,
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
        },
      ];
    });
  };

  const handleNext = () => {
    setShowExplanation(false);

    if (!reviewMode && isLastQuestion) {
      onComplete(answers);
      return;
    } else if (reviewMode && isLastQuestion) {
      setReviewMode(false);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const retry = () => {
    setAnswers([]);
    setSubmittedAnswers([]);
    setCurrentIndex(0);
    setReviewMode(false);
    setShowExplanation(false);
  };

  const onComplete = (completedAnswers: SubmittedAnswer[]) => {
    setSubmittedAnswers(completedAnswers);
  };

  if (!currentQuestion) return null;

  const hasSelectedAny = Array.isArray(selectedAnswer)
    ? selectedAnswer.length > 0
    : !!selectedAnswer;

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full bg-gray-50 dark:bg-[#222225] rounded-2xl p-6 pb-0 font-sans"
    >
      <motion.div
        layout
        variants={fadeUp}
        className="flex items-start justify-between mb-4"
      >
        <div>
          <motion.p
            key={currentIndex}
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5"
          >
            Practice Quiz - Question {currentIndex + 1} of {questions.length}
            {isMulti && " (Select all that apply)"}
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        layout
        variants={fadeUp}
        className="border-t border-gray-200 dark:border-gray-600 mb-5"
      />

      <AnimatePresence mode="wait">
        {submittedAnswers.length > 0 && !reviewMode ? (
          <motion.div
            key="results"
            layout
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -40,
            }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <QuizResults
              review={submittedAnswers}
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
            key="quiz"
            layout
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <motion.div
              key={`${currentQuestion.id}-${reviewMode}`}
              layout
              variants={questionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.h3
                layout
                variants={fadeUp}
                className="text-base font-bold text-gray-900 dark:text-white"
              >
                {currentQuestion.question}
              </motion.h3>

              <motion.div
                layout
                variants={answerContainer}
                initial="hidden"
                animate="visible"
                className="mt-6 flex flex-col gap-3"
              >
                {currentQuestion.answers.map((answer, index) => {
                  const isSelected = isOptionInAnswer(answer, selectedAnswer);
                  const isCorrectOption = isOptionInAnswer(
                    answer,
                    currentQuestion.correctAnswer,
                  );
                  const isWrongSelected =
                    reviewMode && isSelected && !isCorrectOption;

                  let optionStyle =
                    "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200";

                  if (reviewMode) {
                    if (isCorrectOption) {
                      optionStyle =
                        "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                    }
                    if (isWrongSelected) {
                      optionStyle =
                        "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                    }
                  } else if (isSelected) {
                    optionStyle =
                      "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 disabled:cursor-not-allowed disabled:opacity-60";
                  }

                  return (
                    <motion.button
                      layout
                      variants={answerVariants}
                      whileHover={
                        reviewMode
                          ? {}
                          : {
                              scale: 1.01,
                            }
                      }
                      whileTap={
                        reviewMode
                          ? {}
                          : {
                              scale: 0.98,
                            }
                      }
                      key={answer}
                      type="button"
                      onClick={() => handleSelectOption(answer)}
                      disabled={reviewMode}
                      className={`flex w-full items-center gap-4 rounded-2xl border px-2 py-4 text-left transition-colors ${optionStyle}`}
                    >
                      <motion.span
                        animate={{
                          scale: isSelected ? [1, 1.18, 1] : 1,
                        }}
                        transition={{
                          duration: 0.25,
                        }}
                        className={`
                          flex h-8 w-8 items-center justify-center
                          ${isMulti ? "rounded-md" : "rounded-full"} border text-sm font-semibold
                          ${
                            reviewMode && isCorrectOption
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
                      </motion.span>
                      <motion.span layout className="text-sm font-semibold">
                        {answer}
                      </motion.span>
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div
                layout
                variants={fadeUp}
                className="flex flex-col-reverse md:flex-row md:justify-end gap-3 md:px-8 py-5"
              >
                {reviewMode && (
                  <motion.button
                    layout
                    whileHover={{
                      scale: 1.03,
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    disabled={
                      isFirstQuestion ||
                      (submittedAnswers.length > 0 && !reviewMode)
                    }
                    className="flex items-center gap-2 border rounded-full text-sm font-semibold text-gray-700 disabled:text-gray-300 disabled:bg-gray-100 dark:text-gray-300 dark:disabled:text-gray-600 dark:disabled:bg-neutral-800 px-5 py-2.5 transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    Prev
                  </motion.button>
                )}

                {!reviewMode && (
                  <motion.button
                    layout
                    whileHover={
                      showExplanation
                        ? {}
                        : {
                            scale: 1.03,
                            y: -2,
                          }
                    }
                    whileTap={
                      showExplanation
                        ? {}
                        : {
                            scale: 0.96,
                          }
                    }
                    type="button"
                    onClick={() => setShowExplanation(true)}
                    disabled={showExplanation}
                    className={`flex items-center gap-2 border rounded-full text-sm font-semibold text-gray-700 disabled:text-gray-300 disabled:bg-gray-100 dark:text-gray-300 dark:disabled:text-gray-600 dark:disabled:bg-neutral-800 px-5 py-2.5 transition-all text-nowrap
                      ${
                        showExplanation
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }
                    `}
                  >
                    <Icon
                      icon="ri:bard-fill"
                      color={showExplanation ? "#9ca3af" : "#437DFC"}
                    />
                    Correct Answers Explained
                  </motion.button>
                )}

                <motion.button
                  layout
                  type="button"
                  onClick={handleNext}
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  disabled={
                    isLastQuestion && !reviewMode
                      ? !allAnswered
                      : !hasSelectedAny
                  }
                  className={`flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all text-nowrap ${
                    isLastQuestion && !reviewMode && !allAnswered
                      ? "cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
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
                </motion.button>
              </motion.div>

              <AnimatePresence initial={false}>
                {showExplanation && !reviewMode && (
                  <motion.div
                    layout
                    variants={explanationVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#292727] mb-4 text-left"
                  >
                    <motion.div layout className="p-6">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        Explanation
                      </p>

                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 w-full flex items-center justify-center">
                <div className="flex gap-1">
                  {questions.map((_, i) => {
                    const submitted =
                      answers.find(
                        (a) => a.id === randomizedQuestions[i]?.id,
                      ) ??
                      submittedAnswers.find(
                        (a) => a.id === randomizedQuestions[i]?.id,
                      );

                    const hasAnswer = !!submitted;
                    const isCorrectInReview =
                      reviewMode &&
                      submitted &&
                      areAnswersEqual(
                        submitted.answer,
                        submitted.correctAnswer,
                      );

                    return (
                      <motion.span
                        key={i}
                        layout
                        whileHover={{scale: 1.15}}
                        whileTap={{scale: 0.85}}
                        animate={{
                          scale: currentIndex === i ? 1.35 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 28,
                        }}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${
                          currentIndex === i
                            ? "bg-primary"
                            : reviewMode && isCorrectInReview
                              ? "bg-success"
                              : reviewMode && !isCorrectInReview
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const QuizResults: React.FC<QuizResultsProps> = ({
  review = [],
  onRetry,
  onDone,
  onReview,
}) => {
  const {score, totalQuestions, attempts} = useMemo(() => {
    let currentScore = 0;

    // NOTE: was `item.answer === item.correctAnswer`, which is a reference
    // comparison — for multi-select questions both sides are arrays, so
    // this was false even for a perfect answer. areAnswersEqual (already
    // used for the progress dots below) does an order-independent value
    // comparison and handles both single and multi-select correctly.
    const calculatedAttempts = review.map((item) => {
      const isCorrect = areAnswersEqual(item.answer, item.correctAnswer);
      if (isCorrect) currentScore++;
      return isCorrect ? "correct" : "incorrect";
    });

    return {
      score: currentScore,
      totalQuestions: review.length,
      attempts: calculatedAttempts,
    };
  }, [review]);

  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const {title, message, emoji} = useMemo(() => {
    if (percentage === 100) {
      return {
        emoji: "🏆",
        title: "Perfect Score!",
        message: "Outstanding! You answered every question correctly.",
      };
    }

    if (percentage >= 80) {
      return {
        emoji: "🎉",
        title: "Excellent Work!",
        message: "Great job! You have a strong understanding of this topic.",
      };
    }

    if (percentage >= 60) {
      return {
        emoji: "👏",
        title: "Well Done!",
        message: "Nice work! A little more practice and you'll master it.",
      };
    }

    if (percentage >= 40) {
      return {
        emoji: "💪",
        title: "Keep Going!",
        message: "You're making progress. Review your mistakes and try again.",
      };
    }

    return {
      emoji: "📚",
      title: "Don't Give Up!",
      message:
        "Every expert started somewhere. Review your answers and give it another shot.",
    };
  }, [percentage]);

  return (
    <motion.div
      variants={quizContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center p-10 select-none text-center"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center mb-6"
      >
        <motion.div
          initial={{scale: 0, rotate: -20}}
          animate={{scale: 1, rotate: 0}}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 250,
            damping: 14,
          }}
          className="mb-4 text-6xl"
        >
          {emoji}
        </motion.div>

        <motion.h2
          initial={{opacity: 0, y: 12}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.25}}
          className="text-3xl font-bold text-gray-900"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.35}}
          className="mt-2 max-w-md text-[15px] text-gray-600"
        >
          {message}
        </motion.p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="text-2xl font-bold text-gray-500 mb-6"
      >
        <motion.span
          initial={{scale: 0.5, opacity: 0}}
          animate={{scale: 1, opacity: 1}}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 18,
          }}
          className="inline-block text-5xl font-extrabold text-gray-900 tracking-tight"
        >
          {score}
        </motion.span>
        {` / ${totalQuestions}`}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex justify-center gap-3 mb-8"
      >
        {attempts.map((status, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={badgeVariants}
            whileHover={{
              scale: 1.12,
              rotate: status === "correct" ? 8 : -8,
            }}
            whileTap={{scale: 0.92}}
            className={`flex items-center justify-center w-9 h-9 rounded-full ${
              status === "correct"
                ? "bg-[#ebf7ed] text-[#2e7d32]"
                : "bg-[#fdf2f2] text-[#d32f2f]"
            }`}
          >
            {status === "correct" ? (
              <Icon icon="material-symbols:check-rounded" />
            ) : (
              <Icon icon="material-symbols:close-rounded" />
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <motion.button
          custom={0}
          variants={buttonVariants}
          whileHover={{
            scale: 1.04,
            y: -2,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 cursor-pointer"
        >
          <Icon icon="stash:arrow-retry" />
          Try Again
        </motion.button>

        <motion.button
          custom={1}
          variants={buttonVariants}
          whileHover={{
            scale: 1.04,
            y: -2,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onClick={onReview}
          className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 cursor-pointer"
        >
          Review
        </motion.button>

        <motion.button
          custom={2}
          variants={buttonVariants}
          whileHover={{
            scale: 1.04,
            y: -2,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onClick={onDone}
          className="min-w-[110px] px-7 py-3 text-sm font-semibold text-white bg-[#6211eb] rounded-full hover:bg-[#4e0bc3] active:bg-[#3d08a1] transition-colors duration-200 cursor-pointer"
        >
          Done
        </motion.button>
      </div>
    </motion.div>
  );
};

const quizContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.4,
    rotate: -20,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      delay: 0.45 + index * 0.08,
      type: "spring",
      stiffness: 420,
      damping: 22,
    },
  }),
};

const buttonVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + index * 0.08,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

//
//
//

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const questionVariants: Variants = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: {
      duration: 0.3,
    },
  },
};

const answerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const answerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const explanationVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -10,
    transition: {
      duration: 0.25,
    },
  },
};
