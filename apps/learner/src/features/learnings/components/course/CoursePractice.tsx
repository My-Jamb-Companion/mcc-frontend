"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {AnimatePresence, motion, Variants, Icon, confettiCelebrate, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {shuffleArray} from "@/src/features/learnings/helper/helper";
import {ApiModuleGradedAnswer, ApiModuleQuestion, ApiModuleQuizResult} from "@/src/features/learnings/services/moduleQuiz.service";
import {useSubmitModuleAnswers} from "@/src/features/learnings/hooks/useModuleQuiz";
import {useAnalysis, useQuestionHelp} from "@/src/features/brainy/hooks/useAiFeedback";
import {useCountdown} from "@/src/features/learnings/hooks/useCountdown";
import {formatCountdown, isCountdownLow} from "@/src/features/learnings/helper/countdown";
import {isChosenCorrect, responsesForChosen} from "@/src/features/learnings/helper/practiceFeedback";
import PointsEarnedCard from "@/src/features/rewards/components/PointsEarnedCard";
import PracticeFeedbackCard from "@/src/features/learnings/components/PracticeFeedbackCard";
import CourseTestIntro from "./CourseTestIntro";
import SmartZoneIntro from "@/src/features/smart-zone/components/SmartZoneIntro";
import SmartZoneTimer from "@/src/features/smart-zone/components/SmartZoneTimer";
import SoundToggle from "@/src/features/smart-zone/components/SoundToggle";
import KeyCap from "@/src/features/smart-zone/components/KeyCap";
import ShortcutsHelp, {ShortcutsButton} from "@/src/features/smart-zone/components/ShortcutsHelp";
import {useSmartZoneKeys} from "@/src/features/smart-zone/hooks/useSmartZoneKeys";
import {playSound, unlockAudio} from "@/src/features/smart-zone/sound/engine";
import {setSoundEnabled, soundEnabledNow} from "@/src/features/smart-zone/sound/prefs";

interface PracticeCardProps {
  courseId: string;
  moduleId: string;
  questions: ApiModuleQuestion[];
  /** What the student is doing, shown above each question; "Practice Quiz" by default. */
  label?: string;
  /** Minutes allowed; the quiz is submitted automatically at zero. Omit for untimed. */
  timerMinutes?: number | null;
  /** Percent needed to pass; adds a pass/fail result. Omit for none. */
  passingScore?: number | null;
  /**
   * Practice mode: check each answer as you go and read the teacher's response
   * for the option you chose, right or wrong. The point is to learn, not to score.
   */
  showFeedback?: boolean;
  /** A Test opens with an intro card ("Time for a Course test?") before the first question. */
  showIntro?: boolean;
  /**
   * The Smart Zone (a course Exercise): a ring countdown with a tick and alarm, sound effects, A-D / Enter keyboard
   * controls and its own intro. Answers are still marked all together when the learner submits.
   */
  smartZone?: boolean;
  onDone?: () => void;
}

export function CoursePractice({
  courseId,
  moduleId,
  questions,
  label = "Practice Quiz",
  timerMinutes,
  passingScore,
  showFeedback = false,
  showIntro = false,
  smartZone = false,
  onDone,
}: PracticeCardProps) {
  const zone = smartZone;
  const submit = useSubmitModuleAnswers(courseId, moduleId);
  const questionHelp = useQuestionHelp();

  const [currentIndex, setCurrentIndex] = useState(0);
  // question_id -> selected option(s), or the single typed answer for
  // long_short_answer. A list even for a single answer, matching what the
  // backend's submit endpoint expects.
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ApiModuleQuizResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [aiHelp, setAiHelp] = useState<Record<string, string>>({});
  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [started, setStarted] = useState(!(showIntro || zone));
  const [helpOpen, setHelpOpen] = useState(false);
  // The clock ended the session, so the finish sound is the alarm's, not the fanfare's.
  const [endedByClock, setEndedByClock] = useState(false);
  // Practice mode: question ids the student has checked (their answer is then locked).
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // The timer's expiry handler reads the answers as they are at that moment.
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Marks arrived: show them, with the Smart Zone's finish sound (the alarm has already sounded if the clock ended it).
  const onGraded = (graded: ApiModuleQuizResult, byClock: boolean) => {
    setResult(graded);
    if (!zone) return;
    if (!byClock) playSound(graded.score_percent >= 50 ? "complete" : "consolation");
    if (graded.score_percent === 100) confettiCelebrate();
  };

  const remaining = useCountdown(
    timerMinutes,
    !result && !timedOut && !submit.isPending,
    () => {
      const current = answersRef.current;
      if (Object.values(current).some((a) => a.some((x) => x.trim()))) {
        setEndedByClock(true);
        submit.mutate(current, {
          onSuccess: (graded) => onGraded(graded, true),
          onError: () => setSubmitError("Time's up, but we couldn't submit your answers. Please try again."),
        });
      } else {
        setTimedOut(true);
      }
    },
    attempt,
  );

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

  const isChecked = showFeedback && !reviewMode && !!checked[currentQuestion?.question_id];
  // The un-shuffled question, so a response is found by its option's text.
  const originalQuestion = questions.find((q) => q.question_id === currentQuestion?.question_id);

  const selectOption = (option: string) => {
    if (reviewMode || isChecked) return;
    if (zone) playSound("select");
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
    if (zone) playSound(isLastQuestion && !reviewMode ? "enter" : "next");

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
        onSuccess: (graded) => onGraded(graded, false),
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
    setAiHelp({});
    setTimedOut(false);
    setChecked({});
    setEndedByClock(false);
    setAttempt((n) => n + 1);
  };

  const askAiToExplain = (questionId: string) => {
    questionHelp.mutate(questionId, {
      onSuccess: (res) => setAiHelp((prev) => ({...prev, [questionId]: res.explanation})),
      onError: (error) => showError(extractApiError(error, "Couldn't get an explanation right now")),
    });
  };

  // What the main button does and whether it can be pressed; the Enter key does the same.
  const needsCheck = showFeedback && !reviewMode && !isChecked;
  const primaryDisabled = needsCheck
    ? !isAnswered
    : isLastQuestion && !reviewMode
      ? !allAnswered || submit.isPending
      : !isAnswered;
  const runPrimary = () => {
    if (needsCheck) setChecked((prev) => ({...prev, [currentQuestion.question_id]: true}));
    else handleNext();
  };

  // Reviewing a marked Smart Zone: each question you land on sounds its verdict.
  const reviewedId = currentQuestion?.question_id;
  useEffect(() => {
    if (!zone || !reviewMode || !reviewedId) return;
    const verdict = resultByQuestionId.get(reviewedId)?.is_correct;
    if (verdict === true) playSound("correct");
    else if (verdict === false) playSound("wrong");
  }, [zone, reviewMode, reviewedId, resultByQuestionId]);

  useSmartZoneKeys(
    (action) => {
      if (!currentQuestion) return;
      switch (action.type) {
        case "pick":
          selectOption(currentQuestion.options[action.index]);
          break;
        case "primary":
          if (!primaryDisabled) runPrimary();
          break;
        case "next":
          if (!primaryDisabled && (isAnswered || reviewMode)) runPrimary();
          break;
        case "previous":
          if (reviewMode && !isFirstQuestion) {
            playSound("next");
            setCurrentIndex((prev) => prev - 1);
          }
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
    {
      optionCount: isFreeText ? 0 : (currentQuestion?.options.length ?? 0),
      helpOpen,
      enabled: zone && started && !timedOut && (!result || reviewMode),
    },
  );

  // The question list can be refreshed underneath a running session; render nothing rather than crash.
  if (!currentQuestion) return null;

  if (!started && zone) {
    return (
      <SmartZoneIntro
        questionCount={questions.length}
        estimate={timerMinutes ? "" : `${questions.length} - ${questions.length * 2} minutes`}
        timerMinutes={timerMinutes}
        onStart={() => {
          unlockAudio();
          setStarted(true);
        }}
      />
    );
  }

  if (!started) {
    return (
      <CourseTestIntro
        questionCount={questions.length}
        timerMinutes={timerMinutes}
        passingScore={passingScore}
        onStart={() => setStarted(true)}
      />
    );
  }

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
          className="text-[11px] font-semibold tracking-widest text-muted uppercase mb-0.5"
        >
          {label} - Question {currentIndex + 1} of {questions.length}
        </motion.p>
        {zone ? (
          <div className="flex shrink-0 items-center gap-2">
            {remaining !== null && !result && timerMinutes ? (
              <SmartZoneTimer remaining={remaining} totalSeconds={timerMinutes * 60} />
            ) : null}
            <SoundToggle />
            <ShortcutsButton onClick={() => setHelpOpen(true)} />
          </div>
        ) : (
          remaining !== null &&
          !result && (
            <span
              role="timer"
              aria-label="Time left"
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tabular-nums ${
                isCountdownLow(remaining) ? "bg-red-100 text-red-600" : "bg-muted/20 text-foreground"
              }`}
            >
              <Icon icon="ph:timer" className="h-3.5 w-3.5" />
              {formatCountdown(remaining)}
            </span>
          )
        )}
      </motion.div>

      <motion.div layout variants={fadeUp} className="border-t border-gray-200 dark:border-gray-600 mb-5" />

      <AnimatePresence mode="wait">
        {timedOut && !result ? (
          <motion.div key="timed-out" initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="text-5xl">⏰</div>
            <h2 className="text-2xl font-bold text-foreground">Time&apos;s up</h2>
            <p className="max-w-md text-sm text-subtle">You hadn&apos;t answered any questions before the time ran out.</p>
            <div className="flex gap-3">
              <button type="button" onClick={retry} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                Try again
              </button>
              {onDone && (
                <button type="button" onClick={onDone} className="rounded-full border px-5 py-2.5 text-sm font-semibold text-foreground">
                  Done
                </button>
              )}
            </div>
          </motion.div>
        ) : result && !reviewMode ? (
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
              endedByClock={endedByClock}
              practice={showFeedback}
              passingScore={passingScore}
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
                <motion.p layout variants={fadeUp} className="mt-1 text-sm text-subtle">
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
                    <p className="mt-2 text-sm text-subtle">
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
                    const showCheckColours = isChecked;
                    const checkedCorrect = showCheckColours && currentQuestion.correct_answers.includes(option);
                    const checkedWrong = showCheckColours && isSelected && !checkedCorrect;

                    let optionStyle = "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200";
                    if (reviewMode) {
                      if (isCorrectOption) {
                        optionStyle = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                      }
                      if (isWrongSelected) {
                        optionStyle = "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400";
                      }
                    } else if (showCheckColours && checkedCorrect) {
                      optionStyle = "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                    } else if (checkedWrong) {
                      optionStyle = "border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
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
                        disabled={reviewMode || isChecked}
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
                        <motion.span layout className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">{option}</span>
                          {reviewMode && (
                            <ReviewResponse
                              response={
                                graded?.option_feedback?.[
                                  (originalQuestion?.options ?? []).findIndex((o) => o === option)
                                ]
                              }
                            />
                          )}
                        </motion.span>
                        {zone && !reviewMode && <KeyCap className="ml-auto mr-2">{String.fromCharCode(65 + index)}</KeyCap>}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {isChecked && originalQuestion && (
                <PracticeFeedbackCard
                  correct={isChosenCorrect(currentAnswer, currentQuestion.correct_answers)}
                  chosen={responsesForChosen(originalQuestion, currentAnswer, currentQuestion.correct_answers)}
                  correctAnswers={currentQuestion.correct_answers}
                  explanation={currentQuestion.explanation}
                />
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
                    Prev {zone && <KeyCap>P</KeyCap>}
                  </motion.button>
                )}

                {reviewMode && !aiHelp[currentQuestion.question_id] && (
                  <motion.button
                    layout
                    whileHover={{scale: 1.03, y: -2}}
                    whileTap={{scale: 0.96}}
                    type="button"
                    onClick={() => askAiToExplain(currentQuestion.question_id)}
                    disabled={questionHelp.isPending}
                    className="flex items-center justify-center gap-1.5 border rounded-full text-sm font-semibold text-primary border-primary/40 disabled:opacity-50 px-5 py-2.5 transition-all cursor-pointer hover:bg-primary/5"
                  >
                    <Icon icon="mingcute:ai-fill" className="h-3.5 w-3.5" />
                    {questionHelp.isPending ? "Asking Brainy…" : "Explain this"}
                  </motion.button>
                )}

                {!reviewMode && !showFeedback && currentQuestion.explanation && (
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
                  onClick={runPrimary}
                  whileHover={{scale: 1.03, y: -2}}
                  whileTap={{scale: 0.96}}
                  disabled={primaryDisabled}
                  className={`flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-all text-nowrap ${
                    isLastQuestion && !reviewMode && !allAnswered ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {showFeedback && !reviewMode && !isChecked ? (
                    "Check answer"
                  ) : reviewMode && isLastQuestion ? (
                    "Done reviewing"
                  ) : isLastQuestion ? (
                    <>
                      {submit.isPending ? "Submitting…" : "Submit"}
                      {!submit.isPending && <Icon icon="mdi:arrow-right" className="h-4 w-4" />}
                    </>
                  ) : (
                    "Next question"
                  )}
                  {zone && <KeyCap className="border-white/60 text-white">Enter</KeyCap>}
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

              {reviewMode && aiHelp[currentQuestion.question_id] && (
                <motion.div
                  layout
                  variants={explanationVariants}
                  initial="hidden"
                  animate="visible"
                  className="overflow-hidden rounded-2xl bg-primary/5 mb-4 text-left"
                >
                  <motion.div layout className="p-6">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
                      <Icon icon="mingcute:ai-fill" className="h-3.5 w-3.5" />
                      Brainy explains
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiHelp[currentQuestion.question_id]}
                    </p>
                  </motion.div>
                </motion.div>
              )}

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
      {zone && <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />}
    </motion.div>
  );
}

function QuizResults({
  result,
  endedByClock,
  practice,
  passingScore,
  onRetry,
  onDone,
  onReview,
}: {
  result: ApiModuleQuizResult;
  /** The Smart Zone's clock ran out and submitted the answers so far. */
  endedByClock?: boolean;
  /** Practice: no grade-style verdict, just a note that it is for learning. */
  practice?: boolean;
  passingScore?: number | null;
  onRetry?: () => void;
  onDone?: () => void;
  onReview?: () => void;
}) {
  const correctCount = result.results.filter((r) => r.is_correct === true).length;
  const notAutoGraded = result.results.length - result.graded_count;
  const analysis = useAnalysis();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleGetFeedback = () => {
    analysis.mutate(
      {total_questions: result.graded_count, correct_answers: correctCount},
      {
        onSuccess: (res) => setFeedback(res.feedback),
        onError: (error) => showError(extractApiError(error, "Couldn't get feedback right now")),
      },
    );
  };

  const {title, message, emoji} = useMemo(() => {
    if (result.graded_count === 0) {
      return {
        emoji: "📝",
        title: "Submitted",
        message: "Nothing here could be auto-graded, but your answers were recorded.",
      };
    }
    if (practice) {
      return {
        emoji: "🌱",
        title: "Practice complete",
        message: "Every answer was a chance to learn. Review any you want another look at, or try again.",
      };
    }
    const percentage = result.score_percent;
    if (percentage === 100) return {emoji: "🏆", title: "Perfect Score!", message: "Outstanding! You answered every question correctly."};
    if (percentage >= 80) return {emoji: "🎉", title: "Excellent Work!", message: "Great job! You have a strong understanding of this topic."};
    if (percentage >= 60) return {emoji: "👏", title: "Well Done!", message: "Nice work! A little more practice and you'll master it."};
    if (percentage >= 40) return {emoji: "💪", title: "Keep Going!", message: "You're making progress. Review your mistakes and try again."};
    return {emoji: "📚", title: "Don't Give Up!", message: "Every expert started somewhere. Review your answers and give it another shot."};
  }, [result, practice]);

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
        <motion.h2 initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25}} className="text-3xl font-bold text-foreground">
          {title}
        </motion.h2>
        <motion.p initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.35}} className="mt-2 max-w-md text-[15px] text-subtle">
          {message}
        </motion.p>
        {endedByClock && (
          <motion.p role="status" initial={{opacity: 0}} animate={{opacity: 1}} className="mt-3 flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-600">
            <Icon icon="ph:alarm-bold" className="h-4 w-4" /> Time&apos;s up: your answers so far were submitted.
          </motion.p>
        )}
        {result.passed !== null && result.passed !== undefined && (
          <motion.p
            role="status"
            initial={{opacity: 0, y: 6}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.45}}
            className={`mt-3 rounded-full px-4 py-1.5 text-sm font-semibold ${
              result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {result.passed ? "Passed" : "Not passed"} · {Math.round(result.score_percent)}% (pass mark{" "}
            {result.passing_score ?? passingScore}%)
          </motion.p>
        )}
      </motion.div>

      {result.graded_count > 0 && (
        <motion.div variants={itemVariants} className="text-2xl font-bold text-subtle mb-2">
          <motion.span
            initial={{scale: 0.5, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{type: "spring", stiffness: 300, damping: 18}}
            className="inline-block text-5xl font-extrabold text-foreground tracking-tight"
          >
            {correctCount}
          </motion.span>
          {` / ${result.graded_count}`}
        </motion.div>
      )}
      {notAutoGraded > 0 && (
        <motion.p variants={itemVariants} className="text-sm text-subtle mb-6">
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
                  : "bg-muted/10 text-muted"
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

      {result.gamification && (
        <motion.div variants={itemVariants} className="mb-6 flex w-full justify-center">
          <PointsEarnedCard gamification={result.gamification} scorePercent={result.score_percent} />
        </motion.div>
      )}

      {result.graded_count > 0 && (
        <motion.div variants={itemVariants} className="w-full max-w-md mb-8">
          {feedback ? (
            <div className="rounded-2xl bg-primary/5 p-5 text-left">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1">
                <Icon icon="mingcute:ai-fill" className="h-3.5 w-3.5" />
                Brainy&apos;s feedback
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feedback}</p>
            </div>
          ) : (
            <motion.button
              type="button"
              whileHover={{scale: 1.03, y: -2}}
              whileTap={{scale: 0.96}}
              onClick={handleGetFeedback}
              disabled={analysis.isPending}
              className="flex items-center justify-center gap-1.5 mx-auto rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary disabled:opacity-50 cursor-pointer hover:bg-primary/5"
            >
              <Icon icon="mingcute:ai-fill" className="h-3.5 w-3.5" />
              {analysis.isPending ? "Asking Brainy…" : "Get AI feedback"}
            </motion.button>
          )}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <motion.button
          custom={0}
          variants={buttonVariants}
          whileHover={{scale: 1.04, y: -2}}
          whileTap={{scale: 0.96}}
          onClick={onRetry}
          className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-foreground bg-background border border-muted/30 rounded-full hover:bg-muted/10 active:bg-muted/10 transition-colors duration-200 cursor-pointer"
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
          className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-foreground bg-background border border-muted/30 rounded-full hover:bg-muted/10 active:bg-muted/10 transition-colors duration-200 cursor-pointer"
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

/** The author's response to one option, shown under it in the review of a Test. */
function ReviewResponse({response}: {response?: string | null}) {
  return response ? <span className="text-xs font-normal leading-relaxed opacity-80">{response}</span> : null;
}
