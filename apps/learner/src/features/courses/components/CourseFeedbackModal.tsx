"use client";

import {useState} from "react";
import {Icon, Modal} from "@mcc/ui";
import {useSubmitCourseFeedback} from "../hooks/useCourses";

export default function CourseFeedbackModal({
  courseId,
  courseTitle,
  open,
  onClose,
}: {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const feedbackMutation = useSubmitCourseFeedback();

  const reset = () => {
    setRating(0);
    setComments("");
    feedbackMutation.reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={reset} title="Rate this course" description={courseTitle}>
      <div className="flex items-center justify-center gap-2 py-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Icon
              icon={n <= rating ? "solar:star-bold" : "solar:star-linear"}
              size={28}
              className={n <= rating ? "text-amber-400" : "text-gray-300"}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Tell us more about your experience (optional)"
        rows={4}
        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-400 resize-none"
      />

      {feedbackMutation.isError && (
        <p className="mt-3 text-sm text-red-500">
          {(feedbackMutation.error as {response?: {status?: number}})?.response?.status === 409
            ? "You've already left feedback for this course."
            : "Failed to submit feedback. Please try again."}
        </p>
      )}
      {feedbackMutation.isSuccess && (
        <p className="mt-3 text-sm text-emerald-600">Thanks for your feedback!</p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex-1 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          disabled={rating === 0 || feedbackMutation.isPending}
          onClick={() =>
            feedbackMutation.mutate({courseId, rating, comments: comments.trim() || undefined})
          }
          className="flex-1 py-3 rounded-full font-semibold transition-colors bg-violet-600 text-white hover:bg-violet-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {feedbackMutation.isPending ? "Submitting…" : "Submit"}
        </button>
      </div>
    </Modal>
  );
}
