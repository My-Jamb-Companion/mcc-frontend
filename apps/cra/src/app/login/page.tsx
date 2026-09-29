"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@mcc/features";
import { AuthCard } from "@/src/features/auth/AuthCard";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard>
      <LoginForm more={false} onSuccess={() => router.replace("/dashboard")} />
    </AuthCard>
  );
}
