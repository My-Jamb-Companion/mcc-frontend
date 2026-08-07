"use client";

import {useMemo, useState} from "react";
import CourseCompletion from "./CourseTestComplete";
import CourseExam, {Question, SubmittedAnswer} from "./CourseExam";
import {motion} from "@mcc/ui";
import {calculateExamScore} from "../../helper/helper";
import {CreatPracticeQuestionType, Option} from "../../types/types";

type FlowStep = "intro" | "quiz" | "completion" | "summary" | "certificate";

interface CourseTestIntroProps {
  questionCount: number;
  minMinutes?: number;
  maxMinutes?: number;
  onStart: () => void;
}

interface CourseTestFlowProps {
  questions: (CreatPracticeQuestionType | Question)[];
  totalModules?: number;
  pointsPerCorrect?: number;
  diamondsPerCorrect?: number;
  onCertificateReady?: () => void;
  timer?: number;
}

export default function CourseTestFlow({
  questions = [],
  timer,
  totalModules = 10,
  pointsPerCorrect = 25,
  diamondsPerCorrect = 1,
  onCertificateReady,
}: CourseTestFlowProps) {
  const [step, setStep] = useState<FlowStep>("intro");
  const [results, setResults] = useState<{
    answers: SubmittedAnswer[];
    correctCount: number;
  } | null>(null);

  const formattedQuestions: Question[] = useMemo(() => {
    return questions.map((q: any) => {
      if (q.answers && !q.options) {
        return q as Question;
      }

      const options = q.options || [];
      const correctTexts = options
        .filter((o: Option) => o.isCorrect)
        .map((o: Option) => o.text);
      const isMulti = q.type === "multiple";

      return {
        id: q.id,
        question: q.question,
        answers: options.map((o: Option) => o.text),
        correctAnswer: isMulti ? correctTexts : (correctTexts[0] ?? ""),
        multiSelect: isMulti,
      };
    });
  }, [questions]);
  console.log(formattedQuestions);
  const handleQuizComplete = (answers: SubmittedAnswer[]) => {
    const quizResults = {
      answers,
      correctCount: calculateExamScore(answers),
    };

    setResults(quizResults);
    setStep("completion");
  };

  const handleContinueToCertificate = () => {
    setStep("certificate");
    onCertificateReady?.();
  };

  if (step === "intro") {
    return (
      <CourseTestIntro
        questionCount={formattedQuestions.length}
        onStart={() => setStep("quiz")}
        maxMinutes={timer}
      />
    );
  }

  if (step === "quiz") {
    return (
      <CourseExam
        questions={formattedQuestions}
        onComplete={handleQuizComplete}
      />
    );
  }

  if (step === "summary" && results) {
    return (
      <CourseExam
        reviewMode
        questions={formattedQuestions}
        submittedAnswers={results.answers}
        endReview={() => setStep("completion")}
      />
    );
  }

  if (step === "completion" && results) {
    const totalCount = Number(results.answers.length);
    const correctCount = results.correctCount;
    const failedModules = totalCount - correctCount > 0 ? 1 : 0;

    return (
      <CourseCompletion
        modulesLeveledUp={totalModules - failedModules}
        modulesFailed={failedModules}
        correctCount={correctCount}
        totalCount={totalCount}
        points={correctCount * pointsPerCorrect}
        diamondsEarned={correctCount * diamondsPerCorrect}
        onShowSummary={() => setStep("summary")}
        onContinue={handleContinueToCertificate}
      />
    );
  }

  return null;
}
function CourseTestIntro({
  questionCount,
  minMinutes = 5,
  maxMinutes = 10,
  onStart,
}: CourseTestIntroProps) {
  return (
    <div className="w-full rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#222225] overflow-hidden">
      <div
        className="relative flex flex-col items-center justify-center px-8 py-20 text-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, #a78bfa 0%, #7c3aed 55%, #6d28d9 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[480px] h-[200px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.18) 0%, transparent 70%)",
          }}
        />

        <motion.h2
          initial={{opacity: 0, y: -16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.45, ease: "easeOut"}}
          className="relative z-10 text-3xl font-bold text-white mb-3"
        >
          Time for a Course test?
        </motion.h2>

        <motion.p
          initial={{opacity: 0, y: -10}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.45, delay: 0.08, ease: "easeOut"}}
          className="relative z-10 text-sm text-white/80 mb-6"
        >
          Get ready for a question on the course you have completed.
        </motion.p>

        <motion.p
          initial={{opacity: 0, y: -8}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.4, delay: 0.16, ease: "easeOut"}}
          className="relative z-10 text-sm font-semibold text-white mb-10"
        >
          <span>{questionCount} question</span>
          <span className="mx-3 opacity-50">•</span>
          <span>
            {minMinutes} – {maxMinutes} minutes
          </span>
        </motion.p>

        <motion.div
          initial={{opacity: 0, scale: 0.72}}
          animate={{opacity: 1, scale: 1}}
          transition={{
            duration: 0.55,
            delay: 0.22,
            type: "spring",
            stiffness: 200,
            damping: 18,
          }}
          className="relative z-10"
        >
          <Badge />
        </motion.div>
      </div>

      <div className="flex justify-end px-8 py-5 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{scale: 1.03}}
          whileTap={{scale: 0.96}}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white cursor-pointer transition-colors hover:bg-blue-700 active:bg-blue-800"
        >
          Let&apos;s Go!
        </motion.button>
      </div>
    </div>
  );
}

const Badge = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="262"
      height="265"
      viewBox="0 0 262 265"
      fill="none"
    >
      <g filter="url(#filter0_ddddd_3823_34008)">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M119.78 7.47858C118.189 8.41765 111.919 13.8643 105.836 19.4048C90.3946 33.5847 88.6169 34.9933 86.0901 37.341C59.793 38.6557 53.1483 37.0593 57.8275 60.6299C58.5762 64.2923 58.389 64.6678 50.8087 74.6219C32.747 98.3804 33.5894 96.2206 39.298 103.639C40.5146 105.33 59.4186 131.905 59.4186 131.905C58.4828 141.014 58.7632 141.859 54.8326 145.616C50.7149 149.466 42.8542 158.763 36.9584 166.745C34.7124 169.844 32.0919 173.224 31.156 174.257C27.0383 178.953 15.8082 198.391 13.8429 204.12C8.13431 220.553 15.5271 221.398 38.2681 206.749L45.7548 201.96C48.0944 234.076 47.9076 237.738 54.0841 237.738C55.8622 237.738 67.7476 222.15 75.3279 209.754C83.7505 196.137 101.438 172.755 102.655 173.6C110.141 178.107 114.071 181.958 127.173 187.029C128.67 187.592 130.355 187.498 131.759 186.841C134.005 185.714 137.562 183.836 145.703 178.389C153.845 172.942 154.032 172.849 155.904 174.539C160.302 178.577 184.634 215.482 190.342 226.845C197.829 241.776 202.228 244.593 206.065 232.573C208.779 223.934 211.024 208.345 212.335 199.236C212.335 199.236 234.608 214.168 236.573 215.576C240.504 218.393 243.779 218.393 248.084 215.67C255.945 210.693 223.472 156.321 203.538 141.202C199.233 137.915 197.174 135.755 197.549 135.004C197.923 134.347 204.568 127.022 212.241 118.664C232.643 96.6901 232.83 100.165 209.341 76.5941C198.485 65.7009 196.519 62.3202 195.584 60.442C195.116 59.503 195.303 53.0234 194.46 46.2621C192.495 31.4248 193.431 32.1761 177.147 33.1152C167.04 33.6786 165.169 33.5847 163.484 32.27C134.473 10.014 126.518 3.44059 119.78 7.47858ZM135.97 22.0342C151.037 33.7725 158.524 38.5617 161.799 38.7496C165.355 38.9374 180.517 38.4678 184.541 38.3739L185.57 56.0285C185.664 58.2822 186.599 60.3482 188.003 62.0385C206.907 83.3554 207.281 84.3883 216.546 97.6291C198.952 118.758 193.992 127.773 189.874 132.187C187.16 135.098 187.535 135.38 187.91 154.537C164.888 156.509 165.45 156.039 158.15 160.077C138.872 170.783 129.045 180.361 129.045 180.361L120.716 175.854C113.51 171.91 96.8523 161.674 92.641 158.011C92.0795 157.636 89.7401 154.725 85.3416 154.912L67.8412 155.758L67.3733 134.816C67.1861 128.712 63.7229 124.674 45.2869 101.385C63.6294 72.8377 60.1673 76.9697 66.9054 64.9496C68.5899 61.8507 68.3091 52.46 68.3091 45.6048C68.3091 44.384 69.2448 43.351 70.4614 43.2571C89.7397 41.9424 91.7046 42.1302 100.034 35.4628C110.889 26.6356 122.026 16.6814 122.588 15.3667C123.524 13.0191 125.957 14.2399 135.97 22.0342ZM151.412 45.323C142.334 40.6277 124.366 38.5618 114.165 40.9095C43.135 57.1554 56.5175 162.143 129.607 161.955C187.535 161.768 216.359 81.7589 168.912 52.8356C159.741 47.2951 156.091 52.0843 164.981 58.0944C215.423 92.0886 161.145 177.638 106.211 150.687C47.7206 122.045 77.3864 37.9984 142.802 49.3611C150.382 50.7697 156.372 47.8585 151.412 45.323ZM113.323 61.8506C95.5417 66.3582 84.7799 107.208 93.5769 107.208C95.2614 107.208 96.0097 105.142 96.0097 100.259C96.0097 88.6141 109.299 67.3912 118.47 64.4801C122.962 63.0715 118.189 60.6298 113.323 61.8506ZM128.109 73.8708C125.208 75.9367 119.5 85.3274 113.417 92.3704C112.481 93.4973 112.574 95.1876 113.791 96.1266C115.007 97.1596 118.938 96.5962 121.465 94.3424C125.115 91.0557 125.301 90.9618 124.833 93.2156C123.991 96.6901 122.307 107.302 122.026 111.058C121.745 114.345 121.746 114.345 115.569 115.378C98.6304 118.195 108.831 125.895 114.727 127.21C120.061 128.431 128.203 128.337 139.526 127.116C149.353 126.083 145.61 114.814 135.409 114.814C130.824 114.814 131.011 115.659 133.35 99.789C136.626 78.0965 136.719 75.7489 134.192 74.0585C131.571 72.0865 130.636 72.0865 128.109 73.8708ZM168.07 95.3755C168.07 107.302 161.706 120.636 152.348 128.337C144.019 135.192 143.363 138.76 150.756 137.915C163.203 136.507 179.767 99.6012 171.626 91.3374C169.099 88.9897 168.07 90.2106 168.07 95.3755ZM215.049 168.904C224.595 182.333 234.888 199.612 234.327 201.115C234.14 201.49 228.619 199.143 221.975 195.856C205.41 187.592 204.006 188.061 202.602 201.866C200.263 224.873 200.263 224.873 190.436 208.439C178.083 187.592 174.715 184.493 160.209 169.186C164.607 164.491 165.169 162.707 182.014 162.894C195.209 163.082 194.554 163.458 196.052 154.067L197.268 146.367C200.824 150.123 203.725 152.846 215.049 168.904ZM59.6992 157.354C60.1671 163.74 64.472 165.43 79.3519 165.242C95.8227 165.054 95.9163 165.148 86.8386 176.041C68.4961 198.016 62.7871 209.848 56.049 222.619C53.6159 193.32 54.3649 193.039 48.4691 193.226C45.1001 193.32 33.9635 199.518 29.2843 202.523C25.1666 205.246 25.1665 202.241 25.8215 200.551C28.1611 194.259 57.6403 151.907 58.7634 152.94C59.0441 153.316 59.512 155.382 59.6992 157.354Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_ddddd_3823_34008"
          x="-8.93945"
          y="-1"
          width="277"
          height="278"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="dilate"
            in="SourceAlpha"
            result="effect1_dropShadow_3823_34008"
          />
          <feOffset />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.152941 0 0 0 0 0.152941 0 0 0 0 0.164706 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_3823_34008"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_3823_34008"
            result="effect2_dropShadow_3823_34008"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="6" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_dropShadow_3823_34008"
            result="effect3_dropShadow_3823_34008"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
          />
          <feBlend
            mode="normal"
            in2="effect3_dropShadow_3823_34008"
            result="effect4_dropShadow_3823_34008"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="0.5"
            operator="erode"
            in="SourceAlpha"
            result="effect5_dropShadow_3823_34008"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"
          />
          <feBlend
            mode="normal"
            in2="effect4_dropShadow_3823_34008"
            result="effect5_dropShadow_3823_34008"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect5_dropShadow_3823_34008"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
