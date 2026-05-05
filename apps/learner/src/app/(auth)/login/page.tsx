"use client";

import {useRouter} from "next/navigation";
import {LoginForm} from "@mcc/features";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      onSuccess={(user) => router.push(user.is_onboarded ? "/dashboard" : "/onboarding")}
    />
  );
}
