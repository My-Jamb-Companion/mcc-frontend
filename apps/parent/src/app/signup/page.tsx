import Link from "next/link";
import { SignUpForm } from "@/src/features/auth/SignUpForm";
import { AuthCard } from "@/src/features/auth/AuthCard";

export default function SignUpPage() {
  return (
    <AuthCard>
      <SignUpForm />
      <p className="text-sm text-muted text-center pt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
