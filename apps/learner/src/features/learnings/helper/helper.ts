export const shuffleArray = <T>(array: T[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};
export function calculateExamScore(
  answers: {
    id: string;
    question: string;
    answer: string;
    correctAnswer: string;
  }[],
) {
  const correctCount = answers.reduce((total, item) => {
    return item.answer === item.correctAnswer ? total + 1 : total;
  }, 0);

  return correctCount;
}
