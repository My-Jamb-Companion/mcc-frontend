/** An unnamed quiz set is saved as "Quiz" (the name the API keeps), though students see it as a Test. */
const DEFAULT_QUIZ_NAME = "Quiz";

/** What a student sees for a course quiz set: "Test", or "Test: <name>" when the author named it. */
export const testLabel = (setName: string): string =>
  !setName || setName === DEFAULT_QUIZ_NAME ? "Test" : `Test: ${setName}`;
