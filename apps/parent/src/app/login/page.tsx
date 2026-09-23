"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoginForm } from "@mcc/features";
import { AuthCard } from "@/src/features/auth/AuthCard";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthCard>
      <LoginForm more={false} onSuccess={() => router.replace("/children")} />
      <p className="text-sm text-muted text-center pt-4">
        New here?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create a parent account
        </Link>
      </p>
    </AuthCard>
  );
}
