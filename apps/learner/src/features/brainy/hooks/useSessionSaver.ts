import {useCallback, useRef, useState} from "react";
import {toReviewResults, type Answer} from "../helper/studySession";
import {useReviewStudySet} from "./useFlashcards";

export type SaveStatus = "idle" | "saving" | "saved" | "failed";

/**
 * Saves a finished study/quiz session to the spaced-repetition schedule.
 * A failure keeps the answers so the results screen can offer Retry rather
 * than silently dropping the student's progress.
 */
export function useSessionSaver(setId: string) {
  const review = useReviewStudySet(setId);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pending = useRef<Answer[]>([]);

  const run = useCallback(() => {
    if (pending.current.length === 0) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    review.mutate(toReviewResults(pending.current), {
      onSuccess: () => setStatus("saved"),
      onError: () => setStatus("failed"),
    });
  }, [review]);

  const save = useCallback(
    (answers: Answer[]) => {
      pending.current = answers;
      run();
    },
    [run],
  );

  return {status, save, retry: run};
}
