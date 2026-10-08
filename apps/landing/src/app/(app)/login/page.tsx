"use client";

import Link from "next/link";
import { LoginForm } from "@mcc/features";
import { AuthCard } from "@/src/features/auth/AuthCard";
import { LEARNER_URL } from "@/src/config";

export default function LoginPage() {
  // Landing has no dashboard of its own -- hand off to the app that does.
  const handleSuccess = () => {
    window.location.href = `${LEARNER_URL}/login`;
  };

  return (
    <AuthCard>
      <LoginForm more={false} onSuccess={handleSuccess} />
      <p className="text-sm text-muted text-center pt-4">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
