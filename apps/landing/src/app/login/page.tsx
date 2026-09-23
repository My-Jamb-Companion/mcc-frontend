"use client";

import Link from "next/link";
import { LoginForm } from "@mcc/features";
import { useCourseStore } from "@mcc/store";
import { AuthCard } from "@/src/features/auth/AuthCard";
import { useCompleteEnrollment } from "@/src/features/enrollment/useCompleteEnrollment";
import { LEARNER_URL } from "@/src/config";

export default function LoginPage() {
  const pendingCourse = useCourseStore((s) => s.pendingCourse);
  const { complete, isPending, error } = useCompleteEnrollment();

  const handleSuccess = () => {
    if (pendingCourse) {
      complete(pendingCourse);
    } else {
      // Nothing pending -- this is a returning user with nothing to finish
      // here. Landing has no dashboard of its own; hand off to the app
      // that does.
      window.location.href = `${LEARNER_URL}/login`;
    }
  };

  return (
    <AuthCard>
      {pendingCourse && (
        <p className="text-sm text-muted text-center pb-4 border-b border-muted/20 mb-4">
          Log in to finish enrolling in <strong>{pendingCourse.title}</strong>.
        </p>
      )}
      {isPending ? (
        <p className="text-center text-sm text-muted py-8">Completing your enrolment…</p>
      ) : (
        <LoginForm more={false} onSuccess={handleSuccess} />
      )}
      {error && <p className="text-red-500 text-sm text-center pt-3">{error}</p>}
      <p className="text-sm text-muted text-center pt-4">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
