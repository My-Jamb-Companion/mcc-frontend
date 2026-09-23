"use client";

import {useMemo, useState} from "react";
import {AnimatePresence, motion, Variants, Icon} from "@mcc/ui";
import {shuffleArray} from "@/src/features/learnings/helper/helper";
import {ApiModuleGradedAnswer, ApiModuleQuestion, ApiModuleQuizResult} from "@/src/features/learnings/services/moduleQuiz.service";
import {useSubmitModuleAnswers} from "@/src/features/learnings/hooks/useModuleQuiz";

interface PracticeCardProps {
  courseId: string;
  moduleId: string;
  questions: ApiModuleQuestion[];
  onDone?: () => void;
}

export function CoursePractice({courseId, moduleId, questions, onDone}: PracticeCardProps) {
  const submit = useSubmitModuleAnswers(courseId, moduleId);

  const [currentIndex, setCurrentIndex] = useState(0);
  // question_id -> selected option(s), or the single typed answer for
  // long_short_answer. A list even for a single answer, matching what the
  // backend's submit endpoint expects.
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ApiModuleQuizResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const randomizedQuestions = useMemo(
    () => questions.map((q) => ({...q, options: shuffleArray(q.options)})),
    [questions],
  );

  const resultByQuestionId = useMemo(() => {
    const map = new Map<string, ApiModuleGradedAnswer>();
    result?.results.forEach((r) => map.set(r.question_id, r));
    return map;
  }, [result]);

  const currentQuestion = randomizedQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion?.question_id] ?? [];
  const isMultiChoice = currentQuestion?.question_type === "multiple_choice";
  const isFreeText = currentQuestion?.question_type === "long_short_answer";
  const isAnswered = currentAnswer.some((a) => a.trim());

  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const allAnswered = questions.every((q) => (answers[q.question_id] ?? []).some((a) => a.trim()));

  const selectOption = (option: string) => {
    if (reviewMode) return;
    setAnswers((prev) => {
      const existing = prev[currentQuestion.question_id] ?? [];
      if (isMultiChoice) {
        const next = existing.includes(option)
          ? existing.filter((o) => o !== option)
          : [...existing, option];
        return {...prev, [currentQuestion.question_id]: next};
      }
      return {...prev, [currentQuestion.question_id]: [option]};
    });
  };

  const setFreeText = (text: string) => {
    if (reviewMode) return;
    setAnswers((prev) => ({...prev, [currentQuestion.question_id]: [text]}));
  };

  const handleNext = () => {
    setShowExplanation(false);

    if (reviewMode) {
      if (isLastQuestion) {
        setReviewMode(false);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
      return;
    }

    if (isLastQuestion) {
      setSubmitError(null);
      submit.mutate(answers, {
        onSuccess: (graded) => setResult(graded),
        onError: () => setSubmitError("Couldn't submit your answers. Please try again."),
      });
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setReviewMode(false);
    setShowExplanation(false);
    setSubmitError(null);
  };

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full bg-gray-50 dark:bg-[#222225] rounded-2xl p-6 pb-0 font-sans"
    >
      <motion.div layout variants={fadeUp} className="flex items-start justify-between mb-4">
        <motion.p
          key={currentIndex}
          initial={{opacity: 0, y: 8}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.25}}
          className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5"
        >
          Practice Quiz - Question {currentIndex + 1} of {questions.length}
        </motion.p>
      </motion.div>

      <motion.div layout variants={fadeUp} className="border-t border-gray-200 dark:border-gray-600 mb-5" />

      <AnimatePresence mode="wait">
        {result && !reviewMode ? (
          <motion.div
            key="results"
            layout
            initial={{opacity: 0, y: 40}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -40}}
            transition={{duration: 0.45, ease: [0.22, 1, 0.36, 1]}}
          >
            <QuizResults
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
          <motion.div key="quiz" layout initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
            <motion.div
              key={`${currentQuestion.question_id}-${reviewMode}`}
              layout
              variants={questionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.h3 layout variants={fadeUp} className="text-base font-bold text-gray-900 dark:text-white">
                {currentQuestion.question_text}
              </motion.h3>
              {currentQuestion.description && (
                <motion.p layout variants={fadeUp} className="mt-1 text-sm text-gray-500">
                  {currentQuestion.description}
                </motion.p>
              )}
              {isMultiChoice && (
                <motion.p layout variants={fadeUp} className="mt-1 text-xs font-medium text-blue-600">
                  Select all that apply.
                </motion.p>
              )}

              {isFreeText ? (
                <motion.div layout variants={fadeUp} className="mt-6">
                  <textarea
                    value={currentAnswer[0] ?? ""}
                    onChange={(e) => setFreeText(e.target.value)}
                    disabled={reviewMode}
                    placeholder="Type your answer..."
                    rows={4}
                    className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-transparent p-4 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500 disabled:opacity-70"
                  />
                  {reviewMode && (
                    <p className="mt-2 text-sm text-gray-500">
                      {resultByQuestionId.get(currentQuestion.question_id)?.is_correct === null
                        ? "Not auto-graded -- there's no recorded answer to check this against."
                        : resultByQuestionId.get(currentQuestion.question_id)?.is_correct
                          ? "Correct."
                          : `Expected: ${resultByQuestionId.get(currentQuestion.question_id)?.correct_answer.join(", ")}`}
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div layout variants={answerContainer} initial="hidden" animate="visible" className="mt-6 flex flex-col gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer.includes(option);
                    const graded = resultByQuestionId.get(currentQuestion.question_id);
                    const isCorrectOption = graded ? graded.correct_answer.includes(option) : false;
                    const isWrongSelected = reviewMode && isSelected && !isCorrectOption;

                    let optionStyle = "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200";
                    if (reviewMode) {
                      if (isCorrectOption) {
                        optionStyle = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                      }
                      if (isWrongSelected) {
                        optionStyle = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
                    }

                    return (
                      <motion.button
                        layout
                        variants={answerVariants}
                        whileHover={reviewMode ? {} : {scale: 1.01}}
                        whileTap={reviewMode ? {} : {scale: 0.98}}
                        key={option}
                        type="button"
                        onClick={() => selectOption(option)}
                        disabled={reviewMode}
                        className={`flex w-full items-center gap-4 rounded-2xl border px-2 py-4 text-left transition-colors ${optionStyle}`}
                      >
                        <motion.span
                          animate={{scale: isSelected ? [1, 1.18, 1] : 1}}
                          transition={{duration: 0.25}}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                            reviewMode && isCorrectOption
                              ? "border-success bg-success text-white"
                              : reviewMode && isWrongSelected
                                ? "border-danger bg-danger text-white"
                                : isSelected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-300 dark:border-gray-500 dark:text-gray-300"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </motion.span>
                        <motion.span layout className="text-sm font-semibold">
                          {option}
                        </motion.span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              <motion.div layout variants={fadeUp} className="flex flex-col-reverse md:flex-row md:justify-end gap-3 md:px-8 py-5">
                {reviewMode && (
                  <motion.button
                    layout
                    whileHover={{scale: 1.03, y: -2}}
                    whileTap={{scale: 0.96}}
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    disabled={isFirstQuestion}
                    className="flex items-center gap-2 border rounded-full text-sm font-semibold text-gray-700 disabled:text-gray-300 disabled:bg-gray-100 dark:text-gray-300 dark:disabled:text-gray-600 dark:disabled:bg-neutral-800 px-5 py-2.5 transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    Prev
                  </motion.button>
                )}

                {!reviewMode && currentQuestion.explanation && (
                  <motion.button
                    layout
                    whileHover={showExplanation ? {} : {scale: 1.03, y: -2}}
                    whileTap={showExplanation ? {} : {scale: 0.96}}
                    type="button"
                    onClick={() => setShowExplanation(true)}
                    disabled={showExplanation}
                    className={`flex items-center gap-2 border rounded-full text-sm font-semibold text-gray-700 disabled:text-gray-300 disabled:bg-gray-100 dark:text-gray-300 dark:disabled:text-gray-600 dark:disabled:bg-neutral-800 px-5 py-2.5 transition-all text-nowrap ${
                      showExplanation ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Icon icon="ri:bard-fill" color={showExplanation ? "#9ca3af" : "#437DFC"} />
                    Explanation
                  </motion.button>
                )}

                <motion.button
                  layout
                  type="button"
                  onClick={handleNext}
                  whileHover={{scale: 1.03, y: -2}}
                  whileTap={{scale: 0.96}}
                  disabled={
                    isLastQuestion && !reviewMode
                      ? !allAnswered || submit.isPending
                      : !isAnswered
                  }
                  className={`flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all text-nowrap ${
                    isLastQuestion && !reviewMode && !allAnswered ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {reviewMode && isLastQuestion ? (
                    "Done reviewing"
                  ) : isLastQuestion ? (
                    <>
                      {submit.isPending ? "Submitting…" : "Submit"}
                      {!submit.isPending && <Icon icon="mdi:arrow-right" className="h-4 w-4" />}
                    </>
                  ) : (
                    "Next question"
                  )}
                </motion.button>
              </motion.div>

              {submitError && (
                <p className="px-8 pb-4 text-sm text-red-600">{submitError}</p>
              )}

              <AnimatePresence initial={false}>
                {showExplanation && !reviewMode && currentQuestion.explanation && (
                  <motion.div
                    layout
                    variants={explanationVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden rounded-2xl bg-gray-100 dark:bg-[#292727] mb-4 text-left"
                  >
                    <motion.div layout className="p-6">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Explanation</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 w-full flex items-center justify-center">
                <div className="flex gap-1">
                  {questions.map((q, i) => {
                    const hasAnswer = (answers[q.question_id] ?? []).some((a) => a.trim());
                    const graded = resultByQuestionId.get(q.question_id);

                    return (
                      <motion.span
                        key={q.question_id}
                        layout
                        whileHover={{scale: 1.15}}
                        whileTap={{scale: 0.85}}
                        animate={{scale: currentIndex === i ? 1.35 : 1}}
                        transition={{type: "spring", stiffness: 450, damping: 28}}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${
                          currentIndex === i
                            ? "bg-primary"
                            : graded?.is_correct === true
                              ? "bg-success"
                              : graded?.is_correct === false
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

function QuizResults({
  result,
  onRetry,
  onDone,
  onReview,
}: {
  result: ApiModuleQuizResult;
  onRetry?: () => void;
  onDone?: () => void;
  onReview?: () => void;
}) {
  const correctCount = result.results.filter((r) => r.is_correct === true).length;
  const notAutoGraded = result.results.length - result.graded_count;

  const {title, message, emoji} = useMemo(() => {
    if (result.graded_count === 0) {
      return {
        emoji: "📝",
        title: "Submitted",
        message: "Nothing here could be auto-graded, but your answers were recorded.",
      };
    }
    const percentage = result.score_percent;
    if (percentage === 100) return {emoji: "🏆", title: "Perfect Score!", message: "Outstanding! You answered every question correctly."};
    if (percentage >= 80) return {emoji: "🎉", title: "Excellent Work!", message: "Great job! You have a strong understanding of this topic."};
    if (percentage >= 60) return {emoji: "👏", title: "Well Done!", message: "Nice work! A little more practice and you'll master it."};
    if (percentage >= 40) return {emoji: "💪", title: "Keep Going!", message: "You're making progress. Review your mistakes and try again."};
    return {emoji: "📚", title: "Don't Give Up!", message: "Every expert started somewhere. Review your answers and give it another shot."};
  }, [result]);

  return (
    <motion.div
      variants={quizContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center p-10 select-none text-center"
    >
      <motion.div variants={itemVariants} className="flex flex-col items-center mb-6">
        <motion.div
          initial={{scale: 0, rotate: -20}}
          animate={{scale: 1, rotate: 0}}
          transition={{delay: 0.15, type: "spring", stiffness: 250, damping: 14}}
          className="mb-4 text-6xl"
        >
          {emoji}
        </motion.div>
        <motion.h2 initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25}} className="text-3xl font-bold text-gray-900">
          {title}
        </motion.h2>
        <motion.p initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.35}} className="mt-2 max-w-md text-[15px] text-gray-600">
          {message}
        </motion.p>
      </motion.div>

      {result.graded_count > 0 && (
        <motion.div variants={itemVariants} className="text-2xl font-bold text-gray-500 mb-2">
          <motion.span
            initial={{scale: 0.5, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{type: "spring", stiffness: 300, damping: 18}}
            className="inline-block text-5xl font-extrabold text-gray-900 tracking-tight"
          >
            {correctCount}
          </motion.span>
          {` / ${result.graded_count}`}
        </motion.div>
      )}
      {notAutoGraded > 0 && (
        <motion.p variants={itemVariants} className="text-sm text-gray-500 mb-6">
          {notAutoGraded} {notAutoGraded === 1 ? "answer wasn't" : "answers weren't"} auto-graded.
        </motion.p>
      )}

      <motion.div variants={itemVariants} className="flex justify-center gap-3 mb-8">
        {result.results.map((r, index) => (
          <motion.div
            key={r.question_id}
            custom={index}
            variants={badgeVariants}
            whileHover={{scale: 1.12, rotate: r.is_correct === false ? -8 : 8}}
            whileTap={{scale: 0.92}}
            className={`flex items-center justify-center w-9 h-9 rounded-full ${
              r.is_correct === true
                ? "bg-[#ebf7ed] text-[#2e7d32]"
                : r.is_correct === false
                  ? "bg-[#fdf2f2] text-[#d32f2f]"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {r.is_correct === true ? (
              <Icon icon="material-symbols:check-rounded" />
            ) : r.is_correct === false ? (
              <Icon icon="material-symbols:close-rounded" />
            ) : (
              <Icon icon="material-symbols:help-outline-rounded" />
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <motion.button
          custom={0}
          variants={buttonVariants}
          whileHover={{scale: 1.04, y: -2}}
          whileTap={{scale: 0.96}}
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 cursor-pointer"
        >
          <Icon icon="stash:arrow-retry" />
          Try Again
        </motion.button>

        <motion.button
          custom={1}
          variants={buttonVariants}
          whileHover={{scale: 1.04, y: -2}}
          whileTap={{scale: 0.96}}
          onClick={onReview}
          className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-gray-800 bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 cursor-pointer"
        >
          Review
        </motion.button>

        <motion.button
          custom={2}
          variants={buttonVariants}
          whileHover={{scale: 1.04, y: -2}}
          whileTap={{scale: 0.96}}
          onClick={onDone}
          className="min-w-[110px] px-7 py-3 text-sm font-semibold text-white bg-[#6211eb] rounded-full hover:bg-[#4e0bc3] active:bg-[#3d08a1] transition-colors duration-200 cursor-pointer"
        >
          Done
        </motion.button>
      </div>
    </motion.div>
  );
}

const quizContainerVariants: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.12, delayChildren: 0.15}},
};

const itemVariants: Variants = {
  hidden: {opacity: 0, y: 24},
  visible: {opacity: 1, y: 0, transition: {duration: 0.45, ease: [0.22, 1, 0.36, 1]}},
};

const badgeVariants: Variants = {
  hidden: {opacity: 0, scale: 0.4, rotate: -20},
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {delay: 0.45 + index * 0.08, type: "spring", stiffness: 420, damping: 22},
  }),
};

const buttonVariants: Variants = {
  hidden: {opacity: 0, y: 20},
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {delay: 0.8 + index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1]},
  }),
};

const containerVariants: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.08}},
};

const fadeUp: Variants = {
  hidden: {opacity: 0, y: 24},
  visible: {opacity: 1, y: 0, transition: {duration: 0.4, ease: [0.22, 1, 0.36, 1]}},
};

const questionVariants: Variants = {
  initial: {opacity: 0, x: 40},
  animate: {opacity: 1, x: 0, transition: {duration: 0.4, ease: [0.22, 1, 0.36, 1]}},
  exit: {opacity: 0, x: -40, transition: {duration: 0.3}},
};

const answerContainer: Variants = {
  hidden: {},
  visible: {transition: {staggerChildren: 0.06}},
};

const answerVariants: Variants = {
  hidden: {opacity: 0, y: 18},
  visible: {opacity: 1, y: 0, transition: {duration: 0.3, ease: [0.22, 1, 0.36, 1]}},
};

const explanationVariants: Variants = {
  hidden: {opacity: 0, height: 0, y: -10},
  visible: {opacity: 1, height: "auto", y: 0, transition: {duration: 0.35}},
  exit: {opacity: 0, height: 0, y: -10, transition: {duration: 0.25}},
};
