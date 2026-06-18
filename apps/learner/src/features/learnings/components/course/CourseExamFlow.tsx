"use client";

import {useState} from "react";
import CourseCompletion from "./CourseTestComplete";
import CourseExam from "./CourseExam";
import {calculateExamScore} from "../../helper/helper";

type FlowStep = "quiz" | "completion" | "summary" | "certificate";

interface CourseTestFlowProps {
  questions: {
    id: string;
    question: string;
    answers: string[];
    correctAnswer: string;
  }[];
  totalModules?: number;
  pointsPerCorrect?: number;
  diamondsPerCorrect?: number;
  onCertificateReady?: () => void;
}

/**
 * Orchestrates the test-taking flow:
 * 1. CourseTest    - question by question, with answer reveal
 * 2. CourseCompletion - results summary screen
 * 3. (handoff)     - certificate step, delegated to parent via onCertificateReady
 */
export default function CourseTestFlow({
  questions,
  totalModules = 10,
  pointsPerCorrect = 25,
  diamondsPerCorrect = 1,
  onCertificateReady,
}: CourseTestFlowProps) {
  const [step, setStep] = useState<FlowStep>("quiz");
  const [results, setResults] = useState<{
    answers: {
      id: string;
      question: string;
      answer: string;
      correctAnswer: string;
    }[];
    correctCount: number;
  } | null>(null);

  const handleQuizComplete = (
    answers: {
      id: string;
      question: string;
      answer: string;
      correctAnswer: string;
    }[],
  ) => {
    const quizResults = {
      answers,
      correctCount: calculateExamScore(answers),
    };

    setResults(quizResults);

    setStep("completion");

    console.log(quizResults);
  };

  const handleContinueToCertificate = () => {
    setStep("certificate");
    onCertificateReady?.();
  };

  if (step === "quiz") {
    return <CourseExam questions={questions} onComplete={handleQuizComplete} />;
  }

  if (step === "summary" && results) {
    return (
      <CourseExam
        reviewMode
        questions={questions}
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
        onShowSummary={() => {
          setStep("summary");
        }}
        onContinue={handleContinueToCertificate}
      />
    );
  }

  // step === "certificate": parent owns what renders next (e.g. a CertificateView component)
  return null;
}
