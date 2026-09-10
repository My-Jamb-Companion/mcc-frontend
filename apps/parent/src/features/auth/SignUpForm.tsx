"use client";

import { useState } from "react";
import { Controller, FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useSignupParentAndChild } from "./useSignupParentAndChild";
import { ParentChildSignupInput } from "./signup.service";

const RELATIONSHIPS = [
  { label: "Parent", value: "parent" },
  { label: "Guardian", value: "guardian" },
  { label: "Other", value: "other" },
];

export const SignUpForm = () => {
  const signup = useSignupParentAndChild();
  const [submitted, setSubmitted] = useState<{ parentEmail: string } | null>(null);
  const { register, control, handleSubmit, formState, watch } = useForm<ParentChildSignupInput>({
    defaultValues: { relationship: "parent" },
  });

  const onSubmit = (data: ParentChildSignupInput) => {
    signup.mutate(data, {
      onSuccess: () => setSubmitted({ parentEmail: data.parent_email }),
    });
  };

  if (submitted) {
    return (
      <div className="text-center space-y-2">
        <h4 className="text-lg font-semibold">Check your email</h4>
        <p className="text-sm text-muted">
          We sent a verification link to <strong>{submitted.parentEmail}</strong>. Click it to
          activate your account — your child can log in right away with the password you set.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="mb-2">
        <h4 className="text-xl font-semibold">Create a parent account</h4>
        <p className="text-muted text-sm">One form sets up both your account and your child&apos;s.</p>
      </div>

      <p className="text-xs font-medium text-muted uppercase tracking-wide">Your details</p>
      <FormInputs
        label="Your full name"
        registration={register("parent_full_name")}
        errors={formState.errors.parent_full_name}
      />
      <FormInputs
        label="Your email"
        type="email"
        registration={register("parent_email", { required: "Required" })}
        errors={formState.errors.parent_email}
      />
      <FormInputs
        label="Your password"
        type="password"
        isPassword
        registration={register("parent_password", {
          required: "Required",
          minLength: { value: 6, message: "At least 6 characters" },
        })}
        errors={formState.errors.parent_password}
      />
      <Controller
        name="relationship"
        control={control}
        render={({ field }) => (
          <FormInputs
            label="Relationship to child"
            type="select"
            options={RELATIONSHIPS}
            value={field.value}
            onChange={field.onChange}
            errors={formState.errors.relationship}
          />
        )}
      />

      <p className="text-xs font-medium text-muted uppercase tracking-wide pt-2">Child&apos;s details</p>
      <FormInputs
        label="Child's full name"
        registration={register("child_full_name")}
        errors={formState.errors.child_full_name}
      />
      <FormInputs
        label="Child's email"
        type="email"
        registration={register("child_email", {
          required: "Required",
          validate: (value) =>
            value.toLowerCase() !== watch("parent_email")?.toLowerCase() ||
            "Must be different from your email",
        })}
        errors={formState.errors.child_email}
      />
      <FormInputs
        label="Set a password for your child"
        type="password"
        isPassword
        registration={register("child_password", {
          required: "Required",
          minLength: { value: 6, message: "At least 6 characters" },
        })}
        errors={formState.errors.child_password}
      />

      {signup.isError && (
        <p className="text-red-500 text-sm text-center">
          {extractApiError(signup.error, "Something went wrong. Please try again.")}
        </p>
      )}

      <Button type="submit" width="full" loading={signup.isPending}>
        Create accounts
      </Button>
    </form>
  );
};
