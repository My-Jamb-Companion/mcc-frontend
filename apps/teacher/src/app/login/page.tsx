"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@mcc/features";
import { AuthCard } from "@/src/features/auth/AuthCard";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard>
      <LoginForm more={false} onSuccess={() => router.replace("/dashboard")} />
      <p className="text-xs text-muted text-center pt-4">
        Teacher accounts are set up by an administrator. Contact support if you
        don&apos;t have login details yet.
      </p>
    </AuthCard>
  );
}
