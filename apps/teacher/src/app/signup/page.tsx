"use client";

import { AuthCard } from "@/src/features/auth/AuthCard";
import { TeacherSignUpForm } from "@/src/features/registration/components/TeacherSignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard>
      <TeacherSignUpForm />
    </AuthCard>
  );
}
