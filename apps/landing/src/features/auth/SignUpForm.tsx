"use client";

import { useState } from "react";
import Link from "next/link";
import { FieldError, useForm, FormInputs, useSignup } from "@mcc/features";
import { Button } from "@mcc/ui";
import { extractApiError } from "@mcc/api";

interface SignUpFormInputs {
  email: string;
  password: string;
}

export const SignUpForm = () => {
  const { signupMutation } = useSignup();
  const { register, formState, handleSubmit } = useForm<SignUpFormInputs>();
  const errors = formState.errors;
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const onSubmit = (data: SignUpFormInputs) => {
    signupMutation.mutate(data, {
      onSuccess: () => setSubmittedEmail(data.email),
    });
  };

  if (submittedEmail) {
    return (
      <div className="text-center space-y-3">
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-muted text-sm">
          We sent a verification link to <strong>{submittedEmail}</strong>. Click it,
          then come back and log in to finish enrolling.
        </p>
        <Link href="/login" className="text-primary text-sm hover:underline inline-block pt-2">
          I've verified — log in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Create your account</h2>
        <p className="text-muted text-sm">One step away from enrolling.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInputs
          label="Email"
          type="email"
          placeholder="Enter your email address"
          registration={register("email", { required: "Email is required" })}
          errors={errors.email as FieldError}
        />
        <FormInputs
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          })}
          errors={errors.password as FieldError}
          isPassword
        />
        {signupMutation.isError && (
          <p className="text-red-500 text-sm text-center">
            {extractApiError(signupMutation.error, "Could not create your account")}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full rounded-full"
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-muted text-center pt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};
