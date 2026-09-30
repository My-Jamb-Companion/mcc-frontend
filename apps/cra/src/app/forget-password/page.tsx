"use client";

import { ForgetPassword } from "@mcc/features";
import { AuthCard } from "@/src/features/auth/AuthCard";

export default function ForgetPasswordPage() {
  return (
    <AuthCard>
      <ForgetPassword />
    </AuthCard>
  );
}
