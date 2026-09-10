"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PendingCourse, useCourseStore } from "@mcc/store";
import { extractApiError } from "@mcc/api";
import { initializeCoursePayment, registerForExamProgram } from "./enrollment.service";

/**
 * Completes whatever's in useCourseStore's pendingCourse, once the caller
 * has a real session (called right after a successful login/signup) --
 * the enroll/register call itself needs login_required, so it can't happen
 * before that.
 */
export const useCompleteEnrollment = () => {
  const router = useRouter();
  const clearPendingCourse = useCourseStore((s) => s.clearPendingCourse);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = async (pending: PendingCourse) => {
    setIsPending(true);
    setError(null);
    try {
      const result =
        pending.kind === "exam"
          ? await registerForExamProgram(pending.id)
          : await initializeCoursePayment(
              pending.id,
              pending.price && pending.price > 0 ? "paid" : "free",
            );

      clearPendingCourse();

      if (result.checkout_url) {
        // Real Flutterwave-hosted checkout -- leaving the app entirely.
        window.location.href = result.checkout_url;
        return;
      }

      router.push(`/enrolled?title=${encodeURIComponent(pending.title)}`);
    } catch (e) {
      // Already-enrolled (409) still means the student has what they came
      // for -- treat it the same as success rather than showing an error
      // for something that isn't really a problem.
      const message = extractApiError(e, "");
      if (message.toLowerCase().includes("already")) {
        clearPendingCourse();
        router.push(`/enrolled?title=${encodeURIComponent(pending.title)}`);
        return;
      }
      setError(extractApiError(e, "Something went wrong completing your enrolment."));
    } finally {
      setIsPending(false);
    }
  };

  return { complete, isPending, error };
};
