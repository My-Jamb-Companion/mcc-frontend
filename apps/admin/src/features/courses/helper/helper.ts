import {MakeModule, Topic} from "../types/types";

export const shuffleArray = <T>(array: T[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};
export function calculateExamScore(
  answers: {
    id: string;
    question: string;
    answer: string | string[];
    correctAnswer: string | string[];
  }[],
) {
  const correctCount = answers.reduce((total, item) => {
    const normA = Array.isArray(item.answer) ? [...item.answer].sort() : [item.answer];
    const normB = Array.isArray(item.correctAnswer) ? [...item.correctAnswer].sort() : [item.correctAnswer];
    const isCorrect =
      normA.length === normB.length &&
      normA.every((val, idx) => val === normB[idx]);
    return isCorrect ? total + 1 : total;
  }, 0);

  return correctCount;
}

/**
 * Calculates the total hours of video content across all topics and modules.
 * Handles duration stored in seconds on FileRow objects.
 */
export function calculateTotalHours(topics: Topic[] = []): number {
  if (!topics.length) return 0;

  let totalSeconds = 0;

  topics.forEach((topic) => {
    topic.modules?.forEach((module: MakeModule) => {
      module.content?.forEach((item) => {
        // Iterate through lesson content items that contain media duration
        if (item.type === "lesson") {
          if (typeof item.duration === "number" && !isNaN(item.duration)) {
            totalSeconds += item.duration;
          }
        }
      });
    });
  });

  // Convert total seconds to hours rounded to 1 decimal place
  const totalHours = totalSeconds / 3600;
  return Math.round(totalHours * 10) / 10;
}
