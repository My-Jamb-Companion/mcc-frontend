"use client";

import {useRouter} from "next/navigation";
import {LoginForm} from "@mcc/features/auth";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      onSuccess={() => {
        router.push("/dashboard");
      }}
    />
  );
}
