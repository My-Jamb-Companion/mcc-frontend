"use client";

import Link from "next/link";
import { useState } from "react";
import { FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useTeacherRegistration } from "../hooks/useTeacherRegistration";
import { TeacherRegistrationInputs } from "../types";
import ApplicationUnderReview from "./ApplicationUnderReview";

export function TeacherSignUpForm() {
  const { register, formState, watch, getValues, handleSubmit } =
    useForm<TeacherRegistrationInputs>();
  const [submitted, setSubmitted] = useState(false);
  const errors = formState.errors;
  const { registerMutation } = useTeacherRegistration();
  const password = watch("password");

  const onSubmit = (data: TeacherRegistrationInputs) => {
    registerMutation.mutate(data, { onSuccess: () => setSubmitted(true) });
  };

  if (submitted) {
    return (
      <ApplicationUnderReview
        email={getValues("email") || ""}
        fullName={getValues("full_name") || ""}
      />
    );
  }

  return (
    <div>
      <div className="mt-2 mb-6">
        <h4 className="text-xl font-semibold">Create your teacher account</h4>
        <p className="text-muted text-sm">Join MCC and start teaching</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInputs
          label="Full name"
          type="text"
          placeholder="Enter your full name"
          registration={register("full_name", {
            required: "Full name is required",
            minLength: { value: 2, message: "Enter your full name" },
          })}
          errors={errors.full_name}
        />
        <FormInputs
          label="Email"
          type="email"
          placeholder="Enter your email address"
          registration={register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
          errors={errors.email}
        />
        <FormInputs
          label="Phone number"
          type="tel"
          placeholder="Enter your phone number"
          registration={register("phone_number", {
            required: "Phone number is required",
            pattern: {
              value: /^(\+234|0)[789][01]\d{8}$/,
              message: "Enter a valid Nigerian phone number",
            },
          })}
          errors={errors.phone_number}
        />
        <FormInputs
          label="Password"
          type="password"
          placeholder="Enter your password"
          registration={register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          })}
          errors={errors.password}
          isPassword
        />
        <FormInputs
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          registration={register("confirm_password", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match",
          })}
          errors={errors.confirm_password}
          isPassword
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agree_to_terms"
            className="mt-1"
            {...register("agree_to_terms", {
              validate: (v) => v === true || "You must accept the Terms to continue",
            })}
          />
          <label htmlFor="agree_to_terms" className="text-sm text-muted">
            I agree to the Terms of Use and Privacy Policy
          </label>
        </div>
        {errors.agree_to_terms && (
          <p className="text-red-400 text-xs">{errors.agree_to_terms.message}</p>
        )}

        {registerMutation.isError && (
          <p className="text-red-500 text-sm text-center">
            {extractApiError(registerMutation.error, "Something went wrong. Please try again.")}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          width="full"
          loading={registerMutation.isPending}
          loadingText="Submitting…"
        >
          Submit application
        </Button>
      </form>

      <p className="text-sm text-center font-medium text-muted mt-4">
        Already have an account?{" "}
        <Link href="/login" className="underline text-black dark:text-white hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
