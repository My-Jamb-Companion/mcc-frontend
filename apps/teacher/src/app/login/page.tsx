"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "@mcc/features";
import { AuthCard } from "@/src/features/auth/AuthCard";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard>
      <LoginForm more={false} onSuccess={() => router.replace("/dashboard")} />
      <p className="text-xs text-muted text-center pt-4">
        New teacher?{" "}
        <Link href="/signup" className="underline text-black dark:text-white hover:text-primary">
          Register here
        </Link>
        .
      </p>
    </AuthCard>
  );
}
